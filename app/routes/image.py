from flask import Blueprint, request, jsonify
from PIL import Image
import requests
from io import BytesIO
import os
from werkzeug.utils import secure_filename
import imageio

image_bp = Blueprint('image', __name__)

@image_bp.route('/api/v1/image/process', methods=['POST'])
def process_image():
    try:
        data = request.get_json()
        url = data.get('url')
        options = data.get('options', {})

        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400

        # Download image
        response = requests.get(url)
        img = Image.open(BytesIO(response.content))

        # Process image based on options
        processed_image = process_image_with_options(img, options)
        
        # Save processed image
        output_filename = generate_filename(url, options)
        output_path = os.path.join('downloads', output_filename)
        processed_image.save(output_path)

        # Generate thumbnail if requested
        if options.get('extractThumbnail'):
            generate_thumbnail(img, output_path, options.get('thumbnailSize', '300x300'))

        return jsonify({
            'success': True,
            'downloadUrl': f'/download/{output_filename}',
            'filename': output_filename
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def process_image_with_options(img, options):
    # Convert format if needed
    if options.get('format') == 'png' and img.format != 'PNG':
        img = img.convert('RGBA')
    elif options.get('format') == 'jpeg' and img.format != 'JPEG':
        img = img.convert('RGB')

    # Resize if requested
    if options.get('resize'):
        width = options.get('width')
        height = options.get('height')
        if width and height:
            img = img.resize((int(width), int(height)), Image.LANCZOS)

    # Convert to GIF if requested
    if options.get('format') == 'gif' and options.get('convertToGif'):
        return convert_to_gif(img, options.get('gifOptions', {}))

    return img

def generate_thumbnail(img, original_path, size):
    width, height = map(int, size.split('x'))
    thumbnail = img.copy()
    thumbnail.thumbnail((width, height))
    
    thumbnail_path = original_path.replace('.', '_thumb.')
    thumbnail.save(thumbnail_path)

def convert_to_gif(img, gif_options):
    # Implementation for GIF conversion
    fps = gif_options.get('fps', 10)
    frames = []
    # Add GIF conversion logic here
    return img

def generate_filename(url, options):
    base_name = os.path.basename(url).split('?')[0]
    name = os.path.splitext(base_name)[0]
    ext = options.get('format', 'jpeg').lower()
    return secure_filename(f"{name}.{ext}") 