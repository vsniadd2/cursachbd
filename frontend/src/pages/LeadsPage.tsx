import { useEffect, useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { EmptyState } from '@/components/app/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchClients, createClient } from '@/services/clients.service'
import type { Client } from '@/types/crm'

export function LeadsPage() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  async function reload() {
    setLoading(true)
    try {
      setRows(await fetchClients('LEAD'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchClients('LEAD')
        if (!cancelled) setRows(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function addLead() {
    if (!name.trim()) return
    await createClient({ companyName: name, status: 'LEAD' })
    setName('')
    await reload()
  }

  return (
    <PageContent>
      <PageHeader
        title="Pipeline leads"
        description="New prospects before conversion"
        actions={
          <div className="flex gap-2">
            <Input placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
            <Button variant="brand" type="button" onClick={() => void addLead()}>
              Add lead
            </Button>
          </div>
        }
      />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title="No leads yet" description="Create your first lead with Add lead." />}
        columns={[
          { key: 'company', header: 'Company', cell: (r) => r.companyName },
          { key: 'contact', header: 'Contact', cell: (r) => r.contactName ?? '—' },
          { key: 'email', header: 'Email', cell: (r) => r.email ?? '—' },
          { key: 'status', header: 'Status', cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
