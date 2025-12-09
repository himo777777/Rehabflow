// RehabFlow Service Worker
const CACHE_NAME = 'rehabflow-v1';
const STATIC_CACHE = 'rehabflow-static-v1';
const DYNAMIC_CACHE = 'rehabflow-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fall back to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (API calls, CDN, etc.)
  if (url.origin !== location.origin) {
    // For external resources, use network first
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // For API calls, use network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // For static assets (JS, CSS, images), use cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // For HTML pages, use stale while revalidate
  event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
});

// Handle background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  } else if (event.tag === 'sync-movement-sessions') {
    event.waitUntil(syncMovementSessions());
  } else if (event.tag === 'sync-video-uploads') {
    event.waitUntil(syncVideoUploads());
  }
});

// Maximum retry attempts before giving up
const MAX_RETRIES = 3;

// Sync progress data when back online
async function syncProgress() {
  try {
    const pendingItems = await getPendingSyncItems();
    console.log('[SW] Syncing', pendingItems.length, 'pending items');

    for (const item of pendingItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...item.headers
          },
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          await removeSyncItem(item.id);
          console.log('[SW] Successfully synced item:', item.id);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('[SW] Failed to sync item:', item.id, error.message);

        // Update retry count
        await updateSyncItemRetries(item.id);

        // Remove if max retries exceeded
        if ((item.retries || 0) >= MAX_RETRIES) {
          console.log('[SW] Removing item after max retries:', item.id);
          await removeSyncItem(item.id);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Sync movement sessions specifically
async function syncMovementSessions() {
  try {
    const items = await getPendingSyncItems();
    const movementItems = items.filter(item => item.type === 'movement_session');

    console.log('[SW] Syncing', movementItems.length, 'movement sessions');

    for (const item of movementItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...item.headers
          },
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          await removeSyncItem(item.id);

          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'MOVEMENT_SESSION_SYNCED',
              sessionId: item.data?.id
            });
          });

          console.log('[SW] Movement session synced:', item.data?.id);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('[SW] Failed to sync movement session:', item.id, error.message);
        await updateSyncItemRetries(item.id);

        if ((item.retries || 0) >= MAX_RETRIES) {
          await removeSyncItem(item.id);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Movement session sync failed:', error);
  }
}

// Sync pending video uploads
async function syncVideoUploads() {
  try {
    const pendingUploads = await getPendingUploads();
    console.log('[SW] Syncing', pendingUploads.length, 'pending video uploads');

    for (const upload of pendingUploads) {
      try {
        // Create form data for video upload
        const formData = new FormData();
        formData.append('file', upload.videoBlob, `${upload.sessionId}.webm`);
        formData.append('sessionId', upload.sessionId);

        const response = await fetch('/api/upload-video', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await removePendingUpload(upload.id);

          // Notify clients
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'VIDEO_UPLOAD_COMPLETE',
              sessionId: upload.sessionId
            });
          });

          console.log('[SW] Video uploaded:', upload.sessionId);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('[SW] Failed to upload video:', upload.id, error.message);

        // Update retry count in the upload record
        if ((upload.retries || 0) >= MAX_RETRIES) {
          await removePendingUpload(upload.id);
          console.log('[SW] Removed video upload after max retries:', upload.id);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Video upload sync failed:', error);
  }
}

// Message handler for triggering sync from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    console.log('[SW] Manual sync triggered');
    syncProgress();
    syncMovementSessions();
    syncVideoUploads();
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
})

// ============================================
// IndexedDB Operations for Service Worker
// ============================================

const IDB_NAME = 'rehabflow-db';
const IDB_VERSION = 1;
const SYNC_STORE = 'sync_queue';
const PENDING_UPLOADS_STORE = 'pending_uploads';

/**
 * Open IndexedDB connection
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onerror = () => {
      console.error('[SW] Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create sync queue store if it doesn't exist
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        const syncStore = db.createObjectStore(SYNC_STORE, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // Create pending uploads store if it doesn't exist
      if (!db.objectStoreNames.contains(PENDING_UPLOADS_STORE)) {
        const uploadStore = db.createObjectStore(PENDING_UPLOADS_STORE, { keyPath: 'id' });
        uploadStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      console.log('[SW] IndexedDB upgraded');
    };
  });
}

/**
 * Get all pending sync items from IndexedDB
 */
async function getPendingSyncItems() {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_STORE, 'readonly');
      const store = transaction.objectStore(SYNC_STORE);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[SW] Failed to get sync items:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[SW] Error getting sync items:', error);
    return [];
  }
}

/**
 * Remove sync item from IndexedDB
 */
async function removeSyncItem(id) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[SW] Sync item removed:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[SW] Failed to remove sync item:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[SW] Error removing sync item:', error);
  }
}

/**
 * Update sync item retry count
 */
