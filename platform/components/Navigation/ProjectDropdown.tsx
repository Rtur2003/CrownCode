/**
 * Project Dropdown Component
 * Kullanım: Header'da proje menüsü için
 * Bağımlılıklar: Header komponenti tarafından kullanılır
 */

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ExternalLink } from 'lucide-react'

interface Project {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
  description?: string
  external?: boolean
}

interface ProjectDropdownProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
}

export const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close dropdown on route change
  useEffect(() => {
    onClose()
  }, [router.pathname, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) { return null }

  const isActiveProject = (href: string) => {
    return router.pathname.startsWith(href)
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50 animate-fade-in"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="p-2">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border mb-2">
          <h3 className="text-sm font-semibold text-text-primary">
            Aktif Projeler
          </h3>
          <p className="text-xs text-text-muted mt-1">
            DevForge Suite platformundaki projeler
          </p>
        </div>

        {/* Projects List */}
        <div className="space-y-1">
          {projects.map((project) => {
            const ProjectComponent = project.external ? 'a' : Link
            const linkProps = project.external
              ? {
                  href: project.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: project.href }

            return (
              <ProjectComponent
                key={project.href}
                {...linkProps}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-200 hover:bg-surface group ${
                  !project.external && isActiveProject(project.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                role="menuitem"
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
                  project.badge === 'Aktif'
                    ? 'bg-success/20 text-success'
                    : project.badge === 'Yakında'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {project.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm leading-none">
                      {project.label}
                    </span>
                    {project.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        project.badge === 'Aktif'
                          ? 'bg-success/20 text-success'
                          : project.badge === 'Yakında'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {project.badge}
                      </span>
                    )}
                    {project.external && (
                      <ExternalLink size={12} className="text-text-muted" />
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              </ProjectComponent>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border">
          <Link
            href="/projects"
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors duration-200"
          >
            Tüm Projeleri Görüntüle
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProjectDropdown