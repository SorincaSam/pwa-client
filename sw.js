const CACHE_NAME = 'focus-camp-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/download.html',
    '/download.js',
    '/styles.css',
    '/main.js',
    '/api.js',
    '/store.js',
    '/ui.js',
    '/data.json',
    '/manifest.json',
    '/icons/icon.svg'
];

// Install Event - Cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event - Network first for everything to aid debugging
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
