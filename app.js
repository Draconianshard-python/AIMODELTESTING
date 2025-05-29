class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.appStoreUI = null;
        this.init();
    }

    async init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            await this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // Initialize UI
            this.appStoreUI = new AppStoreUI(this.storageManager);
            
            // Register service worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registration successful:', registration);
            }

            // Initialize buttons and event listeners
            this.initializeButtons();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Failed to initialize app. Please refresh the page.');
        }
    }

    initializeButtons() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNavigation(e);
                // Add ripple effect
                UIUtils.createRipple(e);
            });
        });

        // Add Website button
        const addWebsiteBtn = document.getElementById('addWebsite');
        if (addWebsiteBtn) {
            addWebsiteBtn.addEventListener('click', (e) => {
                UIUtils.createRipple(e);
                this.appStoreUI.showAddWebsiteModal();
            });
        }

        // Upload App button
        const uploadAppBtn = document.getElementById('uploadApp');
        if (uploadAppBtn) {
            uploadAppBtn.addEventListener('click', (e) => {
                UIUtils.createRipple(e);
                this.appStoreUI.showUploadAppModal();
            });
        }

        // Link PWA button
        const linkPwaBtn = document.getElementById('linkPwa');
        if (linkPwaBtn) {
            linkPwaBtn.addEventListener('click', (e) => {
                UIUtils.createRipple(e);
                this.appStoreUI.showLinkPwaModal();
            });
        }

        // Close buttons for all modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.ios-modal');
                if (modal) {
                    UIUtils.createRipple(e);
                    modal.style.display = 'none';
                }
            });
        });

        // View options buttons
        document.querySelectorAll('.view-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                UIUtils.createRipple(e);
                this.appStoreUI.changeViewMode(btn.dataset.view);
            });
        });
    }

    handleNavigation(event) {
        const view = event.currentTarget.dataset.view;
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update view sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.toggle('active', section.id === `${view}View`);
        });

        // Perform any additional view-specific initialization
        switch(view) {
            case 'today':
                this.appStoreUI.loadTodayView();
                break;
            case 'apps':
                this.appStoreUI.loadAppsView();
                break;
            case 'search':
                this.appStoreUI.loadSearchView();
                break;
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Initialize the app
const app = new App();
