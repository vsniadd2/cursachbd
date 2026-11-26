import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title?: string
  description?: string
  actions?: ReactNode
}) {
  if (!title && !actions) return null
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      {title ? (
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
          {description && <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-2">{description}</p>}
        </div>
      ) : (
        <div />
      )}
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{actions}</div>
      )}
    </div>
  )
}
