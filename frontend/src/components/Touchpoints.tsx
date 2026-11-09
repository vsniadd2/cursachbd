import React, { useState } from 'react'

const SLICES = [
  { label: 'Website', value: 23, fill: '#ffcdb5', text: '#3b2a22', dot: '#ff6b2c' },
  { label: 'Email Campaigns', value: 32, fill: '#ff9a6b', text: '#ffffff', dot: '#ff9a6b' },
  { label: 'Automation & Integrations', value: 45, fill: '#ff6b2c', text: '#ffffff', dot: '#ffcdb5' },
] as const

const SLICE_ARCS = SLICES.reduce<{ from: number; to: number }[]>((acc, s) => {
  const from = acc.length ? acc[acc.length - 1].to : -97
  acc.push({ from, to: from + s.value * 3.6 })
  return acc
}, [])

export function Touchpoints() {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <section className="flex items-stretch justify-between gap-3 rounded-[14px] border border-line bg-surface px-[15px] py-[15px] sm:h-[176px]">
      <div className="flex min-w-0 flex-col justify-between">
        <h2 className="text-[15px] tracking-[-0.005em]">Customer Touchpoints</h2>
        <ul className="mt-4 space-y-[9px] pb-[18px]">
          {SLICES.map((s, i) => (
            <li
              key={s.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="flex items-center gap-[8px] text-[12px] whitespace-nowrap text-ink-2"
            >
              <span className="size-[6px] rounded-full" style={{ background: s.dot }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <svg viewBox="0 0 140 140" className="size-[134px] shrink-0 self-center" role="img" aria-label="Touchpoint share">
        {SLICES.map((s, i) => {
          const { from, to } = SLICE_ARCS[i]
          const mid = ((from + to) / 2) * (Math.PI / 180)
          const lift = hover === i ? 3 : 0
          return (
            <g
              key={s.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transform: `translate(${Math.cos(mid) * lift}px, ${Math.sin(mid) * lift}px)` }}
              className="transition-transform duration-150 ease-out"
            >
              <path d={slice(from, to)} fill={s.fill} stroke="#fff" strokeWidth="1.2" />
              <text
                x={70 + Math.cos(mid) * 42}
                y={70 + Math.sin(mid) * 42 + 4}
                textAnchor="middle"
                fontSize="11.5"
                fontFamily="Inter, sans-serif"
                fill={s.text}
              >
                {s.value}%
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}

function slice(from: number, to: number) {
  const r = 66
  const a = (from * Math.PI) / 180
  const b = (to * Math.PI) / 180
  const large = to - from > 180 ? 1 : 0
  return `M70 70 L${70 + r * Math.cos(a)} ${70 + r * Math.sin(a)} A${r} ${r} 0 ${large} 1 ${70 + r * Math.cos(b)} ${70 + r * Math.sin(b)} Z`
}
