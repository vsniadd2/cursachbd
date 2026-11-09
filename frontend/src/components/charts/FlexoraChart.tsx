import type { ReactNode } from 'react'

/** Обёртка для будущих графиков Recharts в палитре Flexora. */
export function FlexoraChart({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="rounded-[14px] border border-line bg-surface px-[18px] py-[18px]">
      {title && <h2 className="mb-4 text-[15px] tracking-[-0.005em] text-ink">{title}</h2>}
      <div className="text-ink-2 [&_.recharts-cartesian-grid_line]:stroke-line [&_.recharts-text]:fill-ink-2">
        {children}
      </div>
    </section>
  )
}

export const CHART_COLORS = {
  brand: '#ff6b2c',
  brand2: '#ff9a6b',
  ink: '#17171a',
  ink2: '#4b4b52',
  pos: '#22b45e',
} as const
