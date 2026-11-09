import React, { useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

export function RevenueChart() {
  const [hover, setHover] = useState(4) // May

  return (
    <section className="flex flex-col rounded-[14px] border border-line bg-surface px-[18px] pt-[18px] pb-[16px]">
      <h2 className="text-[15px] tracking-[-0.005em]">Revenue & Conversion Analytics</h2>

      <div className="mt-[18px] flex gap-[8px]">
        {/* Y axis */}
        <div className="flex w-[22px] shrink-0 flex-col pt-[24px]">
          <div className="relative h-[246px]">
            {['5K', '4K', '3K', '2K', '1K', '0K'].map((l, i) => (
              <span
                key={l}
                className="absolute right-0 -translate-y-1/2 text-[12px] text-ink-2 tabular"
                style={{ top: 6 + i * 45.4 }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Plot */}
          <div className="rounded-[8px] border border-[#efeff1]">
            <div className="flex h-[24px] items-center justify-between border-b border-[#efeff1] px-[8px]">
              <div className="flex items-center gap-[7px]">
                <span className="text-[18px] leading-none font-medium tabular">$16.490</span>
                <span className="inline-flex items-center gap-[1px] rounded-[3px] bg-pos-soft px-[4px] py-[2px] text-[6.5px] text-pos">
                  <ArrowUp className="size-[6px]" strokeWidth={2.5} />14%
                </span>
                <span className="text-[9.5px] text-ink-2">May</span>
              </div>
              <div className="flex items-center gap-[7px]">
                <span className="text-[18px] leading-none font-medium tabular">$11.595</span>
                <span className="inline-flex items-center gap-[1px] rounded-[3px] bg-brand-soft px-[4px] py-[2px] text-[6.5px] text-brand">
                  <ArrowDown className="size-[6px]" strokeWidth={2.5} />14%
                </span>
                <span className="text-[9.5px] text-ink-2">Jun</span>
              </div>
            </div>

            <div className="relative h-[246px]" onMouseLeave={() => setHover(4)}>
              <svg viewBox="0 0 903 387" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <defs>
                  <pattern id="area-hatch" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="24" height="24" fill="#fff3ec" />
                    <rect width="11" height="24" fill="#ffc1a5" />
                  </pattern>
                </defs>
                <path d={AREA} fill="none" stroke="#f3f3f4" strokeWidth="16" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d={AREA} fill="url(#area-hatch)" />
              </svg>

              {/* Hover columns */}
              <div className="absolute inset-0 flex">
                {MONTHS.map((m, i) => (
                  <div
                    key={m}
                    onMouseEnter={() => setHover(i)}
                    className="h-full"
                    style={{ width: `${(i === 0 ? (X[0] + X[1]) / 2 : i === 7 ? 903 - (X[6] + X[7]) / 2 : (X[i + 1] - X[i - 1]) / 2) / 9.03}%` }}
                  />
                ))}
              </div>

              {/* Highlighted month */}
              <div
                className="pointer-events-none absolute top-[8.8%] bottom-[5.2%] w-[6.9%] -translate-x-1/2 rounded-full border-[3px] border-brand transition-[left] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                  left: `${(X[hover] / 903) * 100}%`,
                  background: 'repeating-linear-gradient(135deg, #ffb08c 0 7px, #ffd0bb 7px 13px)',
                }}
              >
                <span className="absolute top-[22%] left-[calc(100%+6px)] rounded-[7px] bg-ink px-[7px] py-[6px] text-[10.5px] leading-none whitespace-nowrap text-white tabular">
                  {CHANGE[hover]}
                </span>
              </div>
            </div>
          </div>

          {/* X axis */}
          <div className="relative mt-[8px] h-[16px]">
            {MONTHS.map((m, i) => (
              <span
                key={m}
                className={`absolute -translate-x-1/2 text-[12px] transition-colors duration-150 ${i === hover ? 'text-ink' : 'text-ink-2'}`}
                style={{ left: `${(X[i] / 903) * 100}%` }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const X = [16, 140, 265, 389, 502, 641, 764, 886]
const CHANGE = ['+4%', '+6%', '+3%', '+9%', '+12%', '−3%', '+5%', '+7%']

const UPPER = [[0, 187], [88, 194], [258, 142], [433, 117], [478, 112], [538, 67], [598, 72], [633, 82], [718, 97], [758, 87], [808, 112], [903, 107]]
const LOWER = [[0, 327], [88, 282], [178, 312], [268, 327], [348, 282], [428, 272], [468, 312], [538, 282], [638, 222], [738, 182], [808, 202], [903, 227]]

const AREA =
  'M' +
  [...UPPER, ...[...LOWER].reverse()].map(([x, y]) => `${x} ${y}`).join(' L') +
  ' Z'
