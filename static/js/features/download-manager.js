class DownloadManager {
    constructor() {
        this.options = {
            format: 'mp4',
            quality: '1080p',
            audioOnly: false,
            watermark: false,
            thumbnail: false,
            subtitles: false
        };
        this.queue = [];
    }

    async processDownload(url, options = {}) {
        try {
            const downloadOptions = { ...this.options, ...options };
            const response = await fetch('/api/v1/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, options: downloadOptions })
            });
            return await response.json();
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }
} 