/**
 * PWA Hook
 * Kullanım: Progressive Web App özelliklerini yönetmek için
 * Bağımlılıklar: Service Worker API
 */

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

// Extend ServiceWorkerRegistration to include sync
interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  swRegistration: ServiceWorkerRegistration | null
}

interface UsePWAOptions {
  swPath?: string
  enableNotifications?: boolean
  enableBackgroundSync?: boolean
}

export const usePWA = (options: UsePWAOptions = {}) => {
  const {
    swPath = '/sw.js',
    enableNotifications = true,
    enableBackgroundSync = true
  } = options

  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator?.onLine ?? true,
    isUpdateAvailable: false,
    swRegistration: null
  })

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log('SW registered: ', registration)
          setState(prev => ({ ...prev, swRegistration: registration }))

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, isUpdateAvailable: true }))
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log('SW registration failed: ', error)
        })
    }
  }, [swPath])

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState(prev => ({ ...prev, isInstallable: true }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install app
  const installApp = async () => {
    if (!deferredPrompt) { return false }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstallable: false }))
        setDeferredPrompt(null)
        return true
      }
    } catch (error) {
      console.error('Install failed:', error)
    }

    return false
  }

  // Update app
  const updateApp = () => {
    if (state.swRegistration?.waiting) {
      state.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!enableNotifications || !('Notification' in window)) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Notification permission failed:', error)
      return false
    }
  }

  // Send notification
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!enableNotifications || Notification.permission !== 'granted') {
      return
    }

    if (state.swRegistration) {
      state.swRegistration.showNotification(title, {
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        ...options
      })
    } else {
      new Notification(title, options)
    }
  }

  // Register background sync
  const registerBackgroundSync = async (tag: string) => {
    const swReg = state.swRegistration as ServiceWorkerRegistrationWithSync | null;
    
    if (!enableBackgroundSync || !swReg?.sync) {
      return false
    }

    try {
      await swReg.sync.register(tag)
      return true
    } catch (error) {
      console.error('Background sync registration failed:', error)
      return false
    }
  }

  // Share content
  const shareContent = async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
    return false
  }

  return {
    ...state,
    installApp,
    updateApp,
    requestNotificationPermission,
    sendNotification,
    registerBackgroundSync,
    shareContent
  }
}

export default usePWA