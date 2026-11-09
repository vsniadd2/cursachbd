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
  OVERDUE: 'bg-brand-soft text-brand',
}

export function StatusBadge({ value }: { value: string }) {
  const key = value.replace(/\s+/g, '_').toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        STYLES[key] ?? 'bg-cell text-ink-2',
      )}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}
