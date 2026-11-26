import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SLICE_KEYS = ['website', 'email', 'automation'] as const

const SLICE_META = [
  { value: 23, fill: 'var(--color-brand-3)', text: 'var(--color-ink)', dot: 'var(--color-brand)' },
  { value: 32, fill: 'var(--color-brand-2)', text: '#ffffff', dot: 'var(--color-brand-2)' },
  { value: 45, fill: 'var(--color-brand)', text: '#ffffff', dot: 'var(--color-brand-3)' },
] as const

const DEFAULT_ARCS = SLICE_META.reduce<{ from: number; to: number }[]>((acc, s) => {
  const from = acc.length ? acc[acc.length - 1].to : -97
  acc.push({ from, to: from + s.value * 3.6 })
  return acc
}, [])

export function Touchpoints({
  segments,
  title,
}: {
  segments?: { label: string; value: number }[]
  title?: string
}) {
  const { t } = useTranslation('components')
  const [hover, setHover] = useState<number | null>(null)
  const total = segments?.reduce((sum, s) => sum + s.value, 0) ?? 100
  const slices = SLICE_KEYS.map((k, i) => ({
    ...SLICE_META[i],
    label: segments?.[i]?.label ?? t(`touchpoints.${k}`),
    value: segments ? (total ? Math.round((segments[i].value / total) * 100) : 0) : SLICE_META[i].value,
  }))
  const arcs = segments
    ? segments.reduce<{ from: number; to: number }[]>((acc, s) => {
        const from = acc.length ? acc[acc.length - 1].to : -97
        acc.push({ from, to: from + (total ? (s.value / total) * 359.999 : 0) })
        return acc
      }, [])
    : DEFAULT_ARCS

  return (
    <section className="flex items-stretch justify-between gap-3 rounded-[14px] border border-line bg-surface px-[15px] py-[15px] sm:h-[176px]">
      <div className="flex min-w-0 flex-col justify-between">
        <h2 className="text-[15px] tracking-[-0.005em]">{title ?? t('touchpoints.title')}</h2>
        <ul className="mt-4 space-y-[9px] pb-[18px]">
          {slices.map((s, i) => (
            <li
              key={s.label}
              className="flex items-center gap-[7px] text-[12.5px]"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="size-[7px] rounded-full" style={{ background: s.dot }} />
              <span className={hover === i ? 'text-ink' : 'text-ink-2'}>{s.label}</span>
              <span className="ml-auto tabular text-ink">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
      <svg
        role="img"
        aria-label={title ?? t('touchpoints.title')}
        viewBox="-100 -100 200 200"
        className="size-[120px] shrink-0 self-center"
      >
        {!total && <circle r="100" fill="#f2f2f3" />}
        {slices.map((s, i) => {
          const { from, to } = arcs[i]
          const large = to - from > 180 ? 1 : 0
          const start = polar(from)
          const end = polar(to)
          const d = `M 0 0 L ${start[0]} ${start[1]} A 100 100 0 ${large} 1 ${end[0]} ${end[1]} Z`
          return (
            <path
              key={s.label}
              d={d}
              fill={s.fill}
              opacity={hover == null || hover === i ? 1 : 0.55}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>
    </section>
  )
}

function polar(deg: number) {
  const r = (deg * Math.PI) / 180
  return [Math.cos(r) * 100, Math.sin(r) * 100]
}
