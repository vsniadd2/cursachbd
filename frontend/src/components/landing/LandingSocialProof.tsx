import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LandingProofCarousel } from '@/components/landing/LandingProofCarousel'

export function LandingSocialProof() {
  const { t } = useTranslation('landing')

  return (
    <section className="landing-section landing-proof-section relative overflow-hidden">
      <div className="landing-proof-glow" aria-hidden>
        <span className="landing-proof-blob landing-proof-blob-1" />
        <span className="landing-proof-blob landing-proof-blob-2" />
        <span className="landing-proof-blob landing-proof-blob-3" />
        <span className="landing-proof-orb landing-proof-orb-1" />
        <span className="landing-proof-orb landing-proof-orb-2" />
        <span className="landing-proof-orb landing-proof-orb-3" />
      </div>
      <div className="landing-container relative z-[1] flex flex-col items-center text-center">
        <p className="text-[clamp(3rem,8vw,5rem)] font-bold leading-none tracking-[-0.04em] text-brand">
          {t('keitaro.proof.stat')}
        </p>
        <p className="landing-caption mt-3 text-ink-3">{t('keitaro.proof.statCaption')}</p>
        <h2 className="landing-h2 mt-2 max-w-[640px] text-ink">{t('keitaro.proof.statLabel')}</h2>
        <Link to="/login" className="landing-btn-secondary mt-8">
          {t('keitaro.proof.demo')}
        </Link>
        <LandingProofCarousel />
      </div>
    </section>
  )
}
