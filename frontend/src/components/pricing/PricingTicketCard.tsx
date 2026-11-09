import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { PlanId } from '@/lib/billing/plan'
import { cn } from '@/lib/utils'

const BARCODE: Record<PlanId, string> = {
  starter: 'FLX-STR-00',
  advanced: 'FLX-ADV-29',
  enterprise: 'FLX-ENT-01',
}

const PLAN_TAG: Record<PlanId, string> = {
  starter: 'Team',
  advanced: 'Growth',
  enterprise: 'Scale',
}

type PricingTicketCardProps = {
  planId: PlanId
  isCurrent: boolean
  highlighted?: boolean
}

export function PricingTicketCard({ planId, isCurrent, highlighted }: PricingTicketCardProps) {
  const { t } = useTranslation('pages')
  const prefix = `pricing.${planId}` as const
  const features = ['f1', 'f2', 'f3', 'f4', 'f5'] as const
  const bullets = features
    .map((f) => t(`${prefix}.${f}`, { defaultValue: '' }))
    .filter((line) => line.length > 0)
  const period = t(`${prefix}.period`, { defaultValue: '' })
  const detailRows = bullets.slice(0, 4)
  const featureLabel = t('pricing.ticketFeature', { defaultValue: 'Feature' })

  const ctaLabel = isCurrent
    ? t('pricing.ctaCurrent')
    : planId === 'advanced'
      ? t('pricing.ctaSoon')
      : planId === 'enterprise'
        ? t('pricing.ctaContact')
        : t('pricing.ctaCurrent')

  return (
    <div className={cn('pricing-ticket-wrapper', isCurrent && 'is-current', highlighted && 'is-highlight')}>
      <div className="pricing-ticket relative">
        {isCurrent && <span className="pricing-ticket-badge-current">{t('pricing.currentPlan')}</span>}
        <div className="pricing-ticket-main">
          <div className="pricing-ticket-content">
            <div className="pricing-ticket-header">
              <div className="pricing-ticket-logo">
                <span className="pricing-ticket-logo-mark" aria-hidden>
                  <svg viewBox="0 0 30 30" fill="none">
                    <line x1="15" y1="13" x2="15" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="11" y1="17" x2="3" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="19" y1="17" x2="27" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                Flexora
              </div>
              <span className="pricing-ticket-type">{PLAN_TAG[planId]}</span>
            </div>
            <h2 className="pricing-ticket-title">{t(`${prefix}.name`)}</h2>
            <p className="pricing-ticket-subtitle">
              {period.length > 0 ? period : t('pricing.description')}
            </p>
            <div className="pricing-ticket-details">
              {detailRows.map((line, i) => (
                <div key={line} className="pricing-ticket-detail">
                  <span className="pricing-ticket-label">
                    {featureLabel} {i + 1}
                  </span>
                  <span className="pricing-ticket-value">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pricing-ticket-perf" aria-hidden>
            <div className="pricing-ticket-perf-line" />
          </div>
        </div>
        <div className="pricing-ticket-stub">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <div className="pricing-ticket-barcode-wrap">
                <div className="pricing-ticket-barcode" aria-hidden />
                <span className="pricing-ticket-barcode-id">{BARCODE[planId]}</span>
              </div>
              <div className="pricing-ticket-price-block">
                <div className="pricing-ticket-price-label">{t('pricing.ticketRate', { defaultValue: 'Rate' })}</div>
                <div className="pricing-ticket-price">{t(`${prefix}.price`)}</div>
              </div>
            </div>
            <Button
              type="button"
              variant={isCurrent ? 'outline' : planId === 'advanced' ? 'outline' : 'brand'}
              disabled={isCurrent || planId === 'advanced'}
              className="pricing-ticket-cta h-[37px] w-full rounded-[9px]"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
