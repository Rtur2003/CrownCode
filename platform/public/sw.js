// DevForge Suite - Service Worker
// Version 1.0.0

const CACHE_NAME = 'devforge-suite-v1'
const STATIC_CACHE = 'devforge-static-v1'
const DYNAMIC_CACHE = 'devforge-dynamic-v1'

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/hasan-arthur-profile.jpg',
  '/_next/static/css/app.css',
]

// Pages to cache
const PAGES_TO_CACHE = [
  '/',
  '/projects',
  '/about',
  '/contact'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Fetch and cache new requests
        return fetch(request)
          .then((response) => {
            // Don't cache if not ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone response for caching
            const responseToCache = response.clone()

            // Cache dynamic content
            if (
              request.url.includes('/_next/') ||
              request.url.includes('/api/') ||
              PAGES_TO_CACHE.includes(url.pathname)
            ) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
            }

            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/favicon-32x32.png',
      badge: '/favicon-16x16.png',
      image: data.image,
      tag: data.tag,
      data: data.data,
      actions: data.actions,
      vibrate: [100, 50, 100],
      dir: 'ltr',
      lang: 'tr'
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync offline data when connection is restored
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.put(request, response.clone())
        }
      } catch (error) {
        console.error('Background sync failed for:', request.url, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Cache cleanup
setInterval(() => {
  caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      cache.keys()
        .then((requests) => {
          if (requests.length > 50) {
            // Remove oldest entries
            cache.delete(requests[0])
          }
        })
    })
}, 60000) // Clean every minute