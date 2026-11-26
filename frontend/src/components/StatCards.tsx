import type { CSSProperties } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export type DashboardMetric = {
  title: string
  value: string | number
  link: string
  icon: LucideIcon
}

export function StatCards({ metrics, caption }: { metrics: DashboardMetric[]; caption: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ title, value, link, icon: Icon }, index) => (
        <Link
          key={title}
          to={link}
          className="workspace-surface workspace-interactive group flex min-h-[130px] min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-ink-2">{title}</h3>
            <span
              className="workspace-metric-icon grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong"
              style={{ '--metric-index': index } as CSSProperties}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
          </div>
          <p className="text-[clamp(1.3rem,2.2vw,1.75rem)] leading-none font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere]">
            {value}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-ink-2">
            <span>{caption}</span>
            <ArrowUpRight className="size-4 shrink-0 text-brand-strong" aria-hidden="true" />
          </div>
        </Link>
      ))}
    </div>
  )
}
