import { useTranslation } from 'react-i18next'
import { LandingDashboardMock } from '@/components/landing/LandingDashboardMock'
import { LandingReveal } from './LandingReveal'

export function LandingDashboardShowcase() {
  const { t } = useTranslation('landing')

  return (
    <section id="product" className="landing-section landing-bg-surface pt-4">
      <div className="landing-container flex flex-col items-center text-center">
        <LandingReveal>
          <h2 className="landing-h2 max-w-[850px] text-ink">{t('keitaro.dashboard.title')}</h2>
        </LandingReveal>
        <p className="landing-body-sm mt-4 max-w-[640px] text-ink-2">{t('keitaro.dashboard.line1')}</p>
        <div className="mt-8 w-full">
          <LandingDashboardMock />
        </div>
      </div>
    </section>
  )
}
