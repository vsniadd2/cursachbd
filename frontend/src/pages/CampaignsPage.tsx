import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { INITIAL_CAMPAIGNS } from '@/mocks/marketing'

export function CampaignsPage() {
  const { t } = useTranslation('pages')
  const [campaigns] = useState(INITIAL_CAMPAIGNS)

  return (
    <PageContent>
      <PageHeader title={t('campaigns.title')} description={t('campaigns.description')} />
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => (
          <PageSection key={c.id}>
            <p className="text-[14px] font-medium">{c.name}</p>
            <p className="mt-1 text-[12px] text-ink-2">
              {t('campaignsExtra.status')} {c.status}
            </p>
            <p className="mt-2 text-[22px] font-medium tabular">{c.reach.toLocaleString()}</p>
            <p className="text-[11px] text-ink-2">{t('campaignsExtra.reach')}</p>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
