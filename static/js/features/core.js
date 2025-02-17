class FeatureCore {
    constructor() {
        this.features = {
            download: new DownloadManager(),
            batch: new BatchManager(),
            conversion: new ConversionManager(),
            account: new AccountManager(),
            storage: new StorageManager()
        };
        this.initializeFeatures();
    }

    async initializeFeatures() {
        await this.checkUserStatus();
        this.setupUI();
        this.bindEvents();
    }

    async checkUserStatus() {
        const response = await fetch('/api/v1/user/status');
        const status = await response.json();
        this.updateUIBasedOnStatus(status);
    }
} 