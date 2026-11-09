import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Crosshair,
  Maximize2,
  Minus,
  Move,
  Plus,
  Search,
  Settings2,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  onFindMe?: () => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  showRoster: boolean
  onShowRosterChange: (v: boolean) => void
}

export function TeamOrgPanCanvas({
  children,
  className,
  onFindMe,
  searchQuery,
  onSearchQueryChange,
  showRoster,
  onShowRosterChange,
}: Props) {
  const { t } = useTranslation('pages')
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-org-interactive]')) return
      setPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
      viewportRef.current?.setPointerCapture(e.pointerId)
    },
    [pan.x, pan.y],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!panning) return
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
    },
    [panning],
  )

  const endPan = useCallback((e: React.PointerEvent) => {
    setPanning(false)
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  function fitToScreen() {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setScale((s) => Math.min(1.5, Math.max(0.5, s - e.deltaY * 0.002)))
        return
      }
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className={cn('team-org-board relative overflow-hidden rounded-[14px] border border-line bg-surface', className)}>
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="size-9 rounded-[10px] bg-surface p-0 shadow-sm"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label={t('team.org.search')}
        >
          <Search className="size-4" />
        </Button>
        {searchOpen && (
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder={t('team.searchPlaceholder')}
            className="h-9 w-[200px] rounded-[10px] border-line bg-surface text-[12px] shadow-sm"
            autoFocus
          />
        )}
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5 rounded-[10px] bg-surface px-3 text-[12px] shadow-sm"
          onClick={onFindMe}
        >
          <Crosshair className="size-3.5" />
          {t('team.org.findMe')}
        </Button>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-1.5 rounded-[10px] bg-surface px-3 text-[12px] shadow-sm"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            <Settings2 className="size-3.5" />
            {t('team.org.viewSettings')}
          </Button>
          {settingsOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-[220px] rounded-[10px] border border-line bg-surface p-3 shadow-lg">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={showRoster}
                  onChange={(e) => onShowRosterChange(e.target.checked)}
                  className="accent-brand"
                />
                {t('team.org.showRoster')}
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <Button type="button" variant="outline" className="size-9 rounded-[10px] bg-surface p-0 shadow-sm" aria-hidden tabIndex={-1}>
          <X className="size-4 opacity-40" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn('size-9 rounded-[10px] bg-surface p-0 shadow-sm', panning && 'border-brand')}
          title={t('team.org.pan')}
        >
          <Move className="size-4" />
        </Button>
        <Button type="button" variant="outline" className="size-9 rounded-[10px] bg-surface p-0 shadow-sm" onClick={fitToScreen} aria-label={t('team.org.fit')}>
          <Maximize2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="size-9 rounded-[10px] bg-surface p-0 shadow-sm"
          onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="size-9 rounded-[10px] bg-surface p-0 shadow-sm"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </Button>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          'team-org-viewport h-[min(72vh,620px)] w-full touch-none select-none',
          panning ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          className="team-org-canvas inline-block min-w-full px-16 py-20 transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center top',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
