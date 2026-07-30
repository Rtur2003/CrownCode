// CrownCode Platform - Service Worker
// Version 3.0.0

const STATIC_CACHE = 'crowncode-static-v3'
const DYNAMIC_CACHE = 'crowncode-dynamic-v3'
const MAX_DYNAMIC_ENTRIES = 50

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// Pages that use network-first (daily/dynamic content)
const NETWORK_FIRST_PAGES = [
  '/crown-fortune',
]

// Pages that use cache-first with background revalidation
const CACHEABLE_PAGES = [
  '/',
  '/ai-music-detection',
  '/crown-dreams',
  '/crown-commend',
  '/crown-vote',
  '/data-manipulation',
  '/search',
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

  // Network-first for pages with daily/dynamic content
  if (NETWORK_FIRST_PAGES.includes(url.pathname)) {
    event.respondWith(networkFirst(request))
    return
  }

  // Cache-first for static assets and cacheable pages
  if (
    request.url.includes('/_next/static/') ||
    CACHEABLE_PAGES.includes(url.pathname)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Network-first for other _next resources (data, chunks)
  if (request.url.includes('/_next/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Default: network only (no caching for unknown routes)
  event.respondWith(fetch(request))
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
