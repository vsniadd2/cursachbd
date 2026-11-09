import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { PageSection } from '@/components/app/PageSection'
import { fetchInvoices } from '@/services/invoices.service'
import type { Invoice } from '@/types/crm'

export function RevenuePage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchInvoices()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  const total = rows.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <PageContent>
      <PageHeader title={t('revenue.title')} description={t('revenue.description')} />
      <PageSection className="mb-4">
        <p className="text-[12px] text-ink-2">{t('revenue.outstanding')}</p>
        <p className="text-[27px] font-medium tabular tracking-tight">${total.toLocaleString()}</p>
      </PageSection>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'num', header: tc('table.invoice'), cell: (r) => r.invoiceNumber },
          { key: 'client', header: tc('table.client'), cell: (r) => r.client?.companyName ?? tc('dash') },
          { key: 'amount', header: tc('table.amount'), cell: (r) => `$${Number(r.amount).toLocaleString()}` },
          { key: 'status', header: tc('table.status'), cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
