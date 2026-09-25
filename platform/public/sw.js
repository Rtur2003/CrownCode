// CrownCode Platform - Service Worker
// Version 4.0.0

const STATIC_CACHE = 'crowncode-static-v4'
const DYNAMIC_CACHE = 'crowncode-dynamic-v4'
const MAX_DYNAMIC_ENTRIES = 50

// Assets to cache on install. offline.html must be here: it is the
// navigation fallback and can't be fetched once the network is gone.
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/fonts/im-fell-double-pica-regular.woff2',
  '/fonts/portmanteau-regular.woff2',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event — clean old caches and trim dynamic cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES))
      .then(() => self.clients.claim())
  )
})

// Trim cache to a maximum number of entries
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
  }
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {return}
  if (url.origin !== location.origin) {return}
  if (url.pathname.startsWith('/api/')) {return}

  // Hashed build output never changes under the same URL: cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML and data are network-first: a cached page from an older deploy
  // would reference chunk hashes that no longer exist and fail to hydrate.
  // The cached copy is only an offline fallback.
  if (request.mode === 'navigate' || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(networkFirst(request))
  }
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {return cached}

  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    return new Response('', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) {return cached}
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    return new Response('', { status: 503 })
  }
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
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
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.put(request, response.clone())
        }
      } catch {
        // Skip failed requests during sync
      }
    }
  } catch {
    // Sync failed, will retry on next sync event
  }
}
