class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'ios_appstore_apps';
        this.ICON_STORAGE_KEY = 'ios_appstore_icons';
    }

    async saveApp(appData) {
        try {
            const apps = await this.getAllApps();
            apps[appData.id] = appData;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(apps));
            return true;
        } catch (error) {
            console.error('Error saving app:', error);
            return false;
        }
    }

    async getAllApps() {
        const apps = localStorage.getItem(this.STORAGE_KEY);
        return apps ? JSON.parse(apps) : {};
    }

    async getApp(id) {
        const apps = await this.getAllApps();
        return apps[id] || null;
    }

    async deleteApp(id) {
        const apps = await this.getAllApps();
        if (apps[id]) {
            delete apps[id];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(apps));
            return true;
        }
        return false;
    }

    async saveIcon(id, iconData) {
        try {
            const icons = await this.getAllIcons();
            icons[id] = iconData;
            localStorage.setItem(this.ICON_STORAGE_KEY, JSON.stringify(icons));
            return true;
        } catch (error) {
            console.error('Error saving icon:', error);
            return false;
        }
    }

    async getIcon(id) {
        const icons = await this.getAllIcons();
        return icons[id] || null;
    }

    async getAllIcons() {
        const icons = localStorage.getItem(this.ICON_STORAGE_KEY);
        return icons ? JSON.parse(icons) : {};
    }

    async clearStorage() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.ICON_STORAGE_KEY);
    }

    generateId() {
        return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async searchApps(query) {
        const apps = await this.getAllApps();
        const normalizedQuery = query.toLowerCase();
        
        return Object.values(apps).filter(app => {
            return (
                app.name.toLowerCase().includes(normalizedQuery) ||
                app.description?.toLowerCase().includes(normalizedQuery) ||
                app.url?.toLowerCase().includes(normalizedQuery)
            );
        });
    }
}
