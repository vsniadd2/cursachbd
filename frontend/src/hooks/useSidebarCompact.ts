import { useCallback, useState } from 'react'

const STORAGE_KEY = 'flexora-sidebar-compact'

function readInitial(): boolean {
  try {
    if (localStorage.getItem('flexora-sidebar-collapsed') === '1') {
      localStorage.removeItem('flexora-sidebar-collapsed')
      localStorage.setItem(STORAGE_KEY, '1')
      return true
    }
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useSidebarCompact() {
  const [compact, setCompact] = useState(readInitial)

  const toggle = useCallback(() => {
    setCompact((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { compact, toggle }
}
