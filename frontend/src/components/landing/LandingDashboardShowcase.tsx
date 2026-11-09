import { useTranslation } from 'react-i18next'
import { LandingDashboardMock } from '@/components/landing/LandingDashboardMock'
import { LandingPillarTabs } from '@/components/landing/LandingPillarTabs'

export function LandingDashboardShowcase() {
  const { t } = useTranslation('landing')

  return (
    <section id="product" className="landing-section landing-bg-surface pt-4">
      <div className="landing-container flex flex-col items-center text-center">
        <h2 className="landing-h2 max-w-[720px] text-ink">{t('keitaro.dashboard.title')}</h2>
        <p className="landing-body-sm mt-4 max-w-[640px] text-ink-2">{t('keitaro.dashboard.line1')}</p>
        <p className="landing-body-sm mt-2 max-w-[640px] text-ink-2">{t('keitaro.dashboard.line2')}</p>
        <div className="mt-8 w-full">
          <LandingDashboardMock />
        </div>
        <LandingPillarTabs className="mt-4 w-full max-w-[520px]" scrollOnSelect={false} />
      </div>
    </section>
  )
}
