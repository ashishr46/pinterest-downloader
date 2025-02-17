class QualityHandler {
    constructor() {
        this.qualitySettings = {
            '4k': {
                resolution: '3840x2160',
                bitrate: '45000k',
                label: '4K (2160p)',
                premium: true
            },
            '1080p': {
                resolution: '1920x1080',
                bitrate: '8000k',
                label: 'Full HD (1080p)'
            },
            '720p': {
                resolution: '1280x720',
                bitrate: '5000k',
                label: 'HD (720p)'
            },
            '480p': {
                resolution: '854x480',
                bitrate: '2500k',
                label: 'SD (480p)'
            }
        };

        this.initializeQualityUI();
        this.bindQualityEvents();
    }

    initializeQualityUI() {
        const qualityPanelHTML = `
            <div class="quality-settings-panel">
                <h5>Quality Settings</h5>
                
                <!-- Quality Selection -->
                <div class="quality-options">
                    ${this.generateQualityOptions()}
                </div>

                <!-- Advanced Quality Settings -->
                <div class="advanced-quality-settings mt-3">
                    <div class="settings-header d-flex justify-content-between">
                        <h6>Advanced Settings</h6>
                        <button class="btn btn-sm btn-outline-primary" id="toggleAdvanced">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    
                    <div class="advanced-controls" style="display: none;">
                        <!-- Bitrate Control -->
                        <div class="bitrate-control mt-2">
                            <label>Bitrate</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="bitrate" 
                                       min="1000" step="500">
                                <span class="input-group-text">kbps</span>
                            </div>
                        </div>

                        <!-- Frame Rate -->
                        <div class="framerate-control mt-2">
                            <label>Frame Rate</label>
                            <select class="form-select" id="framerate">
                                <option value="auto">Auto</option>
                                <option value="60">60 FPS</option>
                                <option value="30">30 FPS</option>
                                <option value="24">24 FPS</option>
                            </select>
                        </div>

                        <!-- HDR Options -->
                        <div class="hdr-control mt-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="hdrEnabled">
                                <label class="form-check-label" for="hdrEnabled">
                                    Enable HDR (when available)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quality Preview -->
                <div class="quality-preview mt-3">
                    <h6>Quality Preview</h6>
                    <div class="preview-info">
                        <div class="resolution-preview"></div>
                        <div class="bitrate-preview"></div>
                        <div class="size-estimate"></div>
                    </div>
                </div>
            </div>
        `;

        document.querySelector('#quality-container').innerHTML = qualityPanelHTML;
    }

    generateQualityOptions() {
        return Object.entries(this.qualitySettings)
            .map(([key, settings]) => `
                <div class="quality-option ${settings.premium ? 'premium' : ''}">
                    <input type="radio" class="btn-check" name="quality" 
                           id="${key}" value="${key}" 
                           ${key === '1080p' ? 'checked' : ''}>
                    <label class="btn btn-outline-primary" for="${key}">
                        ${settings.label}
                        ${settings.premium ? '<span class="premium-badge">PRO</span>' : ''}
                    </label>
                </div>
            `).join('');
    }

    bindQualityEvents() {
        // Quality selection
        document.querySelectorAll('input[name="quality"]').forEach(input => {
            input.addEventListener('change', (e) => this.updateQualityPreview(e.target.value));
        });

        // Toggle advanced settings
        document.getElementById('toggleAdvanced').addEventListener('click', () => {
            const advancedControls = document.querySelector('.advanced-controls');
            advancedControls.style.display = 
                advancedControls.style.display === 'none' ? 'block' : 'none';
        });

        // Bitrate change
        document.getElementById('bitrate').addEventListener('input', (e) => {
            this.updateBitratePreview(e.target.value);
        });

        // Frame rate change
        document.getElementById('framerate').addEventListener('change', (e) => {
            this.updateFrameRatePreview(e.target.value);
        });
    }

    updateQualityPreview(quality) {
        const settings = this.qualitySettings[quality];
        const previewInfo = document.querySelector('.preview-info');
        
        previewInfo.innerHTML = `
            <div class="resolution-preview">
                Resolution: ${settings.resolution}
            </div>
            <div class="bitrate-preview">
                Bitrate: ${settings.bitrate}
            </div>
            <div class="size-estimate">
                Estimated Size: ${this.calculateSizeEstimate(settings)}
            </div>
        `;
    }

    calculateSizeEstimate(settings) {
        const bitrateKbps = parseInt(settings.bitrate);
        const minutes = 1; // Assume 1-minute video for estimate
        const sizeInMB = (bitrateKbps * 60 * minutes) / (8 * 1024);
        return `${sizeInMB.toFixed(1)} MB/minute`;
    }

    getSelectedQuality() {
        const selectedQuality = document.querySelector('input[name="quality"]:checked');
        return this.qualitySettings[selectedQuality.value];
    }
}

// Initialize quality handler
const qualityHandler = new QualityHandler(); 