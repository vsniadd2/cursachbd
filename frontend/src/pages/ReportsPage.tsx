import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { REPORT_TEMPLATES } from '@/mocks/marketing'

export function ReportsPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [message, setMessage] = useState<string | null>(null)

  return (
    <PageContent>
      <PageHeader title={t('reports.title')} description={t('reports.description')} />
      <div className="grid gap-3">
        {REPORT_TEMPLATES.map((r) => (
          <PageSection key={r.id} className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13px] font-medium">{r.name}</p>
              <p className="text-[11px] text-ink-2">{r.period}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setMessage(t('reportsExtra.queued', { name: r.name }))}>
              {tc('export')}
            </Button>
          </PageSection>
        ))}
      </div>
      {message && <p className="mt-4 text-[12px] text-pos">{message}</p>}
    </PageContent>
  )
}
