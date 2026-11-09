import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const FEATURE_IDS = ['f1', 'f2', 'f3', 'f4'] as const

export function LandingTeamSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="landing-section landing-bg-surface">
      <div className="landing-container flex flex-col items-center gap-8">
        <div className="max-w-[640px] text-center">
          <h2 className="landing-h2 text-ink">{t('keitaro.teams.title')}</h2>
          <p className="landing-body-sm mt-3 text-ink-2">{t('keitaro.teams.intro')}</p>
        </div>
        <div className="grid w-full gap-6 sm:grid-cols-2">
          {FEATURE_IDS.map((f) => (
            <article key={f} className="landing-feature-card text-left">
              <h3 className="text-[16px] font-medium text-ink">{t(`keitaro.teams.${f}t`)}</h3>
              <p className="landing-body-sm mt-2 text-ink-2">{t(`keitaro.teams.${f}d`)}</p>
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
