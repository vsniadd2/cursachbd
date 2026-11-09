import { useState, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TeamOrgChartCanvas({ children, className }: { children: ReactNode; className?: string }) {
  const [scale, setScale] = useState(1)

  return (
    <div className={cn('relative rounded-[14px] border border-line bg-surface', className)}>
      <div className="absolute right-3 top-3 z-10 flex gap-1">
        <Button
          type="button"
          variant="outline"
          className="size-8 rounded-[8px] p-0"
          onClick={() => setScale((s) => Math.max(0.75, s - 0.1))}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="size-8 rounded-[8px] p-0"
          onClick={() => setScale((s) => Math.min(1.25, s + 0.1))}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div className="team-org-canvas overflow-x-auto py-8">
        <div className="origin-top px-6 transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
