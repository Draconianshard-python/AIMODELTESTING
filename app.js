class AppStore {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadApps();
    }

    initializeElements() {
        this.appName = document.getElementById('appName');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.appGrid = document.getElementById('appGrid');
        this.dropZone = document.getElementById('dropZone');
        this.appViewer = document.getElementById('appViewer');
        this.viewerFrame = document.getElementById('viewerFrame');
        this.closeViewer = document.getElementById('closeViewer');
        this.viewerTitle = document.getElementById('viewerTitle');
    }

    setupEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.handleUpload());
        this.closeViewer.addEventListener('click', () => this.closeApp());
        
        // Drag and drop handlers
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.fileInput.files = files;
        });
    }

    async handleUpload() {
        const files = this.fileInput.files;
        const appName = this.appName.value.trim();
        
        if (!appName) {
            alert('Please enter an app name');
            return;
        }
        
        if (files.length === 0) {
            alert('Please select files to upload');
            return;
        }

        const app = {
            name: appName,
            files: {},
            created: new Date().toISOString()
        };

        for (let file of files) {
            try {
                const content = await this.readFileContent(file);
                const extension = file.name.split('.').pop().toLowerCase();
                app.files[file.name] = {
                    content,
                    type: file.type || this.getContentType(extension),
                    lastModified: file.lastModified
                };
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
            }
        }

        await this.saveApp(appName, app);
        this.loadApps();
        this.resetForm();
    }

    getContentType(extension) {
        const types = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript'
        };
        return types[extension] || 'text/plain';
    }

    resetForm() {
        this.appName.value = '';
        this.fileInput.value = '';
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    async saveApp(appName, appData) {
        try {
            const apps = await this.getApps();
            apps[appName] = appData;
            localStorage.setItem('pwa_apps', JSON.stringify(apps));
        } catch (error) {
            console.error('Error saving app:', error);
            throw error;
        }
    }

    getApps() {
        const apps = localStorage.getItem('pwa_apps');
        return apps ? JSON.parse(apps) : {};
    }

    loadApps() {
        const apps = this.getApps();
        this.appGrid.innerHTML = '';

        Object.entries(apps).forEach(([appName, appData]) => {
            const appElement = this.createAppElement(appName, appData);
            this.appGrid.appendChild(appElement);
        });
    }

    createAppElement(appName, appData) {
        const div = document.createElement('div');
        div.className = 'app-item';
        
        div.innerHTML = `
            <div class="app-icon">${appName[0].toUpperCase()}</div>
            <div class="app-name">${appName}</div>
        `;
        
        div.addEventListener('click', () => this.launchApp(appName, appData));
        return div;
    }

    async launchApp(appName, appData) {
        this.viewerTitle.textContent = appName;
        this.appViewer.style.display = 'block';

        // Create a blob URL for the HTML content
        const htmlFile = Object.entries(appData.files).find(([name]) => name.endsWith('.html'));
        if (!htmlFile) {
            alert('No HTML file found in the app');
            return;
        }

        // Create a data URL that includes all files
        const html = this.injectDependencies(htmlFile[1].content, appData.files);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        this.viewerFrame.src = url;
        this.currentBlobUrl = url; // Store for cleanup
    }

    injectDependencies(htmlContent, files) {
        // Replace relative paths with actual content
        let modifiedHtml = htmlContent;

        // Inject CSS
        const styleLinks = modifiedHtml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/g) || [];
        styleLinks.forEach(link => {
            const href = link.match(/href=["']([^"']+)["']/)[1];
            const fileName = href.split('/').pop();
            if (files[fileName]) {
                const style = `<style>${files[fileName].content}</style>`;
                modifiedHtml = modifiedHtml.replace(link, style);
            }
        });

        // Inject JavaScript
        const scriptTags = modifiedHtml.match(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/g) || [];
        scriptTags.forEach(script => {
            const src = script.match(/src=["']([^"']+)["']/)[1];
            const fileName = src.split('/').pop();
            if (files[fileName]) {
                const newScript = `<script>${files[fileName].content}</script>`;
                modifiedHtml = modifiedHtml.replace(script, newScript);
            }
        });

        return modifiedHtml;
    }

    closeApp() {
        this.appViewer.style.display = 'none';
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
        }
        this.viewerFrame.src = 'about:blank';
    }

    async deleteApp(appName) {
        const apps = this.getApps();
        delete apps[appName];
        localStorage.setItem('pwa_apps', JSON.stringify(apps));
        this.loadApps();
    }
}

// Initialize the app store
const appStore = new AppStore();

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
