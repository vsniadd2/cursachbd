import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchClients } from '@/services/clients.service'
import type { Client } from '@/types/crm'

export function CustomersPage() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const active = await fetchClients('ACTIVE')
        const inactive = await fetchClients('INACTIVE')
        setRows([...active, ...inactive])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <PageContent>
      <PageHeader title="Customers" description="Active accounts and relationships" />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title="No customers" />}
        columns={[
          { key: 'company', header: 'Company', cell: (r) => r.companyName },
          { key: 'email', header: 'Email', cell: (r) => r.email ?? '—' },
          { key: 'phone', header: 'Phone', cell: (r) => r.phone ?? '—' },
          { key: 'status', header: 'Status', cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
