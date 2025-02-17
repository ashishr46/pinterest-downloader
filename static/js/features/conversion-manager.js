class ConversionManager {
    constructor() {
        this.supportedFormats = {
            video: ['mp4', 'webm', 'mov', 'avi'],
            audio: ['mp3', 'wav', 'aac', 'ogg'],
            image: ['gif', 'jpg', 'png', 'webp']
        };
    }

    async convertFormat(file, targetFormat) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', targetFormat);

        const response = await fetch('/api/v1/convert', {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }
} 