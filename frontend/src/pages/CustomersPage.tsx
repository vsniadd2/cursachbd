import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { EmptyState } from '@/components/app/EmptyState'
import { StatusBadge } from '@/components/app/StatusBadge'
import { fetchClients } from '@/services/clients.service'
import type { Client } from '@/types/crm'

export function CustomersPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchClients('ACTIVE')
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContent>
      <PageHeader title={t('customers.title')} description={t('customers.description')} />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title={t('customers.empty')} />}
        columns={[
          { key: 'company', header: tc('table.company'), cell: (r) => r.companyName },
          { key: 'email', header: tc('table.email'), cell: (r) => r.email ?? tc('dash') },
          { key: 'phone', header: tc('table.phone'), cell: (r) => r.phone ?? tc('dash') },
          { key: 'status', header: tc('table.status'), cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
