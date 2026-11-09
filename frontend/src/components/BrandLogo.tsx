import { cn } from '@/lib/utils'

export function BrandLogo({
  subtitle = 'Growth Plan',
  centered = false,
  size = 'sm',
}: {
  subtitle?: string
  centered?: boolean
  /** `lg` — крупный логотип в шапке лендинга у верхнего края */
  size?: 'sm' | 'lg'
}) {
  const markSize = centered ? 'lg' : size

  return (
    <div
      className={cn(
        'flex items-center transition-[gap] duration-300 ease-out',
        centered && 'flex-col gap-3',
        !centered && (markSize === 'lg' ? 'gap-[10px]' : 'gap-[8px]'),
      )}
    >
      <LogoMark size={markSize} />
      <div className={cn('min-w-0', centered && 'text-center')}>
        <p
          className={cn(
            'font-medium tracking-[-0.01em] text-ink transition-[font-size] duration-300 ease-out',
            centered && 'text-[22px] leading-tight',
            !centered && markSize === 'lg' && 'text-[26px] leading-[1.05]',
            !centered && markSize === 'sm' && 'text-[19px] leading-[1.05]',
          )}
        >
          Flexora
        </p>
        <p
          className={cn(
            'text-ink-2 transition-[font-size] duration-300 ease-out',
            centered && 'mt-1 text-[12px]',
            !centered && markSize === 'lg' && 'text-[11px]',
            !centered && markSize === 'sm' && 'text-[9.5px]',
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function LogoMark({ size }: { size: 'sm' | 'lg' }) {
  const rays = Array.from({ length: 11 }, (_, i) => -180 + (i * 180) / 10)
  const box = size === 'lg' ? 'size-[48px] rounded-[11px]' : 'size-[30px] rounded-[7px]'
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden bg-brand transition-[width,height,border-radius] duration-300 ease-out',
        box,
      )}
    >
      <svg viewBox="0 0 30 30" className={cn('transition-[width,height] duration-300 ease-out', size === 'lg' ? 'size-[48px]' : 'size-[30px]')}>
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
