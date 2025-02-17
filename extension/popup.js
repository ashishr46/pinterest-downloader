document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const batchBtn = document.getElementById('batchBtn');
    const status = document.getElementById('status');

    // Check if we're on a Pinterest page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const isPinterest = tabs[0].url.includes('pinterest.com');
        downloadBtn.disabled = !isPinterest;
        
        if (!isPinterest) {
            status.textContent = 'Please navigate to a Pinterest page';
            status.style.backgroundColor = '#fff3cd';
        }
    });

    downloadBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentVideo' }, (response) => {
                if (response && response.videoUrl) {
                    chrome.runtime.sendMessage({
                        action: 'downloadVideo',
                        url: response.videoUrl
                    });
                    status.textContent = 'Download started...';
                    status.style.backgroundColor = '#d4edda';
                } else {
                    status.textContent = 'No video found on this page';
                    status.style.backgroundColor = '#f8d7da';
                }
            });
        });
    });

    batchBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('batch.html') });
    });
}); 