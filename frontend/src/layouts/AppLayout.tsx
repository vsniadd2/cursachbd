import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { AppTopBar } from '@/components/app/AppTopBar'
import { MobileNavDrawer } from '@/components/app/MobileNavDrawer'
import { PageFeedback } from '@/components/app/PageFeedback'
import { useSidebarCompact } from '@/hooks/useSidebarCompact'
import { useNavBadges } from '@/hooks/useNavBadges'
import { useWords } from '@/lib/product'
import './workspace.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const w = useWords()
  const main = useRef<HTMLElement>(null)
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const drawerOpen = menuPath === pathname
  const { compact, toggle: toggleSidebarCompact } = useSidebarCompact()
  const badges = useNavBadges()

  useLayoutEffect(() => {
    main.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const desktop = window.matchMedia('(min-width: 64rem)')
    function onResize(event: MediaQueryListEvent) {
      if (event.matches) setMenuPath(null)
    }
    desktop.addEventListener('change', onResize)
    return () => desktop.removeEventListener('change', onResize)
  }, [drawerOpen])

  return (
    <div className="app-workspace flex h-dvh w-full overflow-hidden bg-canvas font-sans text-ink">
      <Sidebar badges={badges} compact={compact} onToggleCompact={toggleSidebarCompact} />
      {drawerOpen && <MobileNavDrawer badges={badges} onClose={() => setMenuPath(null)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar badges={badges} menuOpen={drawerOpen} onOpenMenu={() => setMenuPath(pathname)} />
        <main ref={main} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
          <Suspense
            fallback={
              <PageFeedback state="loading" className="m-4 sm:m-6">
                {w('Загрузка…', 'Loading…')}
              </PageFeedback>
            }
          >
            <div key={pathname} className="workspace-route">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
