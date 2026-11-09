import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { EmptyState } from '@/components/app/EmptyState'
import { StatusBadge } from '@/components/app/StatusBadge'
import { fetchProjects } from '@/services/projects.service'
import type { Project } from '@/types/crm'

export function DealsPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchProjects()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContent>
      <PageHeader title={t('deals.title')} description={t('deals.description')} />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title={t('deals.empty')} />}
        columns={[
          { key: 'name', header: tc('table.deal'), cell: (r) => r.name },
          { key: 'client', header: tc('table.client'), cell: (r) => r.client?.companyName ?? tc('dash') },
          {
            key: 'budget',
            header: tc('table.value'),
            cell: (r) => (r.budget ? `$${Number(r.budget).toLocaleString()}` : tc('dash')),
          },
          { key: 'status', header: tc('table.stage'), cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
