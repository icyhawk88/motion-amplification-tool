/**
 * Motion Amplification Pro - Service Worker
 * Provides offline capabilities, caching, and background sync
 * 
 * Features:
 * - Offline functionality
 * - Intelligent caching strategies
 * - Background video processing
 * - Push notifications
 * - Performance optimization
 * 
 * @version 2.0.0
 */

const CACHE_NAME = 'motion-amplification-pro-v2';
const STATIC_CACHE = 'motion-amplification-static-v2';
const DYNAMIC_CACHE = 'motion-amplification-dynamic-v2';
const OFFLINE_PAGE = './offline.html';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/motion-amp.js',
  './js/webgl-processor.js',
  './js/motion-worker.js',
  './js/enhanced-classes.js',
  './manifest.json',
  './offline.html'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  html: 'networkFirst',
  css: 'cacheFirst',
  js: 'networkFirst',
  images: 'cacheFirst',
  videos: 'networkFirst',
  api: 'networkFirst'
};

// Background sync configuration
const BACKGROUND_SYNC_TAGS = {
  VIDEO_PROCESSING: 'video-processing',
  ANALYSIS_EXPORT: 'analysis-export',
  SETTINGS_SYNC: 'settings-sync'
};

// IndexedDB configuration for large file storage
const DB_NAME = 'MotionAmplificationDB';
const DB_VERSION = 1;
const STORES = {
  VIDEOS: 'videos',
  PROCESSED_VIDEOS: 'processedVideos', 
  ANALYSIS_DATA: 'analysisData',
  USER_PREFERENCES: 'userPreferences'
};

console.log('🔧 Motion Amplification Pro Service Worker loading...');

// Service Worker Installation
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      cacheStaticAssets(),
      initializeDatabase(),
      self.skipWaiting()
    ])
  );
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ])
  );
});

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different request types
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  } else if (request.method === 'POST') {
    event.respondWith(handlePostRequest(request));
  }
});

// Background Sync for offline video processing
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case BACKGROUND_SYNC_TAGS.VIDEO_PROCESSING:
      event.waitUntil(processQueuedVideos());
      break;
    case BACKGROUND_SYNC_TAGS.ANALYSIS_EXPORT:
      event.waitUntil(exportQueuedAnalysis());
      break;
    case BACKGROUND_SYNC_TAGS.SETTINGS_SYNC:
      event.waitUntil(syncUserSettings());
      break;
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Video processing complete!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View Result',
        icon: '/icons/view-action.png'
      },
      {
        action: 'download',
        title: 'Download',
        icon: '/icons/download-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Motion Amplification Pro', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  const data = event.notification.data;
  let url = '/';
  
  switch (event.action) {
    case 'view':
      url = data.viewUrl || '/';
      break;
    case 'download':
      url = data.downloadUrl || '/';
      break;
    default:
      url = data.defaultUrl || '/';
  }
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

// Message handler for communication with main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'CACHE_VIDEO':
        await cacheVideoFile(data.url, data.video);
        break;
      case 'PROCESS_VIDEO_OFFLINE':
        await queueVideoProcessing(data);
        break;
      case 'GET_CACHE_SIZE':
        const size = await getCacheSize();
        event.ports[0].postMessage({ success: true, size });
        break;
      case 'CLEAR_CACHE':
        await clearAllCaches();
        event.ports[0].postMessage({ success: true });
        break;
      case 'EXPORT_ANALYSIS':
        await queueAnalysisExport(data);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    console.error('Service Worker message error:', error);
    if (event.ports[0]) {
      event.ports[0].postMessage({ success: false, error: error.message });
    }
  }
});

// Cache static assets during installation
async function cacheStaticAssets() {
  console.log('📦 Caching static assets...');
  
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(STATIC_ASSETS);
    console.log('✅ Static assets cached successfully');
  } catch (error) {
    console.error('❌ Failed to cache static assets:', error);
  }
}

// Initialize IndexedDB for large file storage
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      });
    };
  });
}