async function updateSyncItemRetries(id) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries = (item.retries || 0) + 1;
          store.put(item);
          console.log('[SW] Updated retry count for:', id, 'to', item.retries);
        }
        resolve();
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[SW] Error updating retry count:', error);
  }
}

/**
 * Get pending video uploads
 */
async function getPendingUploads() {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PENDING_UPLOADS_STORE, 'readonly');
      const store = transaction.objectStore(PENDING_UPLOADS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[SW] Error getting pending uploads:', error);
    return [];
  }
}

/**
 * Remove pending upload
 */
async function removePendingUpload(id) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PENDING_UPLOADS_STORE, 'readwrite');
      const store = transaction.objectStore(PENDING_UPLOADS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[SW] Pending upload removed:', id);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[SW] Error removing pending upload:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Du har ett nytt meddelande',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Öppna' },
      { action: 'close', title: 'Stäng' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'RehabFlow', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

console.log('[SW] Service Worker loaded');

// ============================================
// PERIODIC BACKGROUND SYNC (Sprint 5.6)
// ============================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-daily-progress') {
    event.waitUntil(syncDailyProgress());
  } else if (event.tag === 'prefetch-exercises') {
    event.waitUntil(prefetchExerciseData());
  }
});

/**
 * Sync daily progress in background
 */
async function syncDailyProgress() {
  console.log('[SW] Running periodic daily progress sync');
  await syncProgress();
  await syncMovementSessions();
}

/**
 * Prefetch exercise data for offline use
 */
async function prefetchExerciseData() {
  console.log('[SW] Prefetching exercise data');
  const cache = await caches.open(DYNAMIC_CACHE);

  // Prefetch common exercise assets
  const exerciseAssets = [
    '/api/exercises/list',
    '/api/exercises/categories',
  ];

  for (const url of exerciseAssets) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log('[SW] Prefetched:', url);
      }
    } catch (error) {
      console.log('[SW] Failed to prefetch:', url);
    }
  }
}

// ============================================
// OFFLINE FALLBACK PAGE (Sprint 5.6)
// ============================================

const OFFLINE_PAGE = '/offline.html';

// Add offline page to static cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.add(OFFLINE_PAGE).catch(() => {
        console.log('[SW] Offline page not available');
      });
    })
  );
});

/**
 * Return offline page when navigation fails
 */
async function handleNavigationOffline(request) {
  try {
    return await CACHE_STRATEGIES.networkFirst(request);
  } catch (error) {
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }
    throw error;
  }
}

// ============================================
// CACHE SIZE MANAGEMENT (Sprint 5.6)
// ============================================

const MAX_CACHE_SIZE = 100; // Max items in dynamic cache
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Clean up old cache entries
 */
async function cleanupCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const keys = await cache.keys();

  if (keys.length > MAX_CACHE_SIZE) {
    // Delete oldest entries
    const toDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE);
    for (const key of toDelete) {
      await cache.delete(key);
    }
    console.log('[SW] Cleaned up', toDelete.length, 'old cache entries');
  }
}

// Run cleanup on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCache());
});

// ============================================
// SHARE TARGET API (Sprint 5.6)
// ============================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle share target
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const title = formData.get('title');
  const text = formData.get('text');
  const url = formData.get('url');

  // Store shared content for the app to process
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SHARE_RECEIVED',
      data: { title, text, url }
    });
  });

  // Redirect to app
  return Response.redirect('/?shared=true', 303);
}

// ============================================
// WORKBOX-LIKE ROUTE MATCHING (Sprint 5.6)
// ============================================

const routes = [
  {
    match: /\/api\/exercises\/.*/,
    strategy: 'staleWhileRevalidate',
    cacheName: 'exercises-cache'
  },
  {
    match: /\/api\/user\/.*/,
    strategy: 'networkFirst',
    cacheName: 'user-cache'
  },
  {
    match: /\.(glb|gltf|fbx)$/,
    strategy: 'cacheFirst',
    cacheName: 'models-cache'
  },
  {
    match: /\.(mp4|webm|ogg)$/,
    strategy: 'cacheFirst',
    cacheName: 'videos-cache'
  }
];

/**
 * Match request against routes
 */
function matchRoute(request) {
  const url = new URL(request.url);

  for (const route of routes) {
    if (route.match.test(url.pathname)) {
      return route;
    }
  }
  return null;
}

// ============================================
// NOTIFICATION SCHEDULING (Sprint 5.6)
// ============================================

/**
 * Schedule a local notification
 */
async function scheduleNotification(title, options, delay) {
  setTimeout(async () => {
    await self.registration.showNotification(title, options);
  }, delay);
}

// Listen for notification scheduling requests
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay } = event.data;
    scheduleNotification(title, options, delay);
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }).then(() => {
        console.log('[SW] All caches cleared');
      })
    );
  }

  if (event.data?.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.source.postMessage({
          type: 'CACHE_SIZE',
          size
        });
      })
    );
  }
});

/**
 * Get total cache size
 */
async function getCacheSize() {
  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.clone().blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}
