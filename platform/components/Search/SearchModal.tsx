/**
 * Search Modal Component
 * Kullanım: Global search modal (Cmd+K)
 * Bağımlılıklar: useSearch, useKeyboardShortcuts, SearchResults
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useLanguage } from '@/context/LanguageContext'
import { SearchResults } from './SearchResults'

export const SearchModal: React.FC = () => {
  const {
    query,
    setQuery,
    isOpen,
    openSearch,
    closeSearch,
    results,
    navigateToItem
  } = useSearch()

  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        modifiers: ['ctrl'],
        callback: (e) => {
          e.preventDefault()
          openSearch()
        }
      },
      {
        key: 'Escape',
        modifiers: [],
        callback: closeSearch
      }
    ],
    enabled: true
  })

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) { return null }

  return (
    <AnimatePresence>
      <div className="search-modal-overlay" onClick={closeSearch}>
        <motion.div
          className="search-modal"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="search-input-wrapper">
            <SearchIcon size={20} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search?.placeholder || 'Search... (Ctrl+K)'}
              className="search-input"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              onClick={closeSearch}
              className="search-close"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Results */}
          <SearchResults
            results={results}
            query={query}
            onSelect={navigateToItem}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
