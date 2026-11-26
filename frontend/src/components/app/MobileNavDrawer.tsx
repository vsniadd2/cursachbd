import { X } from 'lucide-react'
import { SidebarNav } from '@/components/app/SidebarNav'
import { WorkspaceDialog } from '@/components/app/WorkspaceDialog'
import type { NavBadges } from '@/hooks/useNavBadges'
import { useWords } from '@/lib/product'

export function MobileNavDrawer({ badges, onClose }: { badges: NavBadges; onClose: () => void }) {
  const w = useWords()
  return (
    <WorkspaceDialog
      id="workspace-navigation"
      label={w('Навигация', 'Navigation')}
      onClose={onClose}
      className="workspace-drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(300px,88vw)] max-w-none overflow-hidden rounded-r-2xl bg-shell"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 className="text-sm font-semibold">{w('Навигация', 'Navigation')}</h2>
          <button
            type="button"
            aria-label={w('Закрыть меню', 'Close menu')}
            className="grid size-9 place-items-center rounded-lg border border-line bg-surface"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <SidebarNav badges={badges} showCollapse={false} onNavigate={onClose} className="min-h-0 flex-1" />
      </div>
    </WorkspaceDialog>
  )
}
