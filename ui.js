class AppStoreUI {
    constructor(storageManager) {
        this.storage = storageManager;
        this.fullscreen = new FullscreenManager();
        this.initializeUI();
        this.setupAnimations();
    }

    initializeUI() {
        this.elements = {
            addAppFab: document.getElementById('addAppFab'),
            addAppModal: document.getElementById('addAppModal'),
            featuredCarousel: document.querySelector('.featured-carousel'),
            appsGrid: document.getElementById('appsGrid'),
            navButtons: document.querySelectorAll('.nav-btn'),
            viewOptions: document.querySelectorAll('.view-option'),
        };

        this.setupEventListeners();
        this.loadInitialContent();
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all animatable elements
        document.querySelectorAll('.featured-card, .category-item, .app-item').forEach(el => {
            observer.observe(el);
        });
    }

    setupEventListeners() {
        // FAB handler
        this.elements.addAppFab?.addEventListener('click', () => {
            this.showAddAppModal();
        });

        // Modal close handler
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModals();
            });
        });

        // Navigation handlers
        this.elements.navButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget.dataset.view);
            });
        });

        // View option handlers
        this.elements.viewOptions?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleViewChange(e.currentTarget.dataset.view);
            });
        });

        // Featured carousel touch handling
        if (this.elements.featuredCarousel) {
            this.setupCarousel();
        }
    }

    setupCarousel() {
        let startX;
        let scrollLeft;

        this.elements.featuredCarousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - this.elements.featuredCarousel.offsetLeft;
            scrollLeft = this.elements.featuredCarousel.scrollLeft;
        });

        this.elements.featuredCarousel.addEventListener('touchmove', (e) => {
            if (!startX) return;
            const x = e.touches[0].pageX - this.elements.featuredCarousel.offsetLeft;
            const walk = (x - startX) * 2;
            this.elements.featuredCarousel.scrollLeft = scrollLeft - walk;
        });

        this.elements.featuredCarousel.addEventListener('touchend', () => {
            startX = null;
        });
    }

    async loadInitialContent() {
        await this.loadFeaturedApps();
        await this.loadApps();
        this.setupCategories();
    }

    async loadFeaturedApps() {
        const apps = await this.storage.getAllApps();
        const featuredApps = Object.values(apps).slice(0, 3);

        if (this.elements.featuredCarousel) {
            this.elements.featuredCarousel.innerHTML = featuredApps.map(app => this.createFeaturedCard(app)).join('');
        }
    }

    createFeaturedCard(app) {
        return `
            <div class="featured-card">
                <img src="${app.icon || 'assets/icons/default-icon.png'}" alt="${app.name}" class="featured-image">
                <div class="featured-content">
                    <span class="featured-tag">FEATURED</span>
                    <h3>${app.name}</h3>
                    <p>${app.description || 'No description available'}</p>
                    <button class="get-button" onclick="appStoreUI.launchApp('${app.id}')">
                        GET
                    </button>
                </div>
            </div>
        `;
    }

    setupCategories() {
        const categories = [
            { name: 'Games', icon: 'gamepad', color: '#FF6B6B' },
            { name: 'Developer', icon: 'code', color: '#4ECDC4' },
            { name: 'Productivity', icon: 'briefcase', color: '#A8E6CF' },
            { name: 'Education', icon: 'graduation-cap', color: '#FFD93D' },
            { name: 'Entertainment', icon: 'film', color: '#FF8B94' },
            { name: 'Social', icon: 'users', color: '#6C5CE7' }
        ];

        const categoryGrid = document.querySelector('.category-grid');
        if (categoryGrid) {
            categoryGrid.innerHTML = categories.map(category => this.createCategoryItem(category)).join('');
        }
    }

    createCategoryItem(category) {
        return `
            <div class="category-item">
                <div class="category-icon" style="background: linear-gradient(135deg, ${category.color}, ${this.adjustColor(category.color, -20)});">
                    <i class="fas fa-${category.icon}"></i>
                </div>
                <span>${category.name}</span>
            </div>
        `;
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    showAddAppModal() {
        if (this.elements.addAppModal) {
            this.elements.addAppModal.style.display = 'block';
            this.elements.addAppModal.querySelector('.modal-content').classList.add('slide-up');
        }
    }

    hideModals() {
        document.querySelectorAll('.ios-modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    handleNavigation(view) {
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Handle view change
        this.switchView(view);
    }

    handleViewChange(viewMode) {
        this.elements.viewOptions.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewMode);
        });

        if (this.elements.appsGrid) {
            this.elements.appsGrid.className = `apps-grid ${viewMode}-view`;
        }
    }

    switchView(view) {
        // Implement view switching logic
        const views = ['today', 'games', 'apps', 'search', 'updates'];
        views.forEach(v => {
            const section = document.getElementById(`${v}View`);
            if (section) {
                section.style.display = v === view ? 'block' : 'none';
            }
        });

        // Load view-specific content
        switch(view) {
            case 'today':
                this.loadFeaturedApps();
                break;
            case 'apps':
                this.loadApps();
                break;
            case 'search':
                this.focusSearch();
                break;
        }
    }

    focusSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }
}
