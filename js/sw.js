/**
 * Motion Amplification Pro - Service Worker
 * Provides offline capabilities, caching, and PWA functionality
 * 
 * @version 2.0.0
 */

const CACHE_NAME = 'motion-amplification-pro-v2.0.0';
const OFFLINE_URL = './offline.html';

// Files to cache for offline functionality
const CORE_CACHE_FILES = [
    './',
    './index.html',
    './offline.html',
    './css/style.css',
    './js/config.js',
    './js/enhanced-utilities.js',
    './js/motion-amp.js',
    './js/enhanced-classes.js',
    './js/webgl-processor.js',
    './js/motion-worker.js',
    './manifest.json'
];

// Optional cache files (cache if available, but don't fail if missing)
const OPTIONAL_CACHE_FILES = [
    './docs/user-guide.md',
    './docs/api-reference.md'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching core files');
                return cache.addAll(CORE_CACHE_FILES);
            })
            .then(() => {
                // Cache optional files without failing
                return caches.open(CACHE_NAME).then((cache) => {
                    return Promise.allSettled(
                        OPTIONAL_CACHE_FILES.map(file => 
                            cache.add(file).catch(err => {
                                console.warn(`Optional file not cached: ${file}`, err);
                            })
                        )
                    );
                });
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                self.skipWaiting(); // Immediately activate
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log(`🗑️ Service Worker: Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log(`📁 Service Worker: Serving from cache: ${event.request.url}`);
                    return response;
                }
                
                // Try to fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Cache successful responses for next time
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.warn(`🌐 Service Worker: Network failed for ${event.request.url}`, error);
                        
                        // For navigation requests, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests, return a basic offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for processing videos when back online
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'background-video-processing') {
        event.waitUntil(
            processQueuedVideos()
        );
    }
});

// Handle video processing queue
async function processQueuedVideos() {
    try {
        // Get queued videos from IndexedDB or localStorage
        const queuedVideos = await getQueuedVideos();
        
        for (const video of queuedVideos) {
            try {
                // Process video (simplified - would need actual processing logic)
                await processVideoOffline(video);
                
                // Remove from queue
                await removeFromQueue(video.id);
                
                // Notify main thread
                self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'VIDEO_PROCESSED',
                            videoId: video.id,
                            result: 'success'
                        });
                    });
                });
                
            } catch (error) {
                console.error('Failed to process queued video:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Placeholder functions for video queue management
async function getQueuedVideos() {
    // Implementation would retrieve from IndexedDB
    return [];
}

async function processVideoOffline(video) {
    // Implementation would process video with available parameters
    console.log('Processing video offline:', video.id);
}

async function removeFromQueue(videoId) {
    // Implementation would remove video from IndexedDB queue
    console.log('Removing video from queue:', videoId);
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('📨 Service Worker: Push notification received');
    
    const options = {
        body: 'Your video processing is complete!',
        icon: './favicon.ico',
        badge: './favicon.ico',
        tag: 'video-processing',
        renotify: true,
        actions: [
            {
                action: 'view',
                title: 'View Result',
                icon: './favicon.ico'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Motion Amplification Pro', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            self.clients.openWindow('./')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'QUEUE_VIDEO') {
        // Queue video for background processing
        queueVideoForProcessing(event.data.video);
    }
});

async function queueVideoForProcessing(video) {
    // Implementation would save to IndexedDB for background processing
    console.log('Queuing video for background processing:', video);
}

// Update notification
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Check for updates and notify client
        event.ports[0].postMessage({
            hasUpdate: false, // Would check for actual updates
            version: '2.0.0'
        });
    }
});

console.log('🚀 Service Worker: Loaded and ready');
