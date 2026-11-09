import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { AppTopBar } from '@/components/app/AppTopBar'

export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen w-full overflow-hidden bg-surface font-sans text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />
        <main className="flex-1 overflow-y-auto bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
