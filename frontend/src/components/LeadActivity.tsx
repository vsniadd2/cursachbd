import React from 'react'
import { useTranslation } from 'react-i18next'

export function LeadActivity({
  activity,
  title,
}: {
  activity?: { label: string; values: number[] }[]
  title?: string
}) {
  const { t, i18n } = useTranslation('components')
  const rows = activity ?? [
    { label: t('leadActivity.r1'), values: [3, 0, 1, 2, 0, 1, 0] },
    { label: t('leadActivity.r2'), values: [4, 1, 4, 3, 1, 3, 4] },
    { label: t('leadActivity.r3'), values: [1, 3, 0, 0, 4, 1, 3] },
  ]

  const max = Math.max(1, ...rows.flatMap((r) => r.values))
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: 'UTC' })
  const days = Array.from({ length: 7 }, (_, i) => weekday.format(Date.UTC(2024, 0, 7 + i)))
  return (
    <section className="workspace-surface relative min-w-0 rounded-[14px] border border-line bg-surface px-[15px] pt-[15px] pb-[14px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-[15px] tracking-[-0.005em]">{title ?? t('leadActivity.title')}</h2>
        <div className="-mt-[6px] flex items-center gap-[4px] text-[12px] text-ink-2 tabular">
          <span className="mr-[2px]">0</span>
          {[LEVELS[0], LEVELS[2], LEVELS[3], LEVELS[4]].map((c) => (
            <span key={c} className="h-[8px] w-[11px] rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-[2px]">{activity ? max : '10,000+'}</span>
        </div>
      </div>

      <div className="-mx-[15px] mt-[6px] overflow-x-auto px-[15px] pb-1 sm:mx-0 sm:px-0" role="region" aria-label={title ?? t('leadActivity.title')} tabIndex={0}>
        <div className="grid min-w-[380px] grid-cols-[76px_repeat(7,minmax(0,1fr))] items-center gap-x-2 gap-y-[9px]">
          <span />
          {days.map((d) => (
            <span key={d} className="text-center text-[12.5px] text-ink-2">
              {d}
            </span>
          ))}
          {rows.map((row) => (
            <React.Fragment key={row.label}>
              <span className="text-[12.5px] whitespace-nowrap text-ink-2">{row.label}</span>
              {row.values.map((v, i) => (
                <span
                  key={i}
                  title={`${days[i]} · ${row.label}: ${activity ? v : COUNTS[v]}`}
                  className="grid h-6 place-items-center rounded-full text-[11px] font-medium tabular-nums"
                  style={{
                    background: LEVELS[activity ? Math.ceil((v / max) * 4) : v],
                    color: activity && v / max > 0.75 ? 'white' : 'var(--color-ink)',
                  }}
                >
                  {activity && v}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

const LEVELS = [
  'var(--color-shell)',
  'var(--color-brand-4)',
  'var(--color-brand-3)',
  'var(--color-brand-2)',
  'var(--color-brand)',
]
const COUNTS = ['< 500', '500–2,000', '2,000–5,000', '5,000–10,000', '10,000+']
