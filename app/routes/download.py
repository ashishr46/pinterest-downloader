from flask import Blueprint, request, jsonify, send_file
import requests
from bs4 import BeautifulSoup
import os
import youtube_dl
from werkzeug.utils import secure_filename

download_bp = Blueprint('download', __name__)

@download_bp.route('/api/v1/download', methods=['POST'])
def process_download():
    try:
        data = request.get_json()
        url = data.get('url')
        options = data.get('options', {})

        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400

        # Validate Pinterest URL
        if not is_valid_pinterest_url(url):
            return jsonify({'success': False, 'error': 'Invalid Pinterest URL'}), 400

        # Get video information
        video_info = get_video_info(url)
        if not video_info:
            return jsonify({'success': False, 'error': 'Could not extract video information'}), 400

        # Process download with options
        download_path = process_download_with_options(video_info, options)
        
        if download_path:
            return jsonify({
                'success': True,
                'downloadUrl': f'/download/{os.path.basename(download_path)}',
                'filename': os.path.basename(download_path)
            })
        else:
            return jsonify({'success': False, 'error': 'Download processing failed'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def is_valid_pinterest_url(url):
    return 'pinterest.com' in url and '/pin/' in url

def get_video_info(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find video metadata
        video_data = soup.find('meta', property='og:video')
        if video_data:
            return {
                'url': video_data.get('content'),
                'title': soup.find('meta', property='og:title').get('content', 'pinterest_video'),
                'type': soup.find('meta', property='og:type').get('content', 'video')
            }
        return None
    except Exception as e:
        print(f"Error getting video info: {e}")
        return None

def process_download_with_options(video_info, options):
    try:
        # Configure youtube-dl options
        ydl_opts = {
            'format': get_format_string(options),
            'outtmpl': get_output_template(video_info, options),
            'quiet': True,
            'no_warnings': True
        }

        # Add post-processing options
        if options.get('postProcessing'):
            add_post_processing_options(ydl_opts, options['postProcessing'])

        # Download the video
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_info['url']])

        return ydl_opts['outtmpl']

    except Exception as e:
        print(f"Error processing download: {e}")
        return None

def get_format_string(options):
    quality_map = {
        '4k': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
        '1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        '720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
        '480p': 'bestvideo[height<=480]+bestaudio/best[height<=480]'
    }
    
    return quality_map.get(options.get('videoQuality'), 'best')

def get_output_template(video_info, options):
    filename = options.get('filenameTemplate', '{title}_{quality}')
    filename = filename.replace('{title}', secure_filename(video_info['title']))
    filename = filename.replace('{quality}', options.get('videoQuality', ''))
    
    output_path = options.get('outputPath', 'downloads')
    if not os.path.exists(output_path):
        os.makedirs(output_path)
        
    return os.path.join(output_path, f"{filename}.%(ext)s")

def add_post_processing_options(ydl_opts, post_processing):
    if post_processing.get('trim', {}).get('enabled'):
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }]
        ydl_opts['postprocessor_args'] = [
            '-ss', str(post_processing['trim']['start']),
            '-t', str(post_processing['trim']['end'])
        ]

    # Add other post-processing options as needed 