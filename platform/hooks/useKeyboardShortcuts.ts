/**
 * useKeyboardShortcuts Hook
 * Kullanım: Global keyboard shortcuts yönetimi
 * Bağımlılıklar: None
 */

import { useEffect, useCallback } from 'react'

type KeyModifier = 'ctrl' | 'cmd' | 'alt' | 'shift'
type KeyCombo = {
  key: string
  modifiers?: KeyModifier[]
  callback: (event: KeyboardEvent) => void
  description?: string
}

type ShortcutDisplay = {
  key: string
  modifiers?: KeyModifier[]
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyCombo[]
  enabled?: boolean
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions) => {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      for (const shortcut of shortcuts) {
        const { key, modifiers = [], callback } = shortcut

        // Check if key matches
        const keyMatch = event.key.toLowerCase() === key.toLowerCase()
        if (!keyMatch) continue

        // Check modifiers
        const ctrlMatch = modifiers.includes('ctrl') || modifiers.includes('cmd')
        const altMatch = modifiers.includes('alt')
        const shiftMatch = modifiers.includes('shift')

        // Mac: cmd key, Windows/Linux: ctrl key
        const ctrlPressed = isMac ? event.metaKey : event.ctrlKey
        const altPressed = event.altKey
        const shiftPressed = event.shiftKey

        // Match all required modifiers
        const modifiersMatch =
          (ctrlMatch ? ctrlPressed : !ctrlPressed) &&
          (altMatch ? altPressed : !altPressed) &&
          (shiftMatch ? shiftPressed : !shiftPressed)

        if (modifiersMatch) {
          event.preventDefault()
          callback(event)
          break
        }
      }
    },
    [shortcuts, enabled, isMac]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  // Return utility function to format shortcut display
  const formatShortcut = useCallback(
    (combo: ShortcutDisplay): string => {
      const modifierSymbols: Record<KeyModifier, string> = {
        ctrl: isMac ? '⌘' : 'Ctrl',
        cmd: '⌘',
        alt: isMac ? '⌥' : 'Alt',
        shift: '⇧'
      }

      const parts: string[] = []

      if (combo.modifiers) {
        combo.modifiers.forEach((mod) => {
          if (mod === 'cmd' || mod === 'ctrl') {
            parts.push(isMac ? '⌘' : 'Ctrl')
          } else {
            parts.push(modifierSymbols[mod])
          }
        })
      }

      parts.push(combo.key.toUpperCase())

      return parts.join(' + ')
    },
    [isMac]
  )

  return { formatShortcut }
}
