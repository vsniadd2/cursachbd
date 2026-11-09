export function BrandLogo({ subtitle = 'Growth Plan' }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-[8px]">
      <LogoMark />
      <div className="min-w-0">
        <p className="text-[19px] leading-[1.05] font-medium tracking-[-0.01em] text-ink">Flexora</p>
        <p className="text-[9.5px] text-ink-2">{subtitle}</p>
      </div>
    </div>
  )
}

function LogoMark() {
  const rays = Array.from({ length: 11 }, (_, i) => -180 + (i * 180) / 10)
  return (
    <span className="grid size-[30px] shrink-0 place-items-center overflow-hidden rounded-[7px] bg-brand">
      <svg viewBox="0 0 30 30" className="size-[30px]">
        {rays.map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={15 + Math.cos(r) * 4}
              y1={17 + Math.sin(r) * 4}
              x2={15 + Math.cos(r) * 12}
              y2={17 + Math.sin(r) * 12}
              stroke="white"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          )
        })}
        {[20, 45, 70, 110, 135, 160].map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={15 + Math.cos(r) * 4}
              y1={17 + Math.sin(r) * 4}
              x2={15 + Math.cos(r) * 9}
              y2={17 + Math.sin(r) * 9}
              stroke="white"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    </span>
  )
}
