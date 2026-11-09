import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const TESTIMONIAL_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'] as const

type TestimonialId = (typeof TESTIMONIAL_IDS)[number]

function ProofCard({ id }: { id: TestimonialId }) {
  const { t } = useTranslation('landing')
  const base = `keitaro.proof.${id}` as const
  const industry = t(`${base}industry`, { defaultValue: '' })

  return (
    <blockquote
      className={cn(
        'landing-proof-quote landing-proof-carousel-card',
        'flex w-[min(85vw,22rem)] shrink-0 flex-col rounded-[16px] border border-line p-5 text-left',
      )}
    >
      {industry.length > 0 && (
        <p className="mb-3 inline-flex w-fit items-center rounded-full border border-brand/15 bg-brand-soft/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-brand">
          {industry}
        </p>
      )}
      <p className="landing-body-sm flex-1 text-ink">&ldquo;{t(`${base}quote`)}&rdquo;</p>
      <footer className="mt-4 border-t border-line/80 pt-3">
        <p className="text-[13px] font-medium text-ink">{t(`${base}name`)}</p>
        <p className="mt-0.5 text-[12px] text-ink-3">{t(`${base}role`)}</p>
      </footer>
    </blockquote>
  )
}

export function LandingProofCarousel() {
  const { t } = useTranslation('landing')
  const loop = [...TESTIMONIAL_IDS, ...TESTIMONIAL_IDS]

  return (
    <div className="landing-proof-carousel mt-12 w-full border-t border-line pt-12">
      <p className="sr-only">{t('keitaro.proof.carouselAria')}</p>
      <div className="landing-proof-carousel-viewport">
        <div className="landing-proof-carousel-track">
          {loop.map((id, i) => (
            <ProofCard key={`${id}-${i}`} id={id} />
          ))}
        </div>
      </div>
    </div>
  )
}
