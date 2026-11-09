import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LandingPillarTabs } from '@/components/landing/LandingPillarTabs'
import type { PillarTab } from '@/components/landing/LandingTabContext'
import { cn } from '@/lib/utils'

const FEATURE_IDS = ['f1', 'f2', 'f3', 'f4'] as const

type LandingPillarSectionProps = {
  pillar: PillarTab
  sectionId?: string
  className?: string
}

export function LandingPillarSection({ pillar, sectionId, className }: LandingPillarSectionProps) {
  const { t } = useTranslation('landing')
  const base = `keitaro.pillars.${pillar}`
  const defaultId = sectionId ?? (pillar === 'track' ? 'features' : `pillar-${pillar}`)

  return (
    <section
      id={sectionId ?? defaultId}
      className={cn(
        'landing-section',
        pillar === 'analyze' || pillar === 'scale' ? 'landing-bg-shell' : 'landing-bg-surface',
        className,
      )}
    >
      <div className="landing-container flex flex-col items-center gap-8">
        <div className="max-w-[760px] text-center">
          <h2 className="landing-h2 text-ink">{t(`${base}.title`)}</h2>
          <p className="landing-body-sm mt-4 text-ink-2">{t(`${base}.intro`)}</p>
        </div>
        <div className="grid w-full gap-6 sm:grid-cols-2">
          {FEATURE_IDS.map((f) => (
            <article key={f} className="landing-feature-card text-left">
              <h3 className="text-[16px] font-medium text-ink">{t(`${base}.${f}t`)}</h3>
              <p className="landing-body-sm mt-2 text-ink-2">{t(`${base}.${f}d`)}</p>
            </article>
          ))}
        </div>
        <Link to="/login" className="text-[15px] font-medium text-brand hover:text-brand-2">
          {t('keitaro.explore')}
        </Link>
        <LandingPillarTabs />
      </div>
    </section>
  )
}
