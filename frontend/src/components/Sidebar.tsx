import { SidebarNav } from '@/components/app/SidebarNav'
import { cn } from '@/lib/utils'

export function Sidebar({
  compact,
  onToggleCompact,
}: {
  compact?: boolean
  onToggleCompact?: () => void
}) {
  return (
    <aside
      className={cn(
        'hidden h-full shrink-0 flex-col border-r border-line transition-[width] duration-200 ease-out lg:flex',
        compact ? 'w-[72px]' : 'w-[237px]',
      )}
    >
      <SidebarNav className="h-full" compact={compact} onToggleCompact={onToggleCompact} />
    </aside>
  )
}
