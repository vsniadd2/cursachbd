import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGS = ['ru', 'en'] as const

type LocaleLangToggleProps = {
  className?: string
  /** compact — как иконка в AppTopBar (37px) */
  size?: 'default' | 'compact'
}

export function LocaleLangToggle({ className, size = 'default' }: LocaleLangToggleProps) {
  const { t, i18n } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const base = (i18n.resolvedLanguage ?? i18n.language ?? 'ru').split('-')[0]
  const lang = base === 'en' ? 'en' : 'ru'

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const triggerClass =
    size === 'compact'
      ? 'grid size-[37px] shrink-0 place-items-center rounded-[9px] border border-line bg-surface text-ink transition-colors duration-150 hover:bg-shell'
      : 'grid size-[40px] place-items-center rounded-full border border-line bg-surface/80 text-ink shadow-[0_2px_12px_rgba(23,23,26,0.04)] transition-colors hover:bg-shell'

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('langMenuButton')}
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
      >
        <Languages className="size-[17px]" strokeWidth={1.6} aria-hidden />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('langToggleAria')}
          className="absolute top-[calc(100%+6px)] right-0 z-50 min-w-[120px] overflow-hidden rounded-[10px] border border-line bg-surface py-1 shadow-[0_12px_40px_rgba(23,23,26,0.12)]"
        >
          {LANGS.map((code) => {
            const selected = lang === code
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium uppercase tracking-wide transition-colors',
                    selected ? 'bg-shell text-ink' : 'text-ink-2 hover:bg-shell/80 hover:text-ink',
                  )}
                  onClick={() => {
                    void i18n.changeLanguage(code)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-[22px]">{code}</span>
                  {selected && <Check className="ml-auto size-[14px] text-brand" strokeWidth={2} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
