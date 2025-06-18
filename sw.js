// ===== QUEER GRID SERVICE WORKER =====
// Performance-optimized caching and offline functionality

const CACHE_NAME = 'queer-grid-v1.2.0';
const STATIC_CACHE = 'queer-grid-static-v1.2.0';
const DYNAMIC_CACHE = 'queer-grid-dynamic-v1.2.0';

// Resources to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/styles-optimized.css',
    '/script.js',
    '/app-optimized.js',
    '/logo/logocute.png',
    '/logo/logonotcute.png',
    '/config.js',
    // Fonts can be added here when available
];

// Images to cache on first visit
const IMAGE_CACHE = [
    '/queer rage photos/9cdedb18a9890863f944403e4fe59350.jpg',
    '/queer rage photos/630f003a7cd1d5026b2c5b0846fa485d.jpg',
    '/queer rage photos/15e6cbc005353d9b1ec5f601247109f9.jpg',
    '/queer rage photos/27511f9c1acb785b350f646c015f5ff5.jpg',
    '/queer rage photos/c1531ac005b4c5fb19f24fae05419ddd.jpg',
    '/queer rage photos/191f289e6a2ef9b290731b22c36b4b9e.jpg'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
    console.log('🚀 Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Pre-load critical images
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🖼️ Service Worker: Pre-caching images');
                return cache.addAll(IMAGE_CACHE);
            })
        ])
        .then(() => {
            console.log('✅ Service Worker: Installation complete');
            // Force activate immediately
            return self.skipWaiting();
        })
        .catch(error => {
            console.error('❌ Service Worker: Installation failed', error);
        })
    );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        // Clean up old caches
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker: Activation complete');
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// ===== FETCH EVENT WITH INTELLIGENT CACHING =====
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip API calls to local server (they need to be fresh)
    if (url.hostname === 'localhost' && url.port === '3002') {
        return;
    }
    
    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Different caching strategies based on resource type
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request));
    } else if (isImage(url)) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    } else if (isFont(url)) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// ===== CACHING STRATEGIES =====

// Cache First: Good for static assets
async function cacheFirst(request, cacheName = STATIC_CACHE) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Update cache in background if needed
            updateCacheInBackground(request, cache);
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Clone before caching (response can only be consumed once)
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Cache First strategy failed:', error);
        
        // Try to return a cached version as fallback
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page if it's an HTML request
        if (request.destination === 'document') {
            const offlineResponse = await cache.match('/');
            if (offlineResponse) {
                return offlineResponse;
            }
        }
        
        throw error;
    }
}

// Network First: Good for dynamic content
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for HTML requests
        if (request.destination === 'document') {
            const offlineResponse = await cache.match('/');
            if (offlineResponse) {
                return offlineResponse;
            }
        }
        
        throw error;
    }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        // Silent fail for background updates
        console.log('Background cache update failed:', error);
    }
}

// ===== UTILITY FUNCTIONS =====

function isStaticAsset(url) {
    const staticExtensions = ['.html', '.css', '.js', '.json', '.ico'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isImage(url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

function isFont(url) {
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    return fontExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

// ===== MESSAGE HANDLING =====
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_STATS':
            getCacheStats().then(stats => {
                event.ports[0].postMessage({ type: 'CACHE_STATS', payload: stats });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;
            
        case 'PRELOAD_IMAGES':
            preloadImages(payload).then(() => {
                event.ports[0].postMessage({ type: 'IMAGES_PRELOADED' });
            });
            break;
    }
});

// ===== CACHE MANAGEMENT =====
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
    }
    
    return stats;
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function preloadImages(imageUrls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.addAll(imageUrls);
}

// ===== BACKGROUND SYNC (if supported) =====
if ('sync' in self.registration) {
    self.addEventListener('sync', event => {
        console.log('🔄 Background sync triggered:', event.tag);
        
        if (event.tag === 'email-sync') {
            event.waitUntil(syncPendingEmails());
        }
    });
}

async function syncPendingEmails() {
    // This would sync pending email submissions when back online
    // Implementation depends on your offline strategy
    console.log('📧 Syncing pending emails...');
}

// ===== PUSH NOTIFICATIONS (if needed) =====
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'New updates from Queer Grid!',
        icon: '/logo/logocute.png',
        badge: '/logo/logocute.png',
        tag: 'queer-grid-update',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Updates'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Queer Grid Update', options)
    );
});

// ===== ERROR HANDLING =====
self.addEventListener('error', event => {
    console.error('🚨 Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('🚨 Service Worker Unhandled Rejection:', event.reason);
});

console.log('🏳️‍🌈 Queer Grid Service Worker loaded successfully! 🏳️‍🌈'); 