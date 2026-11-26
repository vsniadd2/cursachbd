import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function WorkspaceDialog({
  label,
  onClose,
  children,
  className,
  dismissible = true,
  id,
}: {
  label: string
  onClose: () => void
  children: ReactNode
  className?: string
  dismissible?: boolean
  id?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={ref}
      id={id}
      aria-label={label}
      className={cn('workspace-dialog border border-line bg-surface text-ink shadow-xl', className)}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || !dismissible) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ) {
          onClose()
        }
      }}
    >
      {children}
    </dialog>
  )
}
