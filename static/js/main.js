function startBatchDownload() {
    const urls = document.getElementById('batch-urls').value
        .split('\n')
        .filter(url => url.trim());
    
    if (urls.length === 0) {
        alert('Please enter at least one URL');
        return;
    }

    batchManager.addUrls(urls);
} 