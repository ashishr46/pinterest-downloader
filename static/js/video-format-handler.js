class VideoFormatHandler {
    constructor() {
        this.formatSettings = {
            mp4: {
                label: 'MP4 (High Quality)',
                codecs: {
                    video: ['h264', 'h265'],
                    audio: ['aac', 'mp3']
                },
                container: 'mp4',
                quality: ['4k', '1080p', '720p', '480p'],
                premium: false
            },
            webm: {
                label: 'WebM',
                codecs: {
                    video: ['vp9', 'vp8'],
                    audio: ['opus', 'vorbis']
                },
                container: 'webm',
                quality: ['1080p', '720p', '480p'],
                premium: false
            },
            mov: {
                label: 'MOV',
                codecs: {
                    video: ['h264', 'prores'],
                    audio: ['aac', 'alac']
                },
                container: 'mov',
                quality: ['4k', '1080p', '720p'],
                premium: true
            },
            custom: {
                label: 'Custom Format',
                codecs: {
                    video: ['h264', 'h265', 'vp9', 'av1'],
                    audio: ['aac', 'mp3', 'opus', 'flac']
                },
                container: 'custom',
                quality: ['4k', '1080p', '720p', '480p'],
                premium: true
            }
        };

        this.initializeFormatUI();
        this.bindFormatEvents();
    }

    initializeFormatUI() {
        const formatPanelHTML = `
            <div class="video-format-panel">
                <h5>Video Format Settings</h5>
                
                <!-- Format Selection -->
                <div class="format-options">
                    ${this.generateFormatOptions()}
                </div>

                <!-- Codec Settings -->
                <div class="codec-settings mt-3">
                    <h6>Codec Settings</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <label>Video Codec</label>
                            <select class="form-select" id="videoCodec">
                                ${this.generateCodecOptions('video')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label>Audio Codec</label>
                            <select class="form-select" id="audioCodec">
                                ${this.generateCodecOptions('audio')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Advanced Format Settings -->
                <div class="advanced-format-settings mt-3">
                    <div class="settings-header d-flex justify-content-between">
                        <h6>Advanced Settings</h6>
                        <button class="btn btn-sm btn-outline-primary" id="toggleFormatAdvanced">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    
                    <div class="advanced-controls" style="display: none;">
                        <!-- Container Settings -->
                        <div class="container-settings mt-2">
                            <label>Container Format</label>
                            <select class="form-select" id="containerFormat">
                                <option value="mp4">MP4</option>
                                <option value="webm">WebM</option>
                                <option value="mov">MOV</option>
                                <option value="mkv">MKV</option>
                                <option value="avi">AVI</option>
                            </select>
                        </div>

                        <!-- Encoding Settings -->
                        <div class="encoding-settings mt-2">
                            <label>Encoding Preset</label>
                            <select class="form-select" id="encodingPreset">
                                <option value="ultrafast">Ultra Fast</option>
                                <option value="fast">Fast</option>
                                <option value="medium" selected>Medium</option>
                                <option value="slow">Slow (Better Quality)</option>
                                <option value="veryslow">Very Slow (Best Quality)</option>
                            </select>
                        </div>

                        <!-- Custom Parameters -->
                        <div class="custom-parameters mt-2">
                            <label>Custom FFmpeg Parameters</label>
                            <input type="text" class="form-control" id="customParams" 
                                   placeholder="-preset medium -crf 23">
                        </div>
                    </div>
                </div>

                <!-- Format Preview -->
                <div class="format-preview mt-3">
                    <h6>Format Information</h6>
                    <div class="preview-info">
                        <div class="format-details"></div>
                        <div class="codec-details"></div>
                        <div class="compatibility-info"></div>
                    </div>
                </div>
            </div>
        `;

        document.querySelector('#format-container').innerHTML = formatPanelHTML;
    }

    generateFormatOptions() {
        return Object.entries(this.formatSettings)
            .map(([key, settings]) => `
                <div class="format-option ${settings.premium ? 'premium' : ''}">
                    <input type="radio" class="btn-check" name="format" 
                           id="${key}" value="${key}" 
                           ${key === 'mp4' ? 'checked' : ''}>
                    <label class="btn btn-outline-primary" for="${key}">
                        ${settings.label}
                        ${settings.premium ? '<span class="premium-badge">PRO</span>' : ''}
                    </label>
                </div>
            `).join('');
    }

    generateCodecOptions(type) {
        const allCodecs = new Set();
        Object.values(this.formatSettings).forEach(format => {
            format.codecs[type].forEach(codec => allCodecs.add(codec));
        });

        return Array.from(allCodecs)
            .map(codec => `<option value="${codec}">${codec.toUpperCase()}</option>`)
            .join('');
    }

    bindFormatEvents() {
        // Format selection
        document.querySelectorAll('input[name="format"]').forEach(input => {
            input.addEventListener('change', (e) => this.updateFormatPreview(e.target.value));
        });

        // Codec changes
        document.getElementById('videoCodec').addEventListener('change', () => this.updateCodecPreview());
        document.getElementById('audioCodec').addEventListener('change', () => this.updateCodecPreview());

        // Toggle advanced settings
        document.getElementById('toggleFormatAdvanced').addEventListener('click', () => {
            const advancedControls = document.querySelector('.advanced-controls');
            advancedControls.style.display = 
                advancedControls.style.display === 'none' ? 'block' : 'none';
        });

        // Container format change
        document.getElementById('containerFormat').addEventListener('change', () => {
            this.updateCompatibilityInfo();
        });
    }

    updateFormatPreview(format) {
        const settings = this.formatSettings[format];
        const previewInfo = document.querySelector('.preview-info');
        
        previewInfo.innerHTML = `
            <div class="format-details">
                Format: ${settings.label}
                <br>
                Container: ${settings.container.toUpperCase()}
            </div>
            <div class="codec-details">
                Available Video Codecs: ${settings.codecs.video.join(', ').toUpperCase()}
                <br>
                Available Audio Codecs: ${settings.codecs.audio.join(', ').toUpperCase()}
            </div>
            <div class="compatibility-info">
                ${this.getCompatibilityInfo(format)}
            </div>
        `;
    }

    getCompatibilityInfo(format) {
        const compatibility = {
            mp4: 'Excellent compatibility across all devices',
            webm: 'Good compatibility with modern browsers',
            mov: 'Best for Apple devices and professional editing',
            custom: 'Compatibility depends on selected options'
        };
        return compatibility[format];
    }

    getSelectedFormat() {
        const selectedFormat = document.querySelector('input[name="format"]:checked');
        return {
            format: selectedFormat.value,
            settings: this.formatSettings[selectedFormat.value],
            videoCodec: document.getElementById('videoCodec').value,
            audioCodec: document.getElementById('audioCodec').value,
            container: document.getElementById('containerFormat').value,
            encodingPreset: document.getElementById('encodingPreset').value,
            customParams: document.getElementById('customParams').value
        };
    }
}

// Initialize video format handler
const videoFormatHandler = new VideoFormatHandler(); 