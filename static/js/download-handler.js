class DownloadHandler {
    constructor() {
        this.downloadQueue = [];
        this.isProcessing = false;
        this.currentDownload = null;
        this.API_ENDPOINT = '/api/v1/download';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Download button click
        document.getElementById('start-download').addEventListener('click', () => {
            this.handleDownload();
        });

        // URL input paste
        document.getElementById('pinterest-url').addEventListener('paste', (e) => {
            this.handleUrlPaste(e);
        });

        // Format selection
        document.querySelectorAll('[data-option]').forEach(element => {
            element.addEventListener('change', (e) => {
                this.updateOption(e.target.dataset.option, e.target.value);
            });
        });
    }

    async handleDownload() {
        const url = document.getElementById('pinterest-url').value.trim();
        if (!url) {
            this.showError('Please enter a Pinterest URL');
            return;
        }

        try {
            this.showProgress();
            const downloadInfo = await this.processDownload(url);
            
            if (downloadInfo.success) {
                this.initiateFileDownload(downloadInfo.downloadUrl, downloadInfo.filename);
                this.showSuccess('Download completed successfully!');
            } else {
                throw new Error(downloadInfo.error || 'Download failed');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideProgress();
        }
    }

    async processDownload(url) {
        const options = this.gatherOptions();
        
        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    options: options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Download processing error:', error);
            throw new Error('Failed to process download request');
        }
    }

    gatherOptions() {
        const options = {};
        
        // Gather all options from form elements
        document.querySelectorAll('[data-option]').forEach(element => {
            const optionPath = element.dataset.option;
            let value;

            if (element.type === 'checkbox') {
                value = element.checked;
            } else if (element.type === 'range') {
                value = parseInt(element.value);
            } else {
                value = element.value;
            }

            this.setNestedValue(options, optionPath, value);
        });

        return options;
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    initiateFileDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'pinterest_download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    showProgress() {
        const progressSection = document.querySelector('.progress-section');
        progressSection.style.display = 'block';
        this.updateProgress(0, 'Initializing download...');
    }

    hideProgress() {
        const progressSection = document.querySelector('.progress-section');
        progressSection.style.display = 'none';
    }

    updateProgress(percentage, status) {
        const progressBar = document.querySelector('.progress-bar');
        const progressStatus = document.querySelector('.progress-status');
        const progressPercentage = document.querySelector('.progress-percentage');

        progressBar.style.width = `${percentage}%`;
        progressStatus.textContent = status;
        progressPercentage.textContent = `${percentage}%`;
    }

    showSuccess(message) {
        const alert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        this.showAlert(alert);
    }

    showError(message) {
        const alert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        this.showAlert(alert);
    }

    showAlert(alertHTML) {
        const alertsContainer = document.querySelector('.alerts-container') || 
            document.createElement('div');
        
        if (!document.querySelector('.alerts-container')) {
            alertsContainer.className = 'alerts-container';
            document.querySelector('.complete-downloader').prepend(alertsContainer);
        }

        alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
    }
}

// Initialize the download handler
const downloadHandler = new DownloadHandler(); 