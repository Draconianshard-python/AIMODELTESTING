class AppStoreUI {
    constructor(storageManager) {
        this.storage = storageManager;
        this.fullscreen = new FullscreenManager();
        this.initializeUI();
        this.bindEventListeners();
    }

    initializeUI() {
        this.elements = {
            // Modals
            addWebsiteModal: document.getElementById('addWebsiteModal'),
            uploadAppModal: document.getElementById('uploadAppModal'),
            linkPwaModal: document.getElementById('linkPwaModal'),
            
            // Forms
            websiteUrl: document.getElementById('websiteUrl'),
            websiteName: document.getElementById('websiteName'),
            websiteIconPreview: document.getElementById('websiteIconPreview'),
            
            // Buttons
            addWebsiteBtn: document.getElementById('addWebsiteBtn'),
            uploadAppBtn: document.getElementById('uploadAppBtn'),
            linkPwaBtn: document.getElementById('linkPwaBtn'),
            
            // Containers
            appsGrid: document.getElementById('appsGrid'),
            searchResults: document.getElementById('searchResults'),
            todayView: document.getElementById('todayView'),
            
            // Search
            searchInput: document.getElementById('searchInput')
        };

        // Initialize views
        this.loadTodayView();
    }

    bindEventListeners() {
        // Website URL input handler
        if (this.elements.websiteUrl) {
            this.elements.websiteUrl.addEventListener('input', 
                UIUtils.debounce(async (e) => {
                    const url = e.target.value.trim();
                    if (this.isValidUrl(url)) {
                        await this.previewWebsite(url);
                    }
                }, 500)
            );
        }

        // Search input handler
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input',
                UIUtils.debounce((e) => this.handleSearch(e.target.value), 300)
            );
        }

        // Modal close handlers
        document.querySelectorAll('.ios-modal').forEach(modal => {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Add website form submission
        const addWebsiteForm = document.querySelector('#addWebsiteModal form');
        if (addWebsiteForm) {
            addWebsiteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddWebsite();
            });
        }
    }

    // Modal show/hide methods
    showAddWebsiteModal() {
        if (this.elements.addWebsiteModal) {
            this.elements.addWebsiteModal.style.display = 'block';
        }
    }

    showUploadAppModal() {
        if (this.elements.uploadAppModal) {
            this.elements.uploadAppModal.style.display = 'block';
        }
    }

    showLinkPwaModal() {
        if (this.elements.linkPwaModal) {
            this.elements.linkPwaModal.style.display = 'block';
        }
    }

    // View loading methods
    async loadTodayView() {
        if (this.elements.todayView) {
            const apps = await this.storage.getAllApps();
            const featuredApp = Object.values(apps)[0]; // Get the first app for featured
            
            if (featuredApp) {
                const featuredCard = this.elements.todayView.querySelector('.featured-card');
                if (featuredCard) {
                    featuredCard.innerHTML = this.createFeaturedCardContent(featuredApp);
                }
            }
        }
    }

    async loadAppsView() {
        await this.loadApps();
    }

    loadSearchView() {
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
        }
    }

    // UI Helper methods
    createFeaturedCardContent(app) {
        return `
            <div class="card-header">
                <span class="featured-label">FEATURED APP</span>
                <button class="get-btn" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">
                    OPEN
                </button>
            </div>
            <div class="card-content">
                <img src="${app.icon || 'default-icon.png'}" alt="${app.name}" class="featured-icon">
                <h3>${app.name}</h3>
                <p>${app.description || ''}</p>
            </div>
        `;
    }

    // Add more helper methods as needed...
}
