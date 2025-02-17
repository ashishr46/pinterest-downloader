class PinterestDownloader {
    constructor() {
        this.options = {
            format: 'mp4',
            quality: '1080p',
            audioOnly: false,
            watermark: false,
            customFilename: '',
            downloadPath: '',
            subtitles: false,
            thumbnail: false,
            metadata: true
        };
        
        this.downloadQueue = [];
        this.isProcessing = false;
        this.maxConcurrentDownloads = 3;
        
        this.initializeUI();
        this.bindEvents();
    }

    initializeUI() {
        const downloadSection = `
            <div class="download-container">
                <!-- Main Download Panel -->
                <div class="download-panel">
                    <div class="url-input-section">
                        <input type="text" id="pinterest-url" 
                               class="form-control form-control-lg" 
                               placeholder="Paste Pinterest URL here">
                        <button class="btn btn-primary btn-lg" id="start-download">
                            Download
                        </button>
                    </div>

                    <!-- Quick Options Bar -->
                    <div class="quick-options">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary active" data-format="mp4">
                                <i class="fas fa-video"></i> MP4
                            </button>
                            <button class="btn btn-outline-primary" data-format="gif">
                                <i class="fas fa-image"></i> GIF
                            </button>
                            <button class="btn btn-outline-primary" data-format="mp3">
                                <i class="fas fa-music"></i> MP3
                            </button>
                        </div>
                        <select class="form-select" id="quality-select">
                            <option value="auto">Auto Quality</option>
                            <option value="4k">4K Ultra HD</option>
                            <option value="1080p">1080p Full HD</option>
                            <option value="720p">720p HD</option>
                            <option value="480p">480p SD</option>
                        </select>
                    </div>

                    <!-- Advanced Options Panel -->
                    <div class="advanced-options-panel" style="display: none;">
                        <div class="row">
                            <!-- Format Options -->
                            <div class="col-md-4">
                                <div class="option-group">
                                    <h5>Format Options</h5>
                                    <div class="format-grid">
                                        <div class="format-option">
                                            <input type="radio" name="format" id="format-mp4" value="mp4" checked>
                                            <label for="format-mp4">
                                                <i class="fas fa-video"></i>
                                                <span>MP4</span>
                                                <small>Best Quality</small>
                                            </label>
                                        </div>
                                        <div class="format-option">
                                            <input type="radio" name="format" id="format-webm" value="webm">
                                            <label for="format-webm">
                                                <i class="fas fa-film"></i>
                                                <span>WebM</span>
                                                <small>Web Optimized</small>
                                            </label>
                                        </div>
                                        <div class="format-option">
                                            <input type="radio" name="format" id="format-gif" value="gif">
                                            <label for="format-gif">
                                                <i class="fas fa-image"></i>
                                                <span>GIF</span>
                                                <small>Animated</small>
                                            </label>
                                        </div>
                                        <div class="format-option">
                                            <input type="radio" name="format" id="format-mp3" value="mp3">
                                            <label for="format-mp3">
                                                <i class="fas fa-music"></i>
                                                <span>MP3</span>
                                                <small>Audio Only</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Quality & Size -->
                            <div class="col-md-4">
                                <div class="option-group">
                                    <h5>Quality Settings</h5>
                                    <div class="quality-options">
                                        <div class="quality-slider">
                                            <label>Video Quality</label>
                                            <input type="range" class="form-range" min="0" max="3" step="1" 
                                                   id="quality-slider">
                                            <div class="quality-labels">
                                                <span>480p</span>
                                                <span>720p</span>
                                                <span>1080p</span>
                                                <span>4K</span>
                                            </div>
                                        </div>
                                        <div class="file-size-estimate">
                                            Estimated Size: <span id="size-estimate">~0 MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Additional Options -->
                            <div class="col-md-4">
                                <div class="option-group">
                                    <h5>Additional Options</h5>
                                    <div class="additional-options">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="extract-audio">
                                            <label class="form-check-label" for="extract-audio">
                                                Extract Audio
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="download-thumbnail">
                                            <label class="form-check-label" for="download-thumbnail">
                                                Download Thumbnail
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="add-watermark">
                                            <label class="form-check-label" for="add-watermark">
                                                Add Watermark
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="include-metadata">
                                            <label class="form-check-label" for="include-metadata">
                                                Include Metadata
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Filename -->
                        <div class="filename-section mt-3">
                            <div class="input-group">
                                <span class="input-group-text">Custom Filename</span>
                                <input type="text" class="form-control" id="custom-filename" 
                                       placeholder="Enter custom filename (optional)">
                                <button class="btn btn-outline-secondary" type="button" id="reset-filename">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Download Progress -->
                    <div class="download-progress" style="display: none;">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-status">Preparing download...</span>
                            <span class="progress-percentage">0%</span>
                        </div>
                    </div>
                </div>

                <!-- Download Queue -->
                <div class="download-queue" style="display: none;">
                    <h5>Download Queue</h5>
                    <div class="queue-items"></div>
                </div>
            </div>
        `;

        document.querySelector('#download-section').innerHTML = downloadSection;
    }

    bindEvents() {
        // URL input and download button
        document.getElementById('start-download').addEventListener('click', () => this.startDownload());
        document.getElementById('pinterest-url').addEventListener('paste', (e) => this.handleUrlPaste(e));

        // Quick options
        document.querySelectorAll('.quick-options .btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateQuickFormat(e));
        });

        // Quality slider
        document.getElementById('quality-slider').addEventListener('input', (e) => this.updateQualityEstimate(e));

        // Format options
        document.querySelectorAll('input[name="format"]').forEach(input => {
            input.addEventListener('change', (e) => this.updateFormat(e));
        });

        // Additional options
        document.querySelectorAll('.additional-options input').forEach(input => {
            input.addEventListener('change', (e) => this.updateAdditionalOptions(e));
        });
    }

    async startDownload() {
        const url = document.getElementById('pinterest-url').value.trim();
        if (!url) {
            this.showError('Please enter a Pinterest URL');
            return;
        }

        try {
            this.showProgress();
            const downloadInfo = await this.processDownload(url);
            this.updateProgress(100);
            this.showSuccess(downloadInfo);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async processDownload(url) {
        // Implement actual download logic here
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    filename: 'pinterest_video.mp4',
                    size: '10.5 MB',
                    format: this.options.format,
                    quality: this.options.quality
                });
            }, 2000);
        });
    }

    // UI Update Methods
    updateQuickFormat(e) {
        const format = e.target.dataset.format;
        this.options.format = format;
        
        // Update UI
        document.querySelectorAll('.quick-options .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }

    updateQualityEstimate(e) {
        const qualities = ['480p', '720p', '1080p', '4K'];
        this.options.quality = qualities[e.target.value];
        
        // Update size estimate
        const sizeEstimates = {
            '480p': '5 MB',
            '720p': '10 MB',
            '1080p': '20 MB',
            '4K': '50 MB'
        };
        document.getElementById('size-estimate').textContent = sizeEstimates[this.options.quality];
    }

    // UI Feedback Methods
    showProgress() {
        const progressDiv = document.querySelector('.download-progress');
        progressDiv.style.display = 'block';
    }

    updateProgress(percentage) {
        const progressBar = document.querySelector('.progress-bar');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

    showSuccess(info) {
        const alert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Download completed: ${info.filename} (${info.size})
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.querySelector('.download-container').insertAdjacentHTML('afterbegin', alert);
    }

    showError(message) {
        const alert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.querySelector('.download-container').insertAdjacentHTML('afterbegin', alert);
    }
}

// Initialize the downloader
const pinterestDownloader = new PinterestDownloader(); 