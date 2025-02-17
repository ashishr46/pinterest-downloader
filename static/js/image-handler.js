class ImageHandler {
    constructor() {
        this.options = {
            format: 'jpeg',
            quality: 100,
            resize: false,
            width: null,
            height: null,
            extractThumbnail: false,
            thumbnailSize: '300x300',
            convertToGif: false,
            gifOptions: {
                fps: 10,
                loop: true,
                optimize: true
            }
        };
        
        this.initializeImageOptions();
        this.bindEvents();
    }

    initializeImageOptions() {
        const imageOptionsHTML = `
            <div class="image-options-panel">
                <!-- Format Selection -->
                <div class="format-selection">
                    <h5>Image Format</h5>
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" name="format" id="jpeg" value="jpeg" checked>
                        <label class="btn btn-outline-primary" for="jpeg">JPEG</label>
                        
                        <input type="radio" class="btn-check" name="format" id="png" value="png">
                        <label class="btn btn-outline-primary" for="png">PNG</label>
                        
                        <input type="radio" class="btn-check" name="format" id="gif" value="gif">
                        <label class="btn btn-outline-primary" for="gif">GIF</label>
                    </div>
                </div>

                <!-- Quality Control -->
                <div class="quality-control mt-3">
                    <h5>Quality</h5>
                    <input type="range" class="form-range" id="quality" 
                           min="1" max="100" value="100">
                    <div class="quality-value">100%</div>
                </div>

                <!-- Size Options -->
                <div class="size-options mt-3">
                    <h5>Size Options</h5>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="resize">
                        <label class="form-check-label" for="resize">
                            Custom Size
                        </label>
                    </div>
                    <div class="size-inputs" style="display: none;">
                        <div class="input-group mt-2">
                            <input type="number" class="form-control" id="width" 
                                   placeholder="Width">
                            <span class="input-group-text">×</span>
                            <input type="number" class="form-control" id="height" 
                                   placeholder="Height">
                        </div>
                    </div>
                </div>

                <!-- Thumbnail Extraction -->
                <div class="thumbnail-options mt-3">
                    <h5>Thumbnail</h5>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="extractThumbnail">
                        <label class="form-check-label" for="extractThumbnail">
                            Extract Thumbnail
                        </label>
                    </div>
                    <select class="form-select mt-2" id="thumbnailSize" disabled>
                        <option value="300x300">300 × 300</option>
                        <option value="600x600">600 × 600</option>
                        <option value="1200x1200">1200 × 1200</option>
                    </select>
                </div>

                <!-- GIF Options -->
                <div class="gif-options mt-3" style="display: none;">
                    <h5>GIF Settings</h5>
                    <div class="mb-2">
                        <label>FPS</label>
                        <input type="number" class="form-control" id="fps" 
                               value="10" min="1" max="30">
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="loop" checked>
                        <label class="form-check-label" for="loop">
                            Loop GIF
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="optimize" checked>
                        <label class="form-check-label" for="optimize">
                            Optimize GIF
                        </label>
                    </div>
                </div>

                <!-- Batch Download -->
                <div class="batch-options mt-3">
                    <h5>Batch Download</h5>
                    <textarea class="form-control" id="batchUrls" 
                              placeholder="Enter Pinterest image URLs (one per line)"></textarea>
                    <button class="btn btn-primary mt-2" id="startBatch">
                        Start Batch Download
                    </button>
                </div>
            </div>
        `;

        document.querySelector('#image-options-container').innerHTML = imageOptionsHTML;
    }

    bindEvents() {
        // Format selection
        document.querySelectorAll('input[name="format"]').forEach(input => {
            input.addEventListener('change', (e) => this.updateFormat(e));
        });

        // Quality control
        document.getElementById('quality').addEventListener('input', (e) => {
            this.options.quality = e.target.value;
            document.querySelector('.quality-value').textContent = `${e.target.value}%`;
        });

        // Resize toggle
        document.getElementById('resize').addEventListener('change', (e) => {
            document.querySelector('.size-inputs').style.display = 
                e.target.checked ? 'block' : 'none';
            this.options.resize = e.target.checked;
        });

        // Thumbnail options
        document.getElementById('extractThumbnail').addEventListener('change', (e) => {
            document.getElementById('thumbnailSize').disabled = !e.target.checked;
            this.options.extractThumbnail = e.target.checked;
        });

        // Batch download
        document.getElementById('startBatch').addEventListener('click', () => {
            this.startBatchDownload();
        });
    }

    async startBatchDownload() {
        const urls = document.getElementById('batchUrls').value
            .split('\n')
            .filter(url => url.trim());

        if (urls.length === 0) {
            this.showError('Please enter at least one URL');
            return;
        }

        try {
            this.showProgress();
            for (let i = 0; i < urls.length; i++) {
                const progress = ((i + 1) / urls.length) * 100;
                await this.processImageDownload(urls[i]);
                this.updateProgress(progress);
            }
            this.showSuccess('Batch download completed!');
        } catch (error) {
            this.showError(error.message);
        }
    }

    async processImageDownload(url) {
        try {
            const response = await fetch('/api/v1/image/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    options: this.options
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process image');
            }

            const data = await response.json();
            if (data.success) {
                this.downloadFile(data.downloadUrl, data.filename);
            }
        } catch (error) {
            throw new Error(`Failed to process ${url}: ${error.message}`);
        }
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // UI feedback methods
    showProgress() {
        // Implementation similar to download-handler.js
    }

    updateProgress(percentage) {
        // Implementation similar to download-handler.js
    }

    showSuccess(message) {
        // Implementation similar to download-handler.js
    }

    showError(message) {
        // Implementation similar to download-handler.js
    }
}

// Initialize the image handler
const imageHandler = new ImageHandler(); 