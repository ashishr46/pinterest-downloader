class VideoToolsHandler {
    constructor() {
        this.currentVideo = null;
        this.videoPlayer = null;
        this.toolSettings = {
            trimming: {
                startTime: 0,
                endTime: 0,
                duration: 0
            },
            editing: {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                volume: 100
            },
            metadata: {
                title: '',
                description: '',
                tags: [],
                customFields: {}
            }
        };

        this.initializeToolsUI();
        this.bindToolEvents();
    }

    initializeToolsUI() {
        const toolsPanelHTML = `
            <div class="video-tools-panel">
                <!-- Tools Navigation -->
                <ul class="nav nav-tabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" data-bs-toggle="tab" href="#trimming">
                            <i class="fas fa-cut"></i> Trimming
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#editing">
                            <i class="fas fa-edit"></i> Basic Editing
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#conversion">
                            <i class="fas fa-sync"></i> Conversion
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#metadata">
                            <i class="fas fa-tags"></i> Metadata
                        </a>
                    </li>
                </ul>

                <!-- Tools Content -->
                <div class="tab-content">
                    <!-- Video Preview -->
                    <div class="video-preview-container mb-3">
                        <video id="videoPreview" controls>
                            Your browser doesn't support video playback.
                        </video>
                    </div>

                    <!-- Trimming Tool -->
                    <div class="tab-pane fade show active" id="trimming">
                        <div class="trimming-controls">
                            <div class="timeline-container">
                                <div class="timeline-slider"></div>
                                <div class="time-markers">
                                    <span class="start-time">00:00</span>
                                    <span class="end-time">00:00</span>
                                </div>
                            </div>
                            <div class="trim-controls mt-3">
                                <button class="btn btn-primary" id="setStartTime">
                                    Set Start
                                </button>
                                <button class="btn btn-primary" id="setEndTime">
                                    Set End
                                </button>
                                <button class="btn btn-success" id="previewTrim">
                                    Preview
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Basic Editing -->
                    <div class="tab-pane fade" id="editing">
                        <div class="editing-controls">
                            <div class="adjustment-sliders">
                                <div class="slider-group">
                                    <label>Brightness</label>
                                    <input type="range" class="form-range" id="brightness" 
                                           min="-100" max="100" value="0">
                                </div>
                                <div class="slider-group">
                                    <label>Contrast</label>
                                    <input type="range" class="form-range" id="contrast" 
                                           min="-100" max="100" value="0">
                                </div>
                                <div class="slider-group">
                                    <label>Saturation</label>
                                    <input type="range" class="form-range" id="saturation" 
                                           min="-100" max="100" value="0">
                                </div>
                                <div class="slider-group">
                                    <label>Volume</label>
                                    <input type="range" class="form-range" id="volume" 
                                           min="0" max="200" value="100">
                                </div>
                            </div>
                            <button class="btn btn-primary mt-3" id="resetAdjustments">
                                Reset Adjustments
                            </button>
                        </div>
                    </div>

                    <!-- Format Conversion -->
                    <div class="tab-pane fade" id="conversion">
                        <div class="conversion-controls">
                            <div class="format-selection">
                                <label>Target Format</label>
                                <select class="form-select" id="targetFormat">
                                    <option value="mp4">MP4</option>
                                    <option value="webm">WebM</option>
                                    <option value="mov">MOV</option>
                                    <option value="gif">GIF</option>
                                </select>
                            </div>
                            <div class="quality-selection mt-3">
                                <label>Quality Preset</label>
                                <select class="form-select" id="qualityPreset">
                                    <option value="high">High Quality</option>
                                    <option value="medium">Medium Quality</option>
                                    <option value="low">Low Quality</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Metadata Editor -->
                    <div class="tab-pane fade" id="metadata">
                        <div class="metadata-controls">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" class="form-control" id="videoTitle">
                            </div>
                            <div class="form-group mt-2">
                                <label>Description</label>
                                <textarea class="form-control" id="videoDescription" rows="3"></textarea>
                            </div>
                            <div class="form-group mt-2">
                                <label>Tags</label>
                                <input type="text" class="form-control" id="videoTags" 
                                       placeholder="Add tags separated by commas">
                            </div>
                            <div class="custom-metadata mt-3">
                                <h6>Custom Metadata</h6>
                                <div id="customMetadataFields">
                                    <button class="btn btn-outline-primary btn-sm" id="addCustomField">
                                        Add Field
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="tool-actions mt-3">
                    <button class="btn btn-secondary" id="cancelEdits">Cancel</button>
                    <button class="btn btn-primary" id="applyEdits">Apply Changes</button>
                </div>
            </div>
        `;

        document.querySelector('#tools-container').innerHTML = toolsPanelHTML;
        this.initializeVideoPlayer();
    }

    initializeVideoPlayer() {
        this.videoPlayer = document.getElementById('videoPreview');
        // Initialize video.js or other video player library here
    }

    bindToolEvents() {
        // Trimming events
        document.getElementById('setStartTime').addEventListener('click', () => {
            this.setTrimPoint('start');
        });
        document.getElementById('setEndTime').addEventListener('click', () => {
            this.setTrimPoint('end');
        });
        document.getElementById('previewTrim').addEventListener('click', () => {
            this.previewTrimmedVideo();
        });

        // Editing events
        document.querySelectorAll('.form-range').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.updateVideoEffect(e.target.id, e.target.value);
            });
        });

        // Metadata events
        document.getElementById('addCustomField').addEventListener('click', () => {
            this.addCustomMetadataField();
        });

        // Action buttons
        document.getElementById('applyEdits').addEventListener('click', () => {
            this.applyChanges();
        });
        document.getElementById('cancelEdits').addEventListener('click', () => {
            this.resetChanges();
        });
    }

    // Implementation methods...
    setTrimPoint(point) {
        const currentTime = this.videoPlayer.currentTime;
        if (point === 'start') {
            this.toolSettings.trimming.startTime = currentTime;
        } else {
            this.toolSettings.trimming.endTime = currentTime;
        }
        this.updateTimelineDisplay();
    }

    updateVideoEffect(effect, value) {
        this.toolSettings.editing[effect] = parseInt(value);
        this.applyVideoEffects();
    }

    applyVideoEffects() {
        const filters = [];
        const { brightness, contrast, saturation } = this.toolSettings.editing;
        
        if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
        if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
        if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
        
        this.videoPlayer.style.filter = filters.join(' ');
    }

    async applyChanges() {
        try {
            const changes = {
                trimming: this.toolSettings.trimming,
                editing: this.toolSettings.editing,
                metadata: this.toolSettings.metadata
            };

            const response = await fetch('/api/v1/video/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changes)
            });

            if (!response.ok) throw new Error('Failed to process video');
            
            const result = await response.json();
            this.showSuccess('Changes applied successfully!');
            
        } catch (error) {
            this.showError('Failed to apply changes: ' + error.message);
        }
    }
}

// Initialize video tools handler
const videoToolsHandler = new VideoToolsHandler(); 