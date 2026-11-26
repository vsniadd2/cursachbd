import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function RevenueChart({
  series,
  currency,
}: {
  series: { month: string; actual: number }[]
  currency: string
}) {
  const { t, i18n } = useTranslation('components')
  const [selected, setSelected] = useState<number | null>(null)
  const id = useId().replaceAll(':', '')
  const active = Math.min(selected ?? series.length - 1, series.length - 1)
  const max = Math.max(1, ...series.map((s) => s.actual)) * 1.15
  const x = (i: number) => 16 + (i * 870) / Math.max(1, series.length - 1)
  const y = (value: number) => 364 - (value / max) * 340
  const upper = series.map((s, i) => `${x(i)} ${y(s.actual)}`)
  const lower = [...series].reverse().map((s, i) => `${x(series.length - 1 - i)} ${y(s.actual * 0.45)}`)
  const area = `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`
  const money = (n: number) =>
    new Intl.NumberFormat(i18n.language, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
  const label = (m: string) =>
    new Date(`${m}-01T12:00:00Z`).toLocaleDateString(i18n.language, { month: 'short' })
  const isRu = i18n.language.startsWith('ru')
  return (
    <section className="flex min-w-0 flex-col rounded-[14px] border border-line bg-surface px-4 pt-[18px] pb-[16px] sm:px-[18px]">
      <h2 className="text-[15px] tracking-[-0.005em]">{t('revenueChart.title')}</h2>
      <div className="mt-[18px] flex gap-2">
        <div className="relative mt-6 h-[246px] w-10 shrink-0">
          {[1, 0.8, 0.6, 0.4, 0.2, 0].map((v, i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2 text-[11px] text-ink-2"
              style={{ top: `${i * 20}%` }}
            >
              {Math.round(max * v).toLocaleString(i18n.language, { notation: 'compact' })}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[8px] border border-[#efeff1]">
            <div className="flex h-6 items-center justify-between border-b border-[#efeff1] px-2">
              <span className="text-[18px] font-medium tabular">{money(series[active]?.actual ?? 0)}</span>
              <span className="text-[11px] text-ink-2">
                {series[active]?.month} · {isRu ? 'Оплачено' : 'Paid'}
              </span>
            </div>
            <div className="relative h-[246px]" onMouseLeave={() => setSelected(null)}>
              <svg
                role="img"
                aria-label={`${t('revenueChart.title')} · ${currency}`}
                viewBox="0 0 903 387"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <pattern
                    id={id}
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="24" height="24" fill="var(--color-brand-soft)" />
                    <rect width="11" height="24" fill="var(--color-brand-3)" />
                  </pattern>
                </defs>
                <path
                  d={area}
                  fill="none"
                  stroke="#f3f3f4"
                  strokeWidth="16"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path d={area} fill={`url(#${id})`} />
              </svg>
              <div className="absolute inset-0 flex">
                {series.map((s, i) => (
                  <button
                    type="button"
                    aria-label={`${s.month}: ${money(s.actual)}`}
                    key={s.month}
                    className="h-full flex-1 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    onFocus={() => setSelected(i)}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => setSelected(i)}
                  />
                ))}
              </div>
              <div
                className="pointer-events-none absolute top-[8.8%] bottom-[5.2%] w-[6.9%] -translate-x-1/2 rounded-full border-[3px] border-brand transition-[left] duration-200"
                style={{
                  left: `${Math.max(5, Math.min(95, (x(active) / 903) * 100))}%`,
                  background:
                    'repeating-linear-gradient(135deg, var(--color-brand-2) 0 7px, var(--color-brand-4) 7px 13px)',
                }}
              >
                <span
                  className={`absolute top-[22%] rounded-[7px] bg-ink px-[7px] py-[6px] text-[10.5px] leading-none whitespace-nowrap text-white ${active === series.length - 1 ? 'right-[calc(100%+6px)]' : 'left-[calc(100%+6px)]'}`}
                >
                  {money(series[active]?.actual ?? 0)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-ink-2">
            {series.map((s) => (
              <span key={s.month}>{label(s.month)}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-ink-2">
        {isRu
          ? 'Оплаченная выручка по месяцам. Верхняя граница полосы — сумма оплат; ширина полосы декоративная.'
          : 'Monthly paid revenue. The upper edge shows payments; band thickness is decorative.'}
      </p>
    </section>
  )
}
