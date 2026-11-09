import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'

const rows = [
  { id: '1', name: 'Weekly digest', sent: 12400, open: '38%' },
  { id: '2', name: 'Product tips', sent: 8200, open: '41%' },
  { id: '3', name: 'Re-engagement', sent: 3100, open: '22%' },
]

export function EmailMarketingPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')

  return (
    <PageContent>
      <PageHeader title={t('emailMarketing.title')} description={t('emailMarketing.description')} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', header: tc('table.campaign'), cell: (r) => r.name },
          { key: 'sent', header: tc('table.sent'), cell: (r) => r.sent.toLocaleString() },
          { key: 'open', header: tc('table.openRate'), cell: (r) => r.open },
        ]}
      />
    </PageContent>
  )
}
