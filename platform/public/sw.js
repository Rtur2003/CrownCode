// CrownCode Platform - Service Worker
// Version 5.0.0
//
// Offline fallback and cached build output only. There is no push or
// background-sync feature on the site, so this worker has no handlers for them.

const STATIC_CACHE = 'crowncode-static-v5'
const DYNAMIC_CACHE = 'crowncode-dynamic-v5'
const MAX_DYNAMIC_ENTRIES = 50

// offline.html is the navigation fallback and can't be fetched once the
// network is gone, so installing without it must fail.
const OFFLINE_PAGE = '/offline.html'
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/fonts/im-fell-double-pica-regular.woff2',
  '/fonts/portmanteau-regular.woff2',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        await cache.add(OFFLINE_PAGE)
        // A missing icon or font shouldn't stop the worker from installing.
        await Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
      })
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

// Trim cache to a maximum number of entries (oldest first)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
  }
}

// Store a copy of a response, then keep the cache within its bound.
async function remember(request, response) {
  const cache = await caches.open(DYNAMIC_CACHE)
  await cache.put(request, response)
  await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES)
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
    event.respondWith(cacheFirst(event))
    return
  }

  // HTML and data are network-first: a cached page from an older deploy
  // would reference chunk hashes that no longer exist and fail to hydrate.
  // The cached copy is only an offline fallback.
  if (request.mode === 'navigate' || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(networkFirst(event))
  }
})

async function cacheFirst(event) {
  const { request } = event
  const cached = await caches.match(request)
  if (cached) {return cached}

  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type === 'basic') {
      event.waitUntil(remember(request, response.clone()))
    }
    return response
  } catch {
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE)
    }
    return new Response('', { status: 503 })
  }
}

async function networkFirst(event) {
  const { request } = event
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type === 'basic') {
      event.waitUntil(remember(request, response.clone()))
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) {return cached}
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE)
    }
    return new Response('', { status: 503 })
  }
}
