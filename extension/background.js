// Background script for the browser extension
class PinterestDownloaderExtension {
    constructor() {
        this.initializeContextMenu();
        this.setupMessageListeners();
        this.apiEndpoint = 'https://your-api-domain.com/api/v1';
    }

    initializeContextMenu() {
        chrome.contextMenus.create({
            id: 'downloadPinterestVideo',
            title: 'Download Pinterest Video',
            contexts: ['link', 'video'],
            documentUrlPatterns: ['https://*.pinterest.com/*']
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'downloadPinterestVideo') {
                this.handleDownload(info.linkUrl || info.srcUrl, tab);
            }
        });
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'downloadVideo') {
                this.handleDownload(request.url, sender.tab);
                sendResponse({ status: 'processing' });
            }
        });
    }

    async handleDownload(url, tab) {
        try {
            // Show download progress
            chrome.action.setBadgeText({ text: '↓', tabId: tab.id });
            
            // Get download URL from API
            const response = await fetch(`${this.apiEndpoint}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const data = await response.json();
            
            // Start download
            chrome.downloads.download({
                url: data.downloadUrl,
                filename: data.filename,
                saveAs: true
            });

            // Update UI
            chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
            }, 3000);

        } catch (error) {
            console.error('Download error:', error);
            chrome.action.setBadgeText({ text: '×', tabId: tab.id });
            this.showError(tab.id);
        }
    }

    async getAuthToken() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['authToken'], (result) => {
                resolve(result.authToken);
            });
        });
    }

    showError(tabId) {
        chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId });
        setTimeout(() => {
            chrome.action.setBadgeText({ text: '', tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#000000', tabId });
        }, 3000);
    }
}

// Initialize extension
const extension = new PinterestDownloaderExtension(); 