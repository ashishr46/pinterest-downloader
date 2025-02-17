from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Format, Quality, Download
from app.extensions import db
from datetime import datetime, timedelta

features = Blueprint('features', __name__)

@features.route('/formats', methods=['GET'])
@jwt_required()
def get_formats():
    formats = [
        {'id': 1, 'name': 'MP4', 'quality': 'High Quality'},
        {'id': 2, 'name': 'WebM', 'quality': 'Web Optimized'},
        {'id': 3, 'name': 'MOV', 'quality': 'Original'},
        {'id': 4, 'name': 'GIF', 'quality': 'Animated'},
    ]
    return jsonify(formats)

@features.route('/qualities', methods=['GET'])
@jwt_required()
def get_qualities():
    qualities = [
        {'id': 1, 'name': '480p SD', 'premium': False},
        {'id': 2, 'name': '720p HD', 'premium': False},
        {'id': 3, 'name': '1080p Full HD', 'premium': True},
        {'id': 4, 'name': '4K Ultra HD', 'premium': True},
    ]
    return jsonify(qualities)

@features.route('/user/premium-status', methods=['GET'])
@jwt_required()
def get_premium_status():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({'isPremium': user.is_premium})

@features.route('/download', methods=['POST'])
@jwt_required()
def process_download():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Validate input
        if not data.get('url'):
            return jsonify({'error': 'URL is required'}), 400

        # Check rate limits
        if not check_rate_limit(user_id):
            return jsonify({'error': 'Rate limit exceeded'}), 429

        # Process download
        download = Download(
            user_id=user_id,
            url=data['url'],
            format_id=data.get('format_id'),
            quality_id=data.get('quality_id')
        )
        db.session.add(download)
        db.session.commit()

        # Start async download process
        process_download_async.delay(download.id) # type: ignore

        return jsonify({
            'status': 'success',
            'download_id': download.id,
            'message': 'Download started'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def check_rate_limit(user_id):
    user = User.query.get(user_id)
    limit = 100 if user.is_premium else 10
    count = Download.query.filter_by(
        user_id=user_id
    ).filter(
        Download.created_at >= datetime.utcnow() - timedelta(hours=1)
    ).count()
    return count < limit