// Handle GET requests with appropriate caching strategy
async function handleGetRequest(request) {
  const url = new URL(request.url);
  const extension = getFileExtension(url.pathname);
  const strategy = getCacheStrategy(extension);
  
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

// Handle POST requests (typically for video processing)
async function handlePostRequest(request) {
  try {
    // Try network first for POST requests
    const response = await fetch(request);
    return response;
  } catch (error) {
    // If offline, queue the request for background sync
    if (request.url.includes('/api/process')) {
      const data = await request.json();
      await queueVideoProcessing(data);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Video queued for offline processing',
        queued: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return getOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Get cached version immediately
  const cachedResponse = await cache.match(request);
  
  // Fetch and cache updated version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network error, cached version is better than nothing
  });
  
  // Return cached version immediately, or wait for network if no cache
  return cachedResponse || fetchPromise;
}

// Get appropriate cache strategy based on file type
function getCacheStrategy(extension) {
  const strategies = {
    'html': 'networkFirst',
    'css': 'cacheFirst',
    'js': 'networkFirst',
    'png': 'cacheFirst',
    'jpg': 'cacheFirst',
    'jpeg': 'cacheFirst',
    'svg': 'cacheFirst',
    'woff': 'cacheFirst',
    'woff2': 'cacheFirst',
    'mp4': 'networkFirst',
    'webm': 'networkFirst',
    'json': 'networkFirst'
  };
  
  return strategies[extension] || 'networkFirst';
}

// Get file extension from URL
function getFileExtension(path) {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

// Get offline fallback response
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    return caches.match(OFFLINE_PAGE);
  }
  
  if (request.destination === 'image') {
    return new Response(createOfflineImageSVG(), {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  return new Response('Offline - content not available', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Create offline placeholder image
function createOfflineImageSVG() {
  return `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#f0f0f0"/>
      <text x="150" y="100" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">
        Image not available offline
      </text>
    </svg>
  `;
}

// Clean up old caches
async function cleanupOldCaches() {
  console.log('🧹 Cleaning up old caches...');
  
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('motion-amplification') && 
    name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE
  );
  
  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
  
  console.log(`🗑️ Deleted ${oldCaches.length} old caches`);
}

// Cache video file for offline processing
async function cacheVideoFile(url, videoBlob) {
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORES.VIDEOS);
    
    const videoData = {
      id: url,
      blob: videoBlob,
      timestamp: Date.now(),
      size: videoBlob.size,
      type: videoBlob.type
    };
    
    await store.put(videoData);
    console.log('💾 Video cached for offline processing:', url);
  } catch (error) {
    console.error('Failed to cache video:', error);
  }
}

// Queue video for background processing
async function queueVideoProcessing(data) {
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORES.VIDEOS);
    
    const queueItem = {
      id: `queue_${Date.now()}`,
      videoData: data.video,
      parameters: data.parameters,
      timestamp: Date.now(),
      status: 'queued'
    };
    
    await store.put(queueItem);
    
    // Register background sync
    await self.registration.sync.register(BACKGROUND_SYNC_TAGS.VIDEO_PROCESSING);
    
    console.log('📋 Video queued for background processing');
  } catch (error) {
    console.error('Failed to queue video processing:', error);
  }
}

// Process queued videos in background
async function processQueuedVideos() {
  console.log('🔄 Processing queued videos...');
  
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.VIDEOS], 'readonly');
    const store = transaction.objectStore(STORES.VIDEOS);
    const index = store.index('timestamp');
    
    const queuedVideos = [];
    const cursor = await index.openCursor();
    
    while (cursor) {
      const video = cursor.value;
      if (video.status === 'queued') {
        queuedVideos.push(video);
      }
      cursor.continue();
    }
    
    for (const video of queuedVideos) {
      await processVideoInBackground(video);
    }
    
    if (queuedVideos.length > 0) {
      await showProcessingCompleteNotification(queuedVideos.length);
    }
    
  } catch (error) {
    console.error('Background video processing failed:', error);
  }
}

// Process individual video in background
async function processVideoInBackground(videoData) {
  try {
    // Create worker for processing
    const worker = new Worker('/js/motion-worker.js');
    
    return new Promise((resolve, reject) => {
      worker.postMessage({
        type: 'process',
        data: {
          frames: videoData.videoData,
          parameters: videoData.parameters
        }
      });
      
      worker.onmessage = async (event) => {
        const { type, data } = event.data;
        
        if (type === 'complete') {
          // Store processed result
          await storeProcessedVideo(videoData.id, data);
          
          // Update queue status
          await updateVideoStatus(videoData.id, 'completed');
          
          worker.terminate();
          resolve(data);
        } else if (type === 'error') {
          await updateVideoStatus(videoData.id, 'failed');
          worker.terminate();
          reject(new Error(data.error));
        }
      };
      
      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };
    });
    
  } catch (error) {
    console.error('Failed to process video in background:', error);
    await updateVideoStatus(videoData.id, 'failed');
  }
}

