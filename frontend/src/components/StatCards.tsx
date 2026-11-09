import React from 'react'
import { MoreHorizontal, ArrowUp } from 'lucide-react'

export function StatCards() {
  return (
    <div className="mt-[19px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((c, i) => (
        <article key={i} className="flex h-[140px] flex-col rounded-[12px] border border-line bg-surface px-[12px] pt-[12px] pb-[12px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[12.5px] text-ink-2">{c.title}</h3>
            <button aria-label="More" className="text-ink-2">
              <MoreHorizontal className="size-[15px]" strokeWidth={1.8} />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
            <p className="text-[27px] leading-none tracking-[-0.01em] tabular">{c.value}</p>
            <div className="shrink-0">{c.chart}</div>
          </div>
          <div className="flex items-center gap-[7px]">
            <span
              className={`inline-flex items-center gap-[2px] rounded-[4px] px-[6px] py-[3px] text-[9.5px] tabular ${
                c.tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-pos-soft text-pos'
              }`}
            >
              <ArrowUp className="size-[9px]" strokeWidth={2.2} />
              {c.delta}
            </span>
            <span className="truncate text-[12.5px] text-ink-2">{c.caption}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

function Bars() {
  const h = [12, 20, 26, 34, 40]
  return (
    <svg width="54" height="44" viewBox="0 0 54 44" className="-mr-1">
      <defs>
        <linearGradient id="bar-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff6b2c" />
          <stop offset="1" stopColor="#ff6b2c" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <line x1="0" x2="54" y1="43.5" y2="43.5" stroke="#efeff1" />
      {h.map((v, i) => (
        <rect key={i} x={4 + i * 10} y={43 - v} width="6" height={v} fill="url(#bar-fade)" />
      ))}
    </svg>
  )
}

function Spark() {
  const d = 'M2 40 C 12 40, 16 30, 26 31 S 36 26, 42 20 S 52 24, 58 24 S 70 14, 74 6'
  return (
    <svg width="78" height="46" viewBox="0 0 78 46">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff6b2c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ff6b2c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L74 46 L2 46 Z`} fill="url(#spark-fill)" />
      <path d={d} fill="none" stroke="#ff7a40" strokeWidth="1.1" />
      <path d="M70 6 L74.5 5.5 L74 10" fill="none" stroke="#ff7a40" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function Ring() {
  const r = 17
  const c = 2 * Math.PI * r
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="mr-1">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#ffd9c7" strokeWidth="5" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="#ff6b2c"
        strokeWidth="5"
        strokeDasharray={`${c * 0.74} ${c}`}
        transform="rotate(-80 22 22)"
      />
    </svg>
  )
}

function Wave() {
  const h = [10, 16, 22, 14, 26, 30, 18, 34, 22, 28, 16, 24, 30, 20, 12, 26, 18, 10, 0, 6, 14, 22]
  return (
    <svg width="88" height="40" viewBox="0 0 88 40" className="-mr-[12px]">
      {h.map((v, i) =>
        v ? (
          <rect
            key={i}
            x={i * 4}
            y={20 - v / 2}
            width="1.4"
            height={v}
            rx="0.7"
            fill={i % 3 === 0 || i > 16 ? '#ffb796' : '#ff6b2c'}
          />
        ) : null,
      )}
    </svg>
  )
}

const CARDS: { title: string; value: string; delta: string; caption: string; tone?: 'brand'; chart: React.ReactNode }[] = [
  { title: 'Active Pipeline Value', value: '$42,860', delta: '14%', caption: 'currently in progress', chart: <Bars /> },
  { title: 'Active Pipeline Value', value: '1,284', delta: '9%', caption: 'campaigns & integrations', chart: <Spark /> },
  { title: 'Deals Closed', value: '236', delta: '12%', caption: 'leads to prstomers', chart: <Ring /> },
  { title: 'Active Pipeline Value', value: '$42,860', delta: '140%', caption: 'currently in progress', tone: 'brand', chart: <Wave /> },
]
