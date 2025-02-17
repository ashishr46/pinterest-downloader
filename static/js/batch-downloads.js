class BatchDownloadManager {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.maxConcurrent = 3;
        this.activeDownloads = 0;
    }

    async addUrls(urls) {
        const validUrls = await this.validateUrls(urls);
        this.queue.push(...validUrls);
        this.updateQueueUI();
        
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async validateUrls(urls) {
        const validUrls = [];
        const urlPattern = /^https:\/\/(www\.)?pinterest\.[a-z]+\/pin\/[\w-]+/;

        for (const url of urls) {
            if (urlPattern.test(url.trim())) {
                validUrls.push(url.trim());
            }
        }

        return validUrls;
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.queue.length > 0 && this.activeDownloads < this.maxConcurrent) {
            const url = this.queue.shift();
            this.activeDownloads++;
            
            this.processDownload(url).finally(() => {
                this.activeDownloads--;
                this.updateQueueUI();
            });
        }

        this.isProcessing = this.activeDownloads > 0;
        this.updateQueueUI();
    }

    updateQueueUI() {
        const queueStatus = document.getElementById('queue-status');
        if (queueStatus) {
            queueStatus.innerHTML = `
                <div class="queue-info">
                    <span class="badge bg-primary">Queue: ${this.queue.length}</span>
                    <span class="badge bg-success">Active: ${this.activeDownloads}</span>
                </div>
            `;
        }
    }
}

// Initialize batch download manager
const batchManager = new BatchDownloadManager(); 