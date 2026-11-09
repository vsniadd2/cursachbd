import { useEffect, useState, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { AppTopBar } from '@/components/app/AppTopBar'
import { MobileNavDrawer } from '@/components/app/MobileNavDrawer'
import { useSidebarCompact } from '@/hooks/useSidebarCompact'

export function AppLayout() {
  const { pathname } = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(pathname)
  const drawerOpen = mobileNavOpen && menuPath === pathname
  const { compact, toggle: toggleSidebarCompact } = useSidebarCompact()

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const openMobileNav = useCallback(() => {
    setMenuPath(pathname)
    setMobileNavOpen(true)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  return (
    <div className="flex h-full min-h-screen w-full overflow-hidden bg-surface font-sans text-ink">
      <Sidebar compact={compact} onToggleCompact={toggleSidebarCompact} />
      <MobileNavDrawer open={drawerOpen} onClose={closeMobileNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar onOpenMenu={openMobileNav} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
