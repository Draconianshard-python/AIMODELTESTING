class WebsiteUtils {
    static async getFavicon(url) {
        try {
            const domain = new URL(url).origin;
            const iconUrls = [
                `${domain}/favicon.ico`,
                `${domain}/favicon.png`,
                `${domain}/apple-touch-icon.png`,
                `${domain}/apple-touch-icon-precomposed.png`
            ];

            // Try to get icon from HTML
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Check for manifest first
            const manifestLink = doc.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                const manifestUrl = new URL(manifestLink.href, url).href;
                try {
                    const manifestResponse = await fetch(manifestUrl);
                    const manifest = await manifestResponse.json();
                    if (manifest.icons && manifest.icons.length > 0) {
                        // Get the largest icon
                        const icon = manifest.icons.reduce((prev, current) => {
                            const prevSize = parseInt(prev.sizes?.split('x')[0]) || 0;
                            const currentSize = parseInt(current.sizes?.split('x')[0]) || 0;
                            return currentSize > prevSize ? current : prev;
                        });
                        return new URL(icon.src, url).href;
                    }
                } catch (e) {
                    console.warn('Failed to fetch manifest:', e);
                }
            }

            // Check meta tags
            const iconLinks = Array.from(doc.querySelectorAll('link[rel*="icon"]'));
            if (iconLinks.length > 0) {
                // Sort by size and get the largest
                const sortedIcons = iconLinks
                    .map(link => ({
                        href: new URL(link.href, url).href,
                        size: parseInt(link.sizes?.value?.split('x')[0]) || 0
                    }))
                    .sort((a, b) => b.size - a.size);
                
                if (sortedIcons[0]) {
                    return sortedIcons[0].href;
                }
            }

            // Try common locations
            for (const iconUrl of iconUrls) {
                try {
                    const response = await fetch(iconUrl);
                    if (response.ok) {
                        return iconUrl;
                    }
                } catch (e) {
                    continue;
                }
            }

            // If no icon found, return null
            return null;
        } catch (error) {
            console.error('Error fetching favicon:', error);
            return null;
        }
    }

    static async getMetadata(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            return {
                title: doc.querySelector('title')?.textContent || '',
                description: doc.querySelector('meta[name="description"]')?.content || '',
                themeColor: doc.querySelector('meta[name="theme-color"]')?.content || '#ffffff',
                icon: await this.getFavicon(url)
            };
        } catch (error) {
            console.error('Error fetching metadata:', error);
            return null;
        }
    }

    static async

 captureScreenshot(url) {
        // This is a placeholder for actual screenshot functionality
        // In a real implementation, you might want to use a server-side service
        // or a third-party API to capture screenshots
        return null;
    }
}

class UIUtils {
    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    static createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

class FullscreenManager {
    constructor() {
        this.container = document.getElementById('fullscreenContainer');
        this.frame = document.getElementById('fullscreenFrame');
        this.title = document.getElementById('fullscreenTitle');
        this.exitBtn = document.getElementById('exitFullscreen');

        this.exitBtn.addEventListener('click', () => this.close());
    }

    open(url, title) {
        this.frame.src = url;
        this.title.textContent = title;
        this.container.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Request fullscreen if supported
        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen();
        } else if (this.container.mozRequestFullScreen) {
            this.container.mozRequestFullScreen();
        }
    }

    close() {
        this.frame.src = 'about:blank';
        this.container.style.display = 'none';
        document.body.style.overflow = '';

        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
        } else if (document.mozFullScreenElement) {
            document.mozCancelFullScreen();
        }
    }
}
