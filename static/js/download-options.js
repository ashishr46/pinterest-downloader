class DownloadOptionsManager {
    constructor() {
        this.currentFormat = 'mp4';
        this.currentQuality = '1080p';
        this.currentOptions = {
            audioOnly: false,
            convertToGif: false,
            extractThumbnail: false,
            customFilename: '',
            watermark: false
        };
        this.initializeListeners();
    }

    initializeListeners() {
        // Format selection
        document.querySelectorAll('.format-option').forEach(option => {
            option.addEventListener('change', (e) => this.updateFormat(e.target.value));
        });

        // Quality selection
        document.querySelectorAll('.quality-option').forEach(option => {
            option.addEventListener('change', (e) => this.updateQuality(e.target.value));
        });
    }

    async showAdvancedOptions() {
        const modalContent = `
            <div class="download-options">
                <!-- Format Options -->
                <div class="option-section">
                    <h5>Format Options</h5>
                    <div class="format-grid">
                        <div class="format-option">
                            <input type="radio" name="format" id="mp4" value="mp4" ${this.currentFormat === 'mp4' ? 'checked' : ''}>
                            <label for="mp4">
                                <i class="fas fa-video"></i>
                                MP4
                                <span class="badge bg-success">Recommended</span>
                            </label>
                        </div>
                        <div class="format-option">
                            <input type="radio" name="format" id="webm" value="webm" ${this.currentFormat === 'webm' ? 'checked' : ''}>
                            <label for="webm">
                                <i class="fas fa-film"></i>
                                WebM
                            </label>
                        </div>
                        <div class="format-option">
                            <input type="radio" name="format" id="gif" value="gif" ${this.currentFormat === 'gif' ? 'checked' : ''}>
                            <label for="gif">
                                <i class="fas fa-image"></i>
                                GIF
                            </label>
                        </div>
                        <div class="format-option">
                            <input type="radio" name="format" id="mp3" value="mp3" ${this.currentFormat === 'mp3' ? 'checked' : ''}>
                            <label for="mp3">
                                <i class="fas fa-music"></i>
                                MP3 (Audio)
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Quality Options -->
                <div class="option-section">
                    <h5>Quality Options</h5>
                    <div class="quality-grid">
                        <div class="quality-option">
                            <input type="radio" name="quality" id="4k" value="4k" 
                                   ${this.currentQuality === '4k' ? 'checked' : ''} 
                                   ${!featureManager.isPremium ? 'disabled' : ''}>
                            <label for="4k" class="${!featureManager.isPremium ? 'premium-locked' : ''}">
                                4K Ultra HD
                                ${!featureManager.isPremium ? '<span class="badge bg-warning">Premium</span>' : ''}
                            </label>
                        </div>
                        <div class="quality-option">
                            <input type="radio" name="quality" id="1080p" value="1080p" 
                                   ${this.currentQuality === '1080p' ? 'checked' : ''}>
                            <label for="1080p">1080p Full HD</label>
                        </div>
                        <div class="quality-option">
                            <input type="radio" name="quality" id="720p" value="720p" 
                                   ${this.currentQuality === '720p' ? 'checked' : ''}>
                            <label for="720p">720p HD</label>
                        </div>
                        <div class="quality-option">
                            <input type="radio" name="quality" id="480p" value="480p" 
                                   ${this.currentQuality === '480p' ? 'checked' : ''}>
                            <label for="480p">480p SD</label>
                        </div>
                    </div>
                </div>

                <!-- Advanced Options -->
                <div class="option-section">
                    <h5>Advanced Options</h5>
                    <div class="advanced-options">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="extractAudio" 
                                   ${this.currentOptions.audioOnly ? 'checked' : ''}>
                            <label class="form-check-label" for="extractAudio">
                                Extract Audio Only
                            </label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="convertGif" 
                                   ${this.currentOptions.convertToGif ? 'checked' : ''}>
                            <label class="form-check-label" for="convertGif">
                                Convert to GIF
                            </label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="extractThumbnail" 
                                   ${this.currentOptions.extractThumbnail ? 'checked' : ''}>
                            <label class="form-check-label" for="extractThumbnail">
                                Extract Thumbnail
                            </label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="addWatermark" 
                                   ${this.currentOptions.watermark ? 'checked' : ''}>
                            <label class="form-check-label" for="addWatermark">
                                Add Watermark
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Custom Filename -->
                <div class="option-section">
                    <h5>Custom Filename</h5>
                    <div class="input-group">
                        <input type="text" class="form-control" id="customFilename" 
                               placeholder="Enter custom filename (optional)"
                               value="${this.currentOptions.customFilename}">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="downloadOptionsManager.resetFilename()">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        `;

        featureManager.showModal('Download Options', modalContent, () => this.applyOptions());
    }

    async applyOptions() {
        const options = {
            format: document.querySelector('input[name="format"]:checked').value,
            quality: document.querySelector('input[name="quality"]:checked').value,
            audioOnly: document.getElementById('extractAudio').checked,
            convertToGif: document.getElementById('convertGif').checked,
            extractThumbnail: document.getElementById('extractThumbnail').checked,
            watermark: document.getElementById('addWatermark').checked,
            customFilename: document.getElementById('customFilename').value.trim()
        };

        try {
            const response = await fetch('/api/v1/download-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${featureManager.userToken}`
                },
                body: JSON.stringify(options)
            });

            if (!response.ok) throw new Error('Failed to save options');

            this.currentFormat = options.format;
            this.currentQuality = options.quality;
            this.currentOptions = {
                audioOnly: options.audioOnly,
                convertToGif: options.convertToGif,
                extractThumbnail: options.extractThumbnail,
                watermark: options.watermark,
                customFilename: options.customFilename
            };

            featureManager.modal.hide();
            this.showSuccessMessage();
        } catch (error) {
            this.showErrorMessage(error);
        }
    }

    resetFilename() {
        document.getElementById('customFilename').value = '';
    }

    showSuccessMessage() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
        alert.style.zIndex = '9999';
        alert.textContent = 'Download options saved successfully!';
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    showErrorMessage(error) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
        alert.style.zIndex = '9999';
        alert.textContent = `Error: ${error.message}`;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }
}

// Add styles
const styles = `
    .download-options {
        padding: 15px;
    }
    .option-section {
        margin-bottom: 20px;
    }
    .format-grid, .quality-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    .format-option, .quality-option {
        position: relative;
    }
    .format-option input, .quality-option input {
        display: none;
    }
    .format-option label, .quality-option label {
        display: block;
        padding: 10px;
        text-align: center;
        border: 2px solid #dee2e6;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .format-option input:checked + label,
    .quality-option input:checked + label {
        border-color: #0d6efd;
        background-color: #e7f1ff;
    }
    .premium-locked {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .advanced-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize download options manager
const downloadOptionsManager = new DownloadOptionsManager(); 