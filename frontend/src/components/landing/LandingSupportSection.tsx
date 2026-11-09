import { useTranslation } from 'react-i18next'

const CARDS = ['f1', 'f2', 'f3'] as const

export function LandingSupportSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="landing-section landing-bg-shell">
      <div className="landing-container flex flex-col items-center gap-8">
        <h2 className="landing-h2 max-w-[720px] text-center text-ink">{t('keitaro.support.title')}</h2>
        <div className="grid w-full gap-6 md:grid-cols-3">
          {CARDS.map((f) => (
            <article key={f} className="landing-feature-card text-left">
              <h3 className="text-[16px] font-medium text-ink">{t(`keitaro.support.${f}t`)}</h3>
              <p className="landing-body-sm mt-2 text-ink-2">{t(`keitaro.support.${f}d`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
