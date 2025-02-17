// Feature Management System
class FeatureManager {
    constructor() {
        this.apiBase = '/api/v1';
        this.userToken = localStorage.getItem('userToken');
        this.isPremium = false;
        this.initializeModals();
        this.checkPremiumStatus();
    }

    // Modal Management
    initializeModals() {
        const modalHTML = `
            <div class="modal fade" id="featureModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary modal-action-btn">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = new bootstrap.Modal(document.getElementById('featureModal'));
    }

    async showModal(title, content, actionCallback) {
        const modalEl = document.getElementById('featureModal');
        modalEl.querySelector('.modal-title').textContent = title;
        modalEl.querySelector('.modal-body').innerHTML = content;
        
        const actionBtn = modalEl.querySelector('.modal-action-btn');
        actionBtn.onclick = actionCallback;
        
        this.modal.show();
    }

    // API Handlers
    async apiRequest(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.userToken}`
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Feature-specific implementations
    async showFormatOptions() {
        if (!this.userToken) {
            return this.showLoginPrompt();
        }

        const formats = await this.apiRequest('/formats');
        const formatContent = `
            <div class="format-options">
                ${formats.map(format => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="format" 
                               id="format-${format.id}" value="${format.id}">
                        <label class="form-check-label" for="format-${format.id}">
                            ${format.name} (${format.quality})
                        </label>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal('Select Format', formatContent, async () => {
            const selectedFormat = document.querySelector('input[name="format"]:checked')?.value;
            if (selectedFormat) {
                await this.setFormat(selectedFormat);
            }
        });
    }

    async showQualityOptions() {
        if (!this.userToken) {
            return this.showLoginPrompt();
        }

        const qualities = await this.apiRequest('/qualities');
        const qualityContent = `
            <div class="quality-options">
                ${qualities.map(quality => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="quality" 
                               id="quality-${quality.id}" value="${quality.id}"
                               ${!this.isPremium && quality.premium ? 'disabled' : ''}>
                        <label class="form-check-label ${!this.isPremium && quality.premium ? 'text-muted' : ''}" 
                               for="quality-${quality.id}">
                            ${quality.name} 
                            ${quality.premium ? '<span class="badge bg-warning">Premium</span>' : ''}
                        </label>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal('Select Quality', qualityContent, async () => {
            const selectedQuality = document.querySelector('input[name="quality"]:checked')?.value;
            if (selectedQuality) {
                await this.setQuality(selectedQuality);
            }
        });
    }

    // Error Handling
    handleError(error) {
        console.error('Error:', error);
        const errorContent = `
            <div class="alert alert-danger">
                ${error.message}
                ${error.status === 401 ? '<br><a href="/login" class="btn btn-link">Login</a>' : ''}
            </div>
        `;
        this.showModal('Error', errorContent, () => this.modal.hide());
    }

    // Premium Features
    async checkPremiumStatus() {
        try {
            const { isPremium } = await this.apiRequest('/user/premium-status');
            this.isPremium = isPremium;
            this.updatePremiumUI();
        } catch (error) {
            console.error('Failed to check premium status:', error);
        }
    }

    updatePremiumUI() {
        document.querySelectorAll('.premium-feature').forEach(el => {
            el.classList.toggle('disabled', !this.isPremium);
        });
    }

    showLoginPrompt() {
        const content = `
            <div class="text-center">
                <p>Please login to access this feature</p>
                <a href="/login" class="btn btn-primary">Login</a>
                <a href="/register" class="btn btn-outline-primary">Register</a>
            </div>
        `;
        this.showModal('Login Required', content, () => this.modal.hide());
    }
}

// Initialize the feature manager
const featureManager = new FeatureManager();

// Export functions for global use
window.showFormatOptions = () => featureManager.showFormatOptions();
window.showQualityOptions = () => featureManager.showQualityOptions();
window.showImageOptions = () => featureManager.showImageOptions(); 