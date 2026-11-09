import React from 'react'

export function ScoreGauge({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, score))
  const split = START + (SWEEP * s) / 100

  return (
    <section className="flex flex-col rounded-[14px] border border-line bg-surface px-[18px] pt-[18px] pb-[20px]">
      <h2 className="text-[15px] tracking-[-0.005em]">Sales Performance Score</h2>

      <svg viewBox="0 0 310 200" className="mx-auto mt-[38px] w-full max-w-[318px]" role="img" aria-label={`Score ${s} of 100`}>
        <defs>
          <pattern id="gauge-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill="#fff4ee" />
            <rect width="6" height="14" fill="#ffbb9b" />
          </pattern>
        </defs>
        {s < 100 && (
          <path d={arc(split, END)} fill="none" stroke="url(#gauge-hatch)" strokeWidth={STROKE} strokeLinecap="round" />
        )}
        {s > 0 && <path d={arc(START, split)} fill="none" stroke="#ff6b2c" strokeWidth={STROKE} strokeLinecap="round" />}
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontSize="82"
          fontWeight="500"
          letterSpacing="-3"
          fill="#4a4a55"
          fontFamily="Inter, sans-serif"
        >
          {s}
        </text>
        <text x={CX} y={CY + 50} textAnchor="middle" fontSize="12.5" fill="#4b4b52" fontFamily="Inter, sans-serif">
          For sales 100 Point
        </text>
      </svg>

      <p className="mt-auto pt-6 text-[12.5px] leading-[1.5] text-ink-2">
        A scalable sales pipeline delivering consistent growth, predictable revenue, and business confidence.
      </p>
    </section>
  )
}

const CX = 155
const CY = 140
const R = 118
const STROKE = 38
const START = 168
const END = 372
const SWEEP = END - START

function pt(deg: number) {
  const r = (deg * Math.PI) / 180
  return [CX + R * Math.cos(r), CY + R * Math.sin(r)]
}

function arc(from: number, to: number) {
  const [x1, y1] = pt(from)
  const [x2, y2] = pt(to)
  const large = to - from > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
}
