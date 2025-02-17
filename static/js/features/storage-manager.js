class StorageManager {
    constructor() {
        this.quotaLimit = 1024 * 1024 * 100; // 100MB for free users
        this.files = [];
    }

    async checkStorage() {
        const response = await fetch('/api/v1/storage/status');
        return await response.json();
    }

    async uploadToCloud(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/v1/storage/upload', {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }
} 