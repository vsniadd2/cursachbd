import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PricingTicketCard } from '@/components/pricing/PricingTicketCard'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentPlan, type PlanId } from '@/lib/billing/plan'

const PLANS: PlanId[] = ['starter', 'advanced', 'enterprise']

export function PricingPage() {
  const { t } = useTranslation('pages')
  const { user } = useAuth()
  const current = getCurrentPlan(user)

  return (
    <PageContent>
      <PageHeader title={t('pricing.title')} description={t('pricing.description')} />
      <div className="pricing-tickets-grid grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((planId) => (
          <PricingTicketCard
            key={planId}
            planId={planId}
            isCurrent={current === planId}
            highlighted={planId === 'enterprise'}
          />
        ))}
      </div>
    </PageContent>
  )
}
