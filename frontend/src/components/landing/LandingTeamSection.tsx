import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LandingProductScene } from './LandingProductScene'

const FEATURE_IDS = ['f1', 'f2', 'f3', 'f4'] as const

export function LandingTeamSection() {
  const { t } = useTranslation('landing')

  return (
    <section id="teams" className="landing-section lp-team-section">
      <div className="landing-container flex flex-col items-center gap-8">
        <div className="max-w-[640px] text-center">
          <h2 className="landing-h2 text-ink">{t('keitaro.teams.title')}</h2>
          <p className="landing-body-sm mt-3 text-ink-2">{t('keitaro.teams.intro')}</p>
        </div>
        <div className="lp-team-grid">
          {FEATURE_IDS.map((f, i) => (
            <article key={f} className="lp-feature">
              <LandingProductScene variant={i} />
              <div className="lp-feature-copy">
                <h3 className="text-[16px] font-medium text-ink">{t(`keitaro.teams.${f}t`)}</h3>
                <p className="landing-body-sm mt-2 text-ink-2">{t(`keitaro.teams.${f}d`)}</p>
              </div>
            </article>
          ))}
        </div>
        <Link to="/register" className="landing-btn-primary">
          {t('keitaro.teams.cta')}
        </Link>
      </div>
    </section>
  )
}
