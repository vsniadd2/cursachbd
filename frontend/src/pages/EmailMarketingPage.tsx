import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'

const rows = [
  { id: '1', name: 'Weekly digest', sent: 12400, open: '38%' },
  { id: '2', name: 'Product tips', sent: 8200, open: '41%' },
  { id: '3', name: 'Re-engagement', sent: 3100, open: '22%' },
]

export function EmailMarketingPage() {
  return (
    <PageContent>
      <PageHeader title="Email marketing" description="Broadcast performance" />
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', header: 'Campaign', cell: (r) => r.name },
          { key: 'sent', header: 'Sent', cell: (r) => r.sent.toLocaleString() },
          { key: 'open', header: 'Open rate', cell: (r) => r.open },
        ]}
      />
    </PageContent>
  )
}
