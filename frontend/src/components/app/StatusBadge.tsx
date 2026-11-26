import { useTranslation } from 'react-i18next'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  LEAD: 'bg-brand-soft text-brand',
  ACTIVE: 'bg-pos-soft text-pos',
  INACTIVE: 'bg-cell text-ink-2',
  CHURNED: 'bg-cell text-ink-3',
  PLANNING: 'bg-cell text-ink-2',
  ON_HOLD: 'bg-brand-soft text-brand',
  COMPLETED: 'bg-pos-soft text-pos',
  TODO: 'bg-cell text-ink-2',
  IN_PROGRESS: 'bg-brand-soft text-brand',
  DONE: 'bg-pos-soft text-pos',
  DRAFT: 'bg-cell text-ink-2',
  PAID: 'bg-pos-soft text-pos',
  SENT: 'bg-brand-soft text-brand',
  OVERDUE: 'bg-danger-soft text-danger-strong',
  URGENT: 'bg-danger-soft text-danger-strong',
  HIGH: 'bg-warning-soft text-warning',
  REVIEW: 'bg-warning-soft text-warning',
  PAUSED: 'bg-warning-soft text-warning',
  MEDIUM: 'bg-cell text-ink-2',
  LOW: 'bg-cell text-ink-3',
}

const ICONS = {
  COMPLETED: CircleCheck,
  DONE: CircleCheck,
  PAID: CircleCheck,
  OVERDUE: CircleAlert,
  URGENT: CircleAlert,
}

export function StatusBadge({ value }: { value: string }) {
  const { t } = useTranslation('components')
  const key = value.replace(/\s+/g, '_').toUpperCase()
  const label = t(`status.${key}`, { defaultValue: value.replace(/_/g, ' ') })
  const Icon = ICONS[key as keyof typeof ICONS]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
        STYLES[key] ?? 'bg-cell text-ink-2',
      )}
    >
      {Icon && <Icon className="size-3 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  )
}
