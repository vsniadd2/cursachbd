import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { fetchRoles } from '@/services/roles.service'
import type { RoleRow } from '@/types/crm'

export function RolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchRoles()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContent>
      <PageHeader title="Roles & permissions" description="Access control policies" />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', header: 'Role', cell: (r) => r.name },
          { key: 'desc', header: 'Description', cell: (r) => r.description ?? '—' },
          {
            key: 'perm',
            header: 'Permissions',
            cell: (r) => (
              <span className="text-[11px] text-ink-2">{r.permissions.slice(0, 4).join(', ')}</span>
            ),
          },
        ]}
      />
    </PageContent>
  )
}
