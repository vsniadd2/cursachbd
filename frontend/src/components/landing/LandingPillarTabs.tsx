import { useTranslation } from 'react-i18next'
import { PILLAR_TABS, useLandingTab, type PillarTab } from './LandingTabContext'
export function LandingPillarTabs({ className = '', active }: { className?: string; active?: PillarTab }) {
  const { t } = useTranslation('landing')
  const { setTab } = useLandingTab()
  return (
    <nav className={`lp-pillar-nav ${className}`} aria-label={t('keitaro.tabsAria')}>
      {PILLAR_TABS.map((key) => (
        <a
          key={key}
          href={key === 'track' ? '#features' : `#pillar-${key}`}
          aria-current={active === key ? 'location' : undefined}
          onClick={() => setTab(key)}
        >
          {t(`keitaro.tabs.${key}`)}
        </a>
      ))}
    </nav>
  )
}
