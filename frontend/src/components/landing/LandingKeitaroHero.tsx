import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LandingHeroOrbit } from '@/components/landing/LandingHeroOrbit'
import { LandingReveal } from './LandingReveal'

export function LandingKeitaroHero() {
  const { t } = useTranslation('landing')

  return (
    <section className="landing-grid-bg relative overflow-x-clip overflow-y-visible">
      <div className="landing-grid-fade pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40" />
      <div className="lp-hero-stage relative">
        <LandingHeroOrbit />
        <LandingReveal>
          <div className="lp-hero-copy landing-container relative z-10 mx-auto flex flex-col items-center px-5 text-center">
            <h1 className="landing-h1 text-balance text-ink">{t('keitaro.hero.title')}</h1>
            <p className="landing-body-sm mt-5 max-w-[520px] text-ink-2">{t('keitaro.hero.body')}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="landing-btn-primary">
                {t('keitaro.hero.ctaPrimary')}
              </Link>
              <Link to="/login" className="landing-btn-secondary">
                {t('keitaro.hero.ctaDemo')}
              </Link>
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}
