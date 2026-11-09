import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { fetchUsers } from '@/services/users.service'
import type { TeamUser } from '@/types/crm'

export function TeamPage() {
  const [rows, setRows] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchUsers()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContent>
      <PageHeader title="Team members" description="People in your workspace" />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', header: 'Name', cell: (r) => `${r.firstName} ${r.lastName}` },
          { key: 'email', header: 'Email', cell: (r) => r.email },
          { key: 'role', header: 'Role', cell: (r) => r.role.name },
        ]}
      />
    </PageContent>
  )
}
