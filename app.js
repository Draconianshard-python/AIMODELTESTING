// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const storageManager = new StorageManager();
    const appStoreUI = new AppStoreUI(storageManager);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
    }
});
