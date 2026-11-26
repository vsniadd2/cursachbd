import { EntityPage } from '@/components/crm/EntityPage'
import { useSearchParams } from 'react-router-dom'
export function TasksPage() {
  const [params] = useSearchParams()
  return <EntityPage kind="tasks" key={params.get('taskId') ?? 'tasks'} />
}
