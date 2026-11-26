import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  History,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import { PageContent } from '@/components/app/PageContent'
import { PageFeedback } from '@/components/app/PageFeedback'
import { PageSection } from '@/components/app/PageSection'
import { StatusBadge } from '@/components/app/StatusBadge'
import { WorkspaceDialog } from '@/components/app/WorkspaceDialog'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ProjectTasks } from '@/components/projects/ProjectTasks'
import { ProjectTeam } from '@/components/projects/ProjectTeam'
import {
  fullName,
  isOverdue,
  ProjectDeadline,
  ProjectProgress,
  RequestError,
  useProjectLabels,
  useProjectRequest,
  uuidPattern,
} from '@/components/projects/projectShared'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { errorText } from '@/lib/product'
import { cn } from '@/lib/utils'
import { fetchClients } from '@/services/clients.service'
import { fetchInvoices } from '@/services/invoices.service'
import { deleteProject, fetchProject, fetchProjectHistory } from '@/services/projects.service'
import { fetchTasks } from '@/services/tasks.service'
import { fetchUsers } from '@/services/users.service'
import type { Invoice, ProjectDetails, ProjectHistoryEntry, Task } from '@/types/crm'

const loadClients = (signal: AbortSignal) => fetchClients(undefined, signal)
const loadUsers = (signal: AbortSignal) => fetchUsers(undefined, signal)

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const { state, pathname } = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const selectedTask = params.get('taskId')
  const { w } = useProjectLabels()
  const { user } = useAuth()
  const canRead = userCan(user, 'projects:read')
  const canWrite = userCan(user, 'projects:write')
  const canReadTasks = userCan(user, 'tasks:read')
  const canReadInvoices = userCan(user, 'invoices:read')
  const canWriteTasks = userCan(user, 'tasks:write')
  const returned = (state as { returnTo?: string } | null)?.returnTo
  const back = returned?.startsWith('/projects?') ? returned : '/projects'
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [notice, setNotice] = useState('')
  const tabs = [
    { key: 'overview', label: w('Обзор', 'Overview'), Icon: Building2, enabled: true },
    { key: 'tasks', label: w('Задачи', 'Tasks'), Icon: ClipboardList, enabled: canReadTasks },
    { key: 'team', label: w('Команда', 'Team'), Icon: Users, enabled: true },
    { key: 'invoices', label: w('Счета', 'Invoices'), Icon: CircleDollarSign, enabled: canReadInvoices },
    { key: 'history', label: w('История', 'History'), Icon: History, enabled: true },
  ].filter((tab) => tab.enabled)
  const active = tabs.find((tab) => tab.key === params.get('tab'))?.key ?? 'overview'
  const loadProject = useCallback((signal: AbortSignal) => fetchProject(id, signal), [id])
  const loadTasks = useCallback((signal: AbortSignal) => fetchTasks({ projectId: id }, signal), [id])
  const loadInvoices = useCallback((signal: AbortSignal) => fetchInvoices({ projectId: id }, signal), [id])
  const loadHistory = useCallback((signal: AbortSignal) => fetchProjectHistory(id, signal), [id])
  const project = useProjectRequest(canRead && uuidPattern.test(id) ? loadProject : null)
  const tasks = useProjectRequest(project.data && canReadTasks ? loadTasks : null)
  const refreshTasks = tasks.reload
  useEffect(() => {
    if (selectedTask) refreshTasks()
  }, [selectedTask, refreshTasks])
  const invoices = useProjectRequest(
    project.data && canReadInvoices && active === 'invoices' ? loadInvoices : null,
  )
  const history = useProjectRequest(project.data && active === 'history' ? loadHistory : null)
  const clients = useProjectRequest(
    project.data && editing && userCan(user, 'clients:read') ? loadClients : null,
  )
  const people = useProjectRequest(
    project.data &&
      userCan(user, 'users:read') &&
      ((active === 'team' && canWrite) || (active === 'tasks' && canWriteTasks))
      ? loadUsers
      : null,
  )

  function changed(message: string) {
    setNotice(message)
    window.dispatchEvent(new Event('crm:changed'))
  }
  async function remove() {
    if (busy) return
    setBusy(true)
    setDeleteError('')
    try {
      await deleteProject(id)
      window.dispatchEvent(new Event('crm:changed'))
      navigate(back, { replace: true })
    } catch (e) {
      const error = errorText(e)
      setDeleteError(
        error === 'Remove linked tasks and invoices first' ||
          error === 'Linked record missing or still in use'
          ? w(
              'У проекта есть задачи или счета. Чтобы закрыть проект, измените его статус на «Завершён» или «Отменён».',
              'This project has tasks or invoices. Set its status to Completed or Cancelled to close it.',
            )
          : error,
      )
    } finally {
      setBusy(false)
    }
  }

  const item = project.data
  return (
    <PageContent>
      <Link
        to={back}
        className="mb-4 inline-flex items-center gap-2 rounded-md text-sm font-medium text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {w('Все проекты', 'All projects')}
      </Link>
      {!canRead ? (
        <PageFeedback state="empty">
          {w('У вашей роли нет доступа к проектам.', 'Your role cannot access projects.')}
        </PageFeedback>
      ) : !uuidPattern.test(id) ? (
        <PageFeedback state="empty">{w('Проект не найден.', 'Project not found.')}</PageFeedback>
      ) : project.error ? (
        <RequestError
          error={
            project.error === 'Project not found'
              ? w('Проект не найден.', 'Project not found.')
              : project.error
          }
          retry={project.reload}
        />
      ) : !item ? (
        <PageFeedback state="loading">{w('Загружаем проект…', 'Loading project…')}</PageFeedback>
      ) : (
        <div className="mx-auto max-w-[1250px]">
          <div className="workspace-surface mb-4 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex flex-wrap justify-between gap-4 p-4 sm:p-6">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge value={item.status} />
                  <StatusBadge value={item.priority} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
                  {item.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-ink-2 [overflow-wrap:anywhere]">
                  <Building2 className="size-4 shrink-0" aria-hidden="true" />
                  {item.client.companyName}
                </p>
              </div>
              {canWrite && (
                <div className="flex flex-wrap items-start gap-2">
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="size-4" aria-hidden="true" />
                    {w('Редактировать', 'Edit project')}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={w('Удалить проект', 'Delete project')}
                    onClick={() => {
                      setDeleteError('')
                      setDeleting(true)
                    }}
                  >
                    <Trash2 className="size-4 text-danger" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
            <nav
              className="flex flex-wrap gap-1 border-t border-line bg-shell/40 px-2 sm:px-4"
              aria-label={w('Разделы проекта', 'Project sections')}
            >
              {tabs.map(({ key, label, Icon }) => (
                <Link
                  key={key}
                  to={{ pathname, search: key === 'overview' ? '' : `?tab=${key}` }}
                  state={{ returnTo: back }}
                  aria-current={key === active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-1.5 rounded-sm border-b-2 px-2.5 text-sm font-medium sm:px-3',
                    key === active ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          {notice && (
            <PageFeedback state="success" className="mb-4">
              {notice}
            </PageFeedback>
          )}
          {active === 'overview' && (
            <ProjectOverview project={item} tasks={tasks} canReadTasks={canReadTasks} />
          )}
          {active === 'tasks' &&
            (tasks.error ? (
              <RequestError error={tasks.error} retry={tasks.reload} />
            ) : !tasks.data ? (
              <PageFeedback state="loading">{w('Загружаем задачи…', 'Loading tasks…')}</PageFeedback>
            ) : (
              <>
                {people.error && (
                  <div className="mb-4">
                    <RequestError error={people.error} retry={people.reload} />
                  </div>
                )}
                <ProjectTasks
                  key={selectedTask ?? 'tasks'}
                  project={item}
                  tasks={tasks.data}
                  selectedTask={selectedTask}
                  people={people.data}
                  canWrite={canWriteTasks}
                  refreshing={tasks.loading}
                  changed={() => {
                    tasks.reload()
                    changed(w('Задача сохранена', 'Task saved'))
                  }}
                />
              </>
            ))}
          {active === 'team' && (
            <ProjectTeam
              project={item}
              people={people.data}
              canWrite={canWrite}
              error={people.error}
              retry={people.reload}
              changed={() => {
                project.reload()
                changed(w('Команда проекта обновлена', 'Project team updated'))
              }}
            />
          )}
          {active === 'invoices' &&
            (invoices.error ? (
              <RequestError error={invoices.error} retry={invoices.reload} />
            ) : !invoices.data ? (
              <PageFeedback state="loading">{w('Загружаем счета…', 'Loading invoices…')}</PageFeedback>
            ) : (
              <ProjectInvoices id={id} items={invoices.data} />
            ))}
          {active === 'history' &&
            (history.error ? (
              <RequestError error={history.error} retry={history.reload} />
            ) : !history.data ? (
              <PageFeedback state="loading">{w('Загружаем историю…', 'Loading history…')}</PageFeedback>
            ) : (
              <ProjectHistory items={history.data} />
            ))}
          {editing && (
            <ProjectForm
              project={item}
              clients={clients.data}
              onClose={() => setEditing(false)}
              onSave={() => {
                setEditing(false)
                project.reload()
                history.reload()
                changed(w('Изменения проекта сохранены', 'Project changes saved'))
              }}
            />
          )}
          {deleting && (
            <WorkspaceDialog
              label={w('Удалить проект', 'Delete project')}
              dismissible={!busy}
              onClose={() => setDeleting(false)}
              className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold">{w('Удалить проект?', 'Delete project?')}</h3>
              <p className="mt-2 text-sm text-ink-2 [overflow-wrap:anywhere]">
                {w(
                  `Проект «${item.name}» будет удалён. Восстановить его нельзя.`,
                  `“${item.name}” will be permanently deleted.`,
                )}
              </p>
              {deleteError && (
                <PageFeedback state="error" className="mt-4">
                  {deleteError}
                </PageFeedback>
              )}
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" disabled={busy} onClick={() => setDeleting(false)}>
                  {w('Отмена', 'Cancel')}
                </Button>
                <Button
                  className="border-danger bg-danger text-white hover:bg-danger-strong"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  {w('Удалить навсегда', 'Delete permanently')}
                </Button>
              </div>
            </WorkspaceDialog>
          )}
        </div>
      )}
    </PageContent>
  )
}

function ProjectOverview({
  project,
  tasks,
  canReadTasks,
}: {
  project: ProjectDetails
  tasks: ReturnType<typeof useProjectRequest<Task[]>>
  canReadTasks: boolean
}) {
  const labels = useProjectLabels()
  const { w } = labels
  const lead = project.members.find((member) => member.role === 'OWNER')
  const progress = tasks.data?.reduce(
    (total, task) => ({
      done: total.done + Number(task.status === 'DONE'),
      total: total.total + Number(task.status !== 'CANCELLED'),
    }),
    { done: 0, total: 0 },
  )
  const overdue = tasks.data?.filter((task) => isOverdue(task.dueDate, task.status)).length
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <PageSection>
        <h3 className="mb-4 font-semibold">{w('О проекте', 'About this project')}</h3>
        <p className="mb-5 text-sm leading-relaxed whitespace-pre-wrap text-ink-2 [overflow-wrap:anywhere]">
          {project.description || w('Описание пока не добавлено.', 'No description yet.')}
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
          <Meta label={w('Дата начала', 'Start date')}>
            <span className="flex items-center gap-1.5 text-ink-2">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {labels.date(project.startDate)}
            </span>
          </Meta>
          <Meta label={w('Срок проекта', 'Project deadline')}>
            <ProjectDeadline value={project.endDate} status={project.status} />
          </Meta>
          <Meta label={w('Руководитель', 'Project lead')}>
            {lead ? fullName(lead.user) : w('Не назначен', 'Unassigned')}
          </Meta>
          <Meta label={w('Плановый бюджет (USD)', 'Planned budget (USD)')}>
            {labels.money(project.budget)}
          </Meta>
        </dl>
      </PageSection>
      {canReadTasks && (
        <PageSection>
          <h3 className="mb-4 font-semibold">{w('Ход работ', 'Delivery progress')}</h3>
          {tasks.error ? (
            <RequestError error={tasks.error} retry={tasks.reload} />
          ) : !progress ? (
            <PageFeedback state="loading">{w('Загружаем прогресс…', 'Loading progress…')}</PageFeedback>
          ) : (
            <>
              <ProjectProgress progress={progress} />
              <p className="mt-3 text-xs text-ink-2">
                {w(
                  'Выполненные задачи среди всех задач проекта без отменённых.',
                  'Completed tasks as a share of all non-cancelled tasks.',
                )}
              </p>
              {Boolean(overdue) && (
                <p className="mt-3 text-sm font-medium text-danger-strong">
                  {w('Просрочено задач', 'Overdue tasks')} · {overdue}
                </p>
              )}
            </>
          )}
        </PageSection>
      )}
    </div>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-xs font-medium text-ink-2">{label}</dt>
      <dd className="text-sm [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}

function ProjectInvoices({ id, items }: { id: string; items: Invoice[] }) {
  const labels = useProjectLabels()
  const { w } = labels
  return (
    <PageSection>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{w('Счета проекта', 'Project invoices')}</h3>
        <Button asChild variant="outline">
          <Link to={`/revenue?projectId=${id}`}>
            {w('Открыть реестр счетов', 'Open invoice register')}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      {!items.length ? (
        <PageFeedback state="empty">
          {w('К проекту пока не привязаны счета.', 'No invoices are linked to this project yet.')}
        </PageFeedback>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line px-3 sm:px-4">
          {items.map((invoice) => (
            <li
              key={invoice.id}
              className="grid items-center gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_1fr_1fr_auto]"
            >
              <span className="font-medium [overflow-wrap:anywhere]">{invoice.invoiceNumber}</span>
              <span className="text-sm tabular-nums">{labels.money(invoice.amount, invoice.currency)}</span>
              <ProjectDeadline status={invoice.status} value={invoice.dueDate} />
              <div>
                <StatusBadge value={invoice.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  )
}

function ProjectHistory({ items }: { items: ProjectHistoryEntry[] }) {
  const labels = useProjectLabels()
  const { w } = labels
  const fields: Record<string, string> = {
    name: w('Название', 'Name'),
    clientId: w('Клиент', 'Client'),
    status: w('Статус', 'Status'),
    priority: w('Приоритет', 'Priority'),
    startDate: w('Дата начала', 'Start date'),
    endDate: w('Срок', 'Deadline'),
    budget: w('Бюджет', 'Budget'),
    description: w('Описание', 'Description'),
  }
  return (
    <PageSection>
      <h3 className="mb-4 font-semibold">{w('История проекта', 'Project history')}</h3>
      {!items.length ? (
        <PageFeedback state="empty">
          {w('Записей об изменениях пока нет.', 'There are no recorded changes yet.')}
        </PageFeedback>
      ) : (
        <ol className="divide-y divide-line">
          {items.map((item) => {
            const data = item.metadata
            const action =
              item.action === 'CREATE'
                ? w('Проект создан', 'Project created')
                : item.action === 'UPDATE'
                  ? w('Параметры проекта изменены', 'Project details updated')
                  : data?.toRole
                    ? w('Роль в проекте обновлена', 'Project role updated')
                    : w('Участник удалён из проекта', 'Member removed from project')
            const details = [
              data?.fields
                ?.map((key) => fields[key])
                .filter(Boolean)
                .join(', '),
              data?.fromStatus &&
                data.toStatus &&
                `${labels.status(data.fromStatus)} → ${labels.status(data.toStatus)}`,
              data?.member,
              data?.toRole && labels.role(data.toRole),
            ]
              .filter(Boolean)
              .join(' · ')
            return (
              <li key={item.id} className="flex gap-3 py-3">
                <History className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden="true" />
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="text-sm font-medium">{action}</p>
                  {details && <p className="mt-1 text-sm text-ink-2">{details}</p>}
                  <p className="mt-1 text-xs text-ink-2">
                    {item.user && <>{fullName(item.user)} · </>}
                    <time dateTime={item.createdAt}>{labels.dateTime(item.createdAt)}</time>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </PageSection>
  )
}
