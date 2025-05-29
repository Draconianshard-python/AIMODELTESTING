class AppStoreUI {
    constructor(storageManager) {
        this.storage = storageManager;
        this.fullscreen = new FullscreenManager();
        this.initializeUI();
    }

    initializeUI() {
        this.bindElements();
        this.setupEventListeners();
        this.loadApps();
    }

    bindElements() {
        // Navigation
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.viewSections = document.querySelectorAll('.view-section');
        
        // Add Website Modal
        this.addWebsiteModal = document.getElementById('addWebsiteModal');
        this.websiteUrl = document.getElementById('websiteUrl');
        this.websiteName = document.getElementById('websiteName');
        this.websiteIconPreview = document.getElementById('websiteIconPreview');
        this.addWebsiteBtn = document.getElementById('addWebsiteBtn');
        
        // App Grid
        this.appsGrid = document.getElementById('appsGrid');
        
        // Search
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
    }

    setupEventListeners() {
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Website Modal
        document.getElementById('addWebsite').addEventListener('click', () => {
            this.addWebsiteModal.style.display = 'block';
        });

        this.addWebsiteModal.querySelector('.close-modal').addEventListener('click', () => {
            this.addWebsiteModal.style.display = 'none';
        });

        this.websiteUrl.addEventListener('input', UIUtils.debounce(async (e) => {
            const url = e.target.value;
            if (this.isValidUrl(url)) {
                const metadata = await WebsiteUtils.getMetadata(url);
                if (metadata) {
                    this.websiteName.value = metadata.title;
                    if (metadata.icon) {
                        this.websiteIconPreview.src = metadata.icon;
                    }
                }
            }
        }, 500));

        this.addWebsiteBtn.addEventListener('click', () => this.handleAddWebsite());

        // Search
        this.searchInput.addEventListener('input', UIUtils.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));
    }

    async handleAddWebsite() {
        const url = this.websiteUrl.value.trim();
        const name = this.websiteName.value.trim();

        if (!this.isValidUrl(url)) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        try {
            const metadata = await WebsiteUtils.getMetadata(url);
            const appData = {
                id: this.storage.generateId(),
                type: 'website',
                name: name || metadata.title || new URL(url).hostname,
                url: url,
                icon: metadata.icon,
                description: metadata.description,
                themeColor: metadata.themeColor,
                dateAdded: new Date().toISOString()
            };

            await this.storage.saveApp(appData);
            if (metadata.icon) {
                await this.storage.saveIcon(appData.id, metadata.icon);
            }

            this.addWebsiteModal.style.display = 'none';
            this.loadApps();
            this.showToast('Website added successfully', 'success');
            this.resetAddWebsiteForm();
        } catch (error) {
            console.error('Error adding website:', error);
            this.showToast('Error adding website', 'error');
        }
    }

    resetAddWebsiteForm() {
        this.websiteUrl.value = '';
        this.websiteName.value = '';
        this.websiteIconPreview.src = 'default-icon.png';
    }

    async loadApps() {
        const apps = await this.storage.getAllApps();
        this.appsGrid.innerHTML = '';

        Object.values(apps).forEach(app => {
            const appElement = this.createAppElement(app);
            this.appsGrid.appendChild(appElement);
        });
    }

    createAppElement(app) {
        const div = document.createElement('div');
        div.className = 'app-item';
        div.innerHTML = `
            <div class="app-icon">
                <img src="${app.icon || 'default-icon.png'}" alt="${app.name}">
            </div>
            <div class="app-name">${app.name}</div>
        `;

        div.addEventListener('click', () => {
            if (app.type === 'website') {
                this.fullscreen.open(app.url, app.name);
            } else {
                // Handle other app types
            }
        });

        return div;
    }

    async handleSearch(query) {
        if (query.length < 2) {
            this.searchResults.innerHTML = '';
            return;
        }

        const results = await this.storage.searchApps(query);
        this.searchResults.innerHTML = '';

        results.forEach(app => {
            const resultElement = this.createSearchResultElement(app);
            this.searchResults.appendChild(resultElement);
        });
    }

    createSearchResultElement(app) {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = `
            <img src="${app.icon || 'default-icon.png'}" alt="${app.name}">
            <div class="result-info">
                <h3>${app.name}</h3>
                <p>${app.description || ''}</p>
            </div>
        `;

        div.addEventListener('click', () => {
            if (app.type === 'website') {
                this.fullscreen.open(app.url, app.name);
            }
        });

        return div;
    }

    handleNavigation(event) {
        const view = event.currentTarget.dataset.view;
        
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.viewSections.forEach(section => {
            section.classList.toggle('active', section.id === `${view}View`);
        });
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}
