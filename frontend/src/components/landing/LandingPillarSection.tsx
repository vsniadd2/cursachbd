import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, CircleCheck, Layers, Gauge, Workflow, FolderKanban } from 'lucide-react'
import { LandingPillarTabs } from './LandingPillarTabs'
import { LandingProductScene } from './LandingProductScene'
import { LandingReveal } from './LandingReveal'
import type { PillarTab } from './LandingTabContext'
const features = ['f1', 'f2', 'f3', 'f4'] as const
const icons = [Layers, FolderKanban, Workflow, Gauge]
export function LandingPillarSection({ pillar, sectionId }: { pillar: PillarTab; sectionId?: string }) {
  const { t } = useTranslation('landing')
  const [slide, setSlide] = useState(0)
  const [maxSlide, setMaxSlide] = useState(1)
  const rail = useRef<HTMLDivElement>(null)
  const base = `keitaro.pillars.${pillar}`
  useEffect(() => {
    const element = rail.current
    if (!element) return
    const measure = () => {
      const step = (element.firstElementChild?.clientWidth ?? 320) + 20
      setMaxSlide(Math.max(1, Math.ceil((element.scrollWidth - element.clientWidth) / step)))
      setSlide(Math.round(element.scrollLeft / step))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    element.addEventListener('scroll', measure, { passive: true })
    measure()
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', measure)
    }
  }, [])
  function move(direction: number) {
    if (!rail.current) return
    const next = Math.max(0, Math.min(maxSlide, slide + direction))
    setSlide(next)
    rail.current.scrollTo({
      left: next * ((rail.current.firstElementChild?.clientWidth ?? 320) + 20),
      behavior: 'smooth',
    })
  }
  return (
    <section id={sectionId ?? `pillar-${pillar}`} className={`landing-section lp-pillar lp-${pillar}`}>
      <div className="landing-container">
        <LandingReveal>
          <div className="lp-section-heading">
            <LandingPillarTabs active={pillar} />
            <h2 className="landing-h2">{t(`${base}.title`)}</h2>
            <p className="landing-body-sm">{t(`${base}.intro`)}</p>
          </div>
        </LandingReveal>
        {pillar === 'analyze' && (
          <LandingReveal>
            <div className="lp-report">
              <div className="lp-report-head">
                <strong>{t(`${base}.f2t`)}</strong>
                <span>Flexora · 2026</span>
              </div>
              <div className="lp-report-filters">
                {['Project', 'Client', 'Status', 'Priority'].map((s) => (
                  <span key={s}>{s}⌄</span>
                ))}
              </div>
              <div className="lp-report-grid lp-report-labels">
                <span>Project</span>
                <span>Client</span>
                <span>Budget</span>
                <span>Status</span>
              </div>
              {['Platform Revamp', 'Discovery Sprint', 'API Integration', 'Client Onboarding'].map(
                (name, i) => (
                  <div className="lp-report-grid" key={name}>
                    <span>{name}</span>
                    <span>{i % 2 ? 'Northwind Labs' : 'Stellar Systems'}</span>
                    <strong>${[42860, 12000, 8400, 6200][i].toLocaleString('en-US')}</strong>
                    <span>
                      <CircleCheck size={14} /> {i % 2 ? 'Planning' : 'Active'}
                    </span>
                  </div>
                ),
              )}
            </div>
          </LandingReveal>
        )}
        <div className={`lp-feature-layout lp-feature-${pillar}`} ref={pillar === 'track' ? rail : undefined}>
          {features.map((f, i) => {
            const Icon = icons[i]
            return (
              <LandingReveal key={f} delay={i * 0.07}>
                <article className="lp-feature">
                  {pillar === 'track' ? (
                    <LandingProductScene variant={i} />
                  ) : (
                    <span className="lp-feature-icon">{pillar === 'scale' ? <CircleCheck /> : <Icon />}</span>
                  )}
                  <div className="lp-feature-copy">
                    <h3>{t(`${base}.${f}t`)}</h3>
                    <p>{t(`${base}.${f}d`)}</p>
                  </div>
                </article>
              </LandingReveal>
            )
          })}
        </div>
        {pillar === 'track' && (
          <div className="lp-carousel-controls">
            <button
              type="button"
              aria-label={t('keitaro.carouselPrev')}
              onClick={() => move(-1)}
              disabled={slide === 0}
            >
              <ChevronLeft />
            </button>
            <span>
              {slide + 1} / {maxSlide + 1}
            </span>
            <button
              type="button"
              aria-label={t('keitaro.carouselNext')}
              onClick={() => move(1)}
              disabled={slide >= maxSlide}
            >
              <ChevronRight />
            </button>
          </div>
        )}
        <div className="lp-section-cta">
          <Link to="/login" className="landing-btn-primary">
            {t('keitaro.explore')}
          </Link>
        </div>
      </div>
    </section>
  )
}
