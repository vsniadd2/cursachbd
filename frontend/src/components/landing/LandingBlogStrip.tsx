import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ARTICLES = ['a1', 'a2', 'a3'] as const

export function LandingBlogStrip() {
  const { t } = useTranslation('landing')

  return (
    <section className="landing-section landing-bg-shell">
      <div className="landing-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="landing-h2 text-ink">{t('keitaro.blog.title')}</h2>
          <Link to="/login" className="landing-label text-brand hover:text-brand-2">
            {t('keitaro.blog.visit')}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ARTICLES.map((id) => (
            <article key={id} className="landing-feature-card flex flex-col text-left">
              <div className="mb-4 h-28 rounded-[12px] border border-line bg-brand-soft" />
              <h3 className="text-[16px] font-medium text-ink">{t(`keitaro.blog.${id}t`)}</h3>
              <p className="landing-body-sm mt-2 text-ink-2">{t(`keitaro.blog.${id}d`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}