import { useTranslation } from 'react-i18next'
import { PILLAR_TABS, useLandingTab } from '@/components/landing/LandingTabContext'
import { cn } from '@/lib/utils'

export function LandingPillarTabs({
  className,
  scrollOnSelect = true,
}: {
  className?: string
  scrollOnSelect?: boolean
}) {
  const { t } = useTranslation('landing')
  const { tab, setTab } = useLandingTab()

  return (
    <div className={cn('flex flex-wrap justify-center gap-4 border-b border-line', className)} role="tablist" aria-label={t('keitaro.tabsAria')}>
      {PILLAR_TABS.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={tab === key}
          onClick={() => {
            setTab(key)
            if (!scrollOnSelect) return
            const anchor = key === 'track' ? 'features' : `pillar-${key}`
            document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={cn(
            'landing-label -mb-px border-b-2 px-2 pb-3 pt-1 transition-colors',
            tab === key ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink',
          )}
        >
          {t(`keitaro.tabs.${key}`)}
        </button>
      ))}
    </div>
  )
}
