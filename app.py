from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
import re
import json
from app.routes.download import download_bp

app = Flask(__name__)
app.register_blueprint(download_bp)

def extract_video_url(pinterest_url):
    try:
        # Get the Pinterest page content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(pinterest_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find video metadata in the page
        video_data = soup.find('script', type='application/json')
        if video_data:
            data = json.loads(video_data.string)
            # Extract video URL from the JSON data
            # This is a simplified version - you'll need to adapt based on Pinterest's structure
            video_url = data.get('video_url')
            return video_url
        
        return None
    except Exception as e:
        return str(e)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_video():
    pinterest_url = request.json.get('url')
    if not pinterest_url:
        return jsonify({'error': 'No URL provided'}), 400
    
    video_url = extract_video_url(pinterest_url)
    if video_url:
        return jsonify({'video_url': video_url})
    else:
        return jsonify({'error': 'Could not extract video URL'}), 400

if __name__ == '__main__':
    app.run(debug=True) 