import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchProjects } from '@/services/projects.service'
import type { Project } from '@/types/crm'

export function DealsPage() {
  const [rows, setRows] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchProjects()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContent>
      <PageHeader title="Deals" description="Projects linked to revenue" />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title="No deals" />}
        columns={[
          { key: 'name', header: 'Deal', cell: (r) => r.name },
          { key: 'client', header: 'Client', cell: (r) => r.client?.companyName ?? '—' },
          { key: 'budget', header: 'Value', cell: (r) => (r.budget ? `$${Number(r.budget).toLocaleString()}` : '—') },
          { key: 'status', header: 'Stage', cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
