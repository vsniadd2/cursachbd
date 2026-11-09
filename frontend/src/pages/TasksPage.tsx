import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { DataTable } from '@/components/app/DataTable'
import { StatusBadge } from '@/components/app/StatusBadge'
import { Button } from '@/components/ui/button'
import { fetchTasks, updateTask } from '@/services/tasks.service'
import type { Task } from '@/types/crm'

export function TasksPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    fetchTasks()
      .then(setRows)
      .finally(() => setLoading(false))

  useEffect(() => {
    void load()
  }, [])

  async function markDone(task: Task) {
    await updateTask(task.id, { status: 'DONE' })
    await load()
  }

  return (
    <PageContent>
      <PageHeader title={t('tasks.title')} description={t('tasks.description')} />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'title', header: tc('table.task'), cell: (r) => r.title },
          { key: 'project', header: tc('table.project'), cell: (r) => r.project?.name ?? tc('dash') },
          { key: 'priority', header: tc('table.priority'), cell: (r) => <StatusBadge value={r.priority} /> },
          { key: 'status', header: tc('table.status'), cell: (r) => <StatusBadge value={r.status} /> },
          {
            key: 'actions',
            header: '',
            cell: (r) =>
              r.status !== 'DONE' ? (
                <Button type="button" size="sm" variant="outline" onClick={() => void markDone(r)}>
                  {t('tasks.done')}
                </Button>
              ) : null,
          },
        ]}
      />
    </PageContent>
  )
}
