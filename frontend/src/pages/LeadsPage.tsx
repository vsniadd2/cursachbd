import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
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
        title={t('leads.title')}
        description={t('leads.description')}
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder={t('leads.companyPlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full sm:w-48"
            />
            <Button variant="brand" type="button" onClick={() => void addLead()}>
              {t('leads.addLead')}
            </Button>
          </div>
        }
      />
      <DataTable
        loading={loading}
        rows={rows}
        empty={<EmptyState title={t('leads.emptyTitle')} description={t('leads.emptyDesc')} />}
        columns={[
          { key: 'company', header: tc('table.company'), cell: (r) => r.companyName },
          { key: 'contact', header: tc('table.contact'), cell: (r) => r.contactName ?? tc('dash') },
          { key: 'email', header: tc('table.email'), cell: (r) => r.email ?? tc('dash') },
          { key: 'status', header: tc('table.status'), cell: (r) => <StatusBadge value={r.status} /> },
        ]}
      />
    </PageContent>
  )
}
