import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { PageSection } from '@/components/app/PageSection'
import { fetchInvoices } from '@/services/invoices.service'
import type { Invoice } from '@/types/crm'

export function RevenuePage() {
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
      <PageHeader title="Revenue & invoices" description="Billing and payment status" />
      <PageSection className="mb-4">
        <p className="text-[12px] text-ink-2">Outstanding total</p>
        <p className="text-[27px] font-medium tabular tracking-tight">${total.toLocaleString()}</p>
      </PageSection>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'num', header: 'Invoice', cell: (r) => r.invoiceNumber },
          { key: 'client', header: 'Client', cell: (r) => r.client?.companyName ?? '—' },
          { key: 'amount', header: 'Amount', cell: (r) => `$${Number(r.amount).toLocaleString()}` },
          { key: 'status', header: 'Status', cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
