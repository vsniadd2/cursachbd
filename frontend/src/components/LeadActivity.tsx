import React from 'react'
import { useTranslation } from 'react-i18next'

export function LeadActivity() {
  const { t } = useTranslation('components')
  const rows = [
    { label: t('leadActivity.r1'), values: [3, 0, 1, 2, 0, 1, 0] },
    { label: t('leadActivity.r2'), values: [4, 1, 4, 3, 1, 3, 4] },
    { label: t('leadActivity.r3'), values: [1, 3, 0, 0, 4, 1, 3] },
  ]

  return (
    <section className="relative rounded-[14px] border border-line bg-surface px-[15px] pt-[15px] pb-[14px] sm:h-[176px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-[15px] tracking-[-0.005em]">{t('leadActivity.title')}</h2>
        <div className="-mt-[6px] flex items-center gap-[4px] text-[12px] text-ink-2 tabular">
          <span className="mr-[2px]">0</span>
          {[LEVELS[0], LEVELS[2], LEVELS[3], LEVELS[4]].map((c) => (
            <span key={c} className="h-[8px] w-[11px] rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-[2px]">10,000+</span>
        </div>
      </div>

      <div className="-mx-[15px] mt-[6px] overflow-x-auto px-[15px] pb-1 sm:mx-0 sm:px-0">
        <div className="grid min-w-[520px] grid-cols-[76px_repeat(7,minmax(0,1fr))] items-center gap-x-[13px] gap-y-[9px]">
          <span />
          {DAYS.map((d) => (
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
                  title={`${DAYS[i]} · ${row.label}: ${COUNTS[v]} leads`}
                  className="h-[24px] rounded-full"
                  style={{ background: LEVELS[v] }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LEVELS = ['#f2f2f3', '#ffe2d4', '#ffd2bd', '#ff9f73', '#ff6b2c']
const COUNTS = ['< 500', '500–2,000', '2,000–5,000', '5,000–10,000', '10,000+']
