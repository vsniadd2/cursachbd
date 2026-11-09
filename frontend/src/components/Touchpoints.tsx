import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SLICE_KEYS = ['website', 'email', 'automation'] as const

const SLICE_META = [
  { value: 23, fill: '#ffcdb5', text: '#3b2a22', dot: '#ff6b2c' },
  { value: 32, fill: '#ff9a6b', text: '#ffffff', dot: '#ff9a6b' },
  { value: 45, fill: '#ff6b2c', text: '#ffffff', dot: '#ffcdb5' },
] as const

const SLICE_ARCS = SLICE_META.reduce<{ from: number; to: number }[]>((acc, s) => {
  const from = acc.length ? acc[acc.length - 1].to : -97
  acc.push({ from, to: from + s.value * 3.6 })
  return acc
}, [])

export function Touchpoints() {
  const { t } = useTranslation('components')
  const [hover, setHover] = useState<number | null>(null)
  const slices = SLICE_KEYS.map((k, i) => ({ ...SLICE_META[i], label: t(`touchpoints.${k}`) }))

  return (
    <section className="flex items-stretch justify-between gap-3 rounded-[14px] border border-line bg-surface px-[15px] py-[15px] sm:h-[176px]">
      <div className="flex min-w-0 flex-col justify-between">
        <h2 className="text-[15px] tracking-[-0.005em]">{t('touchpoints.title')}</h2>
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
      <svg viewBox="-100 -100 200 200" className="size-[120px] shrink-0 self-center">
        {slices.map((s, i) => {
          const { from, to } = SLICE_ARCS[i]
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