// Store processed video result
async function storeProcessedVideo(videoId, processedData) {
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.PROCESSED_VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORES.PROCESSED_VIDEOS);
    
    const result = {
      id: `processed_${videoId}`,
      originalVideoId: videoId,
      processedFrames: processedData.frames,
      statistics: processedData.stats,
      timestamp: Date.now()
    };
    
    await store.put(result);
    console.log('💾 Processed video stored:', videoId);
  } catch (error) {
    console.error('Failed to store processed video:', error);
  }
}

// Update video processing status
async function updateVideoStatus(videoId, status) {
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORES.VIDEOS);
    
    const video = await store.get(videoId);
    if (video) {
      video.status = status;
      video.updatedAt = Date.now();
      await store.put(video);
    }
  } catch (error) {
    console.error('Failed to update video status:', error);
  }
}

// Queue analysis export
async function queueAnalysisExport(data) {
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.ANALYSIS_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.ANALYSIS_DATA);
    
    const exportItem = {
      id: `export_${Date.now()}`,
      analysisData: data,
      timestamp: Date.now(),
      status: 'queued'
    };
    
    await store.put(exportItem);
    await self.registration.sync.register(BACKGROUND_SYNC_TAGS.ANALYSIS_EXPORT);
    
    console.log('📊 Analysis export queued');
  } catch (error) {
    console.error('Failed to queue analysis export:', error);
  }
}

// Export queued analysis data
async function exportQueuedAnalysis() {
  console.log('📊 Exporting queued analysis data...');
  
  try {
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.ANALYSIS_DATA], 'readonly');
    const store = transaction.objectStore(STORES.ANALYSIS_DATA);
    
    const cursor = await store.openCursor();
    const queuedExports = [];
    
    while (cursor) {
      const item = cursor.value;
      if (item.status === 'queued') {
        queuedExports.push(item);
      }
      cursor.continue();
    }
    
    for (const exportItem of queuedExports) {
      await performAnalysisExport(exportItem);
    }
    
  } catch (error) {
    console.error('Failed to export analysis data:', error);
  }
}

// Perform individual analysis export
async function performAnalysisExport(exportItem) {
  try {
    // Create blob with analysis data
    const dataBlob = new Blob([JSON.stringify(exportItem.analysisData, null, 2)], {
      type: 'application/json'
    });
    
    // Store in IndexedDB for later download
    const db = await initializeDatabase();
    const transaction = db.transaction([STORES.ANALYSIS_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.ANALYSIS_DATA);
    
    exportItem.status = 'ready';
    exportItem.exportBlob = dataBlob;
    exportItem.exportedAt = Date.now();
    
    await store.put(exportItem);
    
    console.log('📊 Analysis export ready:', exportItem.id);
  } catch (error) {
    console.error('Failed to perform analysis export:', error);
  }
}

// Sync user settings
async function syncUserSettings() {
  console.log('⚙️ Syncing user settings...');
  // Implementation for syncing user preferences when back online
}

// Show processing complete notification
async function showProcessingCompleteNotification(count) {
  const title = 'Motion Amplification Complete';
  const body = `${count} video${count > 1 ? 's' : ''} processed successfully while offline!`;
  
  await self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      action: 'processing_complete',
      count
    },
    actions: [
      {
        action: 'view_results',
        title: 'View Results'
      }
    ]
  });
}

// Get total cache size
async function getCacheSize() {
  try {
    let totalSize = 0;
    
    // Check cache storage
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    // Check IndexedDB storage
    const estimate = await navigator.storage.estimate();
    
    return {
      cacheSize: totalSize,
      totalUsage: estimate.usage,
      totalQuota: estimate.quota,
      percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
    };
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return { cacheSize: 0, totalUsage: 0, totalQuota: 0, percentage: 0 };
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    // Clear cache storage
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    // Clear IndexedDB
    const db = await initializeDatabase();
    const storeNames = Object.values(STORES);
    
    for (const storeName of storeNames) {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
    console.log('🧹 All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

console.log('✅ Motion Amplification Pro Service Worker ready!');
console.log('Features: Offline support, Background processing, Push notifications, Intelligent caching');
