import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Inbox, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = { loading: LoaderCircle, error: CircleAlert, success: CircleCheck, empty: Inbox }

export function PageFeedback({
  state,
  children,
  className,
}: {
  state: keyof typeof icons
  children: ReactNode
  className?: string
}) {
  const Icon = icons[state]
  return (
    <div
      className={cn('workspace-feedback', state !== 'loading' && 'workspace-enter', className)}
      data-state={state}
      role={state === 'error' ? 'alert' : state === 'loading' || state === 'success' ? 'status' : undefined}
    >
      <Icon aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
