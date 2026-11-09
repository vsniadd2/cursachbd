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
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      {title ? (
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.005em]">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-ink-2">{description}</p>}
        </div>
      ) : (
        <div />
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
