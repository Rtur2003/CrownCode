/**
 * Mobile Navigation Component
 * Kullanım: Mobil cihazlarda alt navigasyon için
 * Bağımlılıklar: styles/components/mobile-navigation.css
 */

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Home,
  FolderOpen,
  Music,
  Brain,
  User,
  Search,
  BookOpen
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  isActive?: boolean
}

export const MobileNavigation: React.FC = () => {
  const router = useRouter()

  const isActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  // Main navigation items for mobile bottom bar
  const navigationItems: NavigationItem[] = [
    {
      label: 'Ana Sayfa',
      href: '/',
      icon: <Home size={20} />,
    },
    {
      label: 'Projeler',
      href: '/projects',
      icon: <FolderOpen size={20} />,
    },
    {
      label: 'AI Müzik',
      href: '/ai-music-detection',
      icon: <Music size={20} />,
      badge: 'Aktif',
    },
    {
      label: 'Dokümanlar',
      href: '/docs',
      icon: <BookOpen size={20} />,
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border safe-area-inset-bottom"
      role="navigation"
      aria-label="Ana navigasyon"
    >
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-2 py-2
                transition-all duration-200 relative group
                ${isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-primary'
                }
              `}
              aria-label={item.label}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}

              {/* Icon with badge */}
              <div className="relative flex items-center justify-center">
                <div className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {item.icon}
                </div>

                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full">
                    <div className="absolute inset-0 bg-success rounded-full animate-ping" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>

              {/* Hover effect */}
              <div className={`
                absolute inset-0 rounded-lg transition-colors duration-200
                ${isActive
                  ? 'bg-primary/5'
                  : 'group-hover:bg-surface/50'
                }
              `} />
            </Link>
          )
        })}
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background/90" />
    </nav>
  )
}

export default MobileNavigation