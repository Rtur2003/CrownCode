/**
 * Search Results Component
 * Kullanım: Display search results in modal
 * Bağımlılıklar: SearchItem from useSearch
 */

import React from 'react'
import { Home, Music, Wrench, FolderOpen, ArrowRight } from 'lucide-react'
import { SearchItem } from '@/hooks/useSearch'
import { useLanguage } from '@/context/LanguageContext'

interface SearchResultsProps {
  results: SearchItem[]
  query: string
  onSelect: (item: SearchItem) => void
}

const iconMap: Record<string, React.ReactNode> = {
  home: <Home size={18} />,
  'ai-music': <Music size={18} />,
  'ml-toolkit': <Wrench size={18} />,
  projects: <FolderOpen size={18} />,
  upload: <Music size={18} />,
  'url-analysis': <Music size={18} />,
  'data-augmentation': <Wrench size={18} />
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  onSelect
}) => {
  const { t } = useLanguage()

  // Group results by category
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  // Check if we have results
  const hasResults = results.length > 0

  if (!query.trim()) {
    return (
      <div className="search-results">
        <div className="search-empty-state">
          <p className="search-hint">
            {t.search?.placeholder || 'Type to search...'}
          </p>
        </div>
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="search-results">
        <div className="search-empty-state">
          <p className="search-no-results">
            {t.search?.noResults || 'No results found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results">
      {Object.entries(groupedResults).map(([category, items]) => (
        <div key={category} className="search-category">
          <h3 className="search-category-title">
            {t.search?.categories?.[category as 'pages' | 'features'] || category}
          </h3>
          <div className="search-items">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="search-item"
              >
                <div className="search-item-icon">
                  {iconMap[item.id] || <ArrowRight size={18} />}
                </div>
                <div className="search-item-content">
                  <div className="search-item-title">{item.title}</div>
                  {item.description && (
                    <div className="search-item-description">
                      {item.description}
                    </div>
                  )}
                </div>
                <div className="search-item-arrow">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
