import { useEffect } from 'react'
import { SidebarNav } from '@/components/app/SidebarNav'
import { cn } from '@/lib/utils'

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute top-0 left-0 flex h-full w-[min(280px,88vw)] flex-col border-r border-line bg-shell shadow-[4px_0_24px_rgba(23,23,26,0.08)] transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <SidebarNav showCollapse={false} onNavigate={onClose} className="h-full" />
      </div>
    </div>
  )
}
