import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  FolderKanban,
  Layers3,
  List,
  Plus,
  Search,
  Timer,
} from 'lucide-react'
import { PageContent } from '@/components/app/PageContent'
import { PageFeedback } from '@/components/app/PageFeedback'
import { StatusBadge } from '@/components/app/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectForm } from '@/components/projects/ProjectForm'
import {
  fullName,
  Options,
  projectControl,
  ProjectDeadline,
  ProjectProgress,
  projectStatuses,
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
import { fetchUsers } from '@/services/users.service'
import {
  fetchProjectPage,
  fetchProjectSummary,
  updateProject,
  type ProjectsPageData,
  type ProjectSort,
} from '@/services/projects.service'
import type { Project, ProjectListItem } from '@/types/crm'

const sorts: ProjectSort[] = ['updated', 'deadline', 'priority', 'budget', 'name']
const fetchClientOptions = (signal: AbortSignal) => fetchClients(undefined, signal)
const fetchLeadOptions = (signal: AbortSignal) => fetchUsers(undefined, signal)

export function ProjectsPage() {
  const labels = useProjectLabels()
  const { w } = labels
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const canRead = userCan(user, 'projects:read')
  const canCreate = userCan(user, 'projects:write') && userCan(user, 'clients:read')
  const canWrite = userCan(user, 'projects:write')
  const clients = useProjectRequest(canRead && userCan(user, 'clients:read') ? fetchClientOptions : null)
  const people = useProjectRequest(canRead && userCan(user, 'users:read') ? fetchLeadOptions : null)
  const urlQuery = (params.get('q') ?? '').slice(0, 200)
  const [q, setQ] = useState(urlQuery)
  const [writing, setWriting] = useState(false)
  const [writeError, setWriteError] = useState('')
  const [notice, setNotice] = useState('')
  const focusAfterMove = useRef<string | null>(null)
  const boardControl = useRef<HTMLButtonElement>(null)
  const board = params.get('view') === 'board'
  const createOpen = params.get('create') === '1' && canCreate
  const clientParam = params.get('clientId') ?? ''
  const leadParam = params.get('leadId') ?? ''
  const clientId = uuidPattern.test(clientParam) ? clientParam : undefined
  const leadId = uuidPattern.test(leadParam) ? leadParam : undefined
  const status = projectStatuses.find((value) => value === params.get('status'))
  const sort = sorts.find((value) => value === params.get('sort')) ?? 'updated'
  const overdue = params.get('overdue') === 'true'
  const rawPage = Number(params.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 100000 ? rawPage : 1
  const hasFilters = Boolean(urlQuery || clientId || leadId || status || overdue)

  function setFilters(values: Record<string, string>, replace = false) {
    const next = new URLSearchParams(params)
    if (!('page' in values) && !('create' in values)) next.delete('page')
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace })
  }

  // Keep the URL usable as a deep link while avoiding a request per keystroke.
  useEffect(() => {
    if (q === urlQuery) return
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      if (q) next.set('q', q)
      else next.delete('q')
      next.delete('page')
      setParams(next, { replace: true })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [q, urlQuery, params, setParams])
  const [observedQuery, setObservedQuery] = useState(urlQuery)
  if (observedQuery !== urlQuery) {
    setObservedQuery(urlQuery)
    setQ(urlQuery)
  }

  const loadSummary = useCallback((signal: AbortSignal) => fetchProjectSummary(clientId, signal), [clientId])
  const summary = useProjectRequest(canRead ? loadSummary : null)
  const load = useCallback(
    async (signal: AbortSignal) => {
      const filters = {
        clientId,
        leadId,
        q: urlQuery.trim() || undefined,
        status,
        sort,
        overdue: overdue ? (true as const) : undefined,
      }
      if (board) {
        return {
          columns: await Promise.all(
            (status ? [status] : projectStatuses).map(async (column) => ({
              status: column,
              ...(await fetchProjectPage({ ...filters, status: column, page: 1, limit: 8 }, signal)),
            })),
          ),
        }
      }
      return { table: await fetchProjectPage({ ...filters, page, limit: 20 }, signal) }
    },
    [board, clientId, leadId, overdue, page, sort, status, urlQuery],
  )
  const projects = useProjectRequest(canRead ? load : null)
  useLayoutEffect(() => {
    if (writing || projects.loading || !focusAfterMove.current) return
    if (document.activeElement === document.body) {
      ;(document.getElementById(focusAfterMove.current) ?? boardControl.current)?.focus()
    }
    focusAfterMove.current = null
  }, [projects.loading, writing])

  const returnParams = new URLSearchParams(params)
  returnParams.delete('create')
  const returnTo = '/projects' + (returnParams.size ? `?${returnParams}` : '')
  function openProject(id: string) {
    return { to: `/projects/${id}`, state: { returnTo } }
  }
  function clear() {
    setQ('')
    setFilters({ q: '', status: '', clientId: '', leadId: '', overdue: '', sort: '' })
  }
  async function changeStatus(item: ProjectListItem, next: Project['status'], control: HTMLSelectElement) {
    if (writing || next === item.status) return
    if (document.activeElement === control) focusAfterMove.current = control.id
    setWriting(true)
    setWriteError('')
    setNotice('')
    try {
      await updateProject(item.id, { status: next })
      projects.reload()
      summary.reload()
      setNotice(w('Статус проекта обновлён', 'Project status updated'))
      window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setWriteError(errorText(e))
    } finally {
      setWriting(false)
    }
  }

  if (!canRead)
    return (
      <PageContent>
        <h2 className="mb-4 text-xl font-semibold">{w('Проекты', 'Projects')}</h2>
        <PageFeedback state="empty">
          {w('У вашей роли нет доступа к проектам.', 'Your role cannot access projects.')}
        </PageFeedback>
      </PageContent>
    )

  const stats = [
    {
      key: 'total',
      name: w('Все проекты', 'All projects'),
      Icon: Layers3,
      selected: !status && !overdue,
      filter: { status: '', overdue: '' },
    },
    {
      key: 'active',
      name: w('В работе', 'In progress'),
      Icon: Timer,
      selected: status === 'ACTIVE' && !overdue,
      filter: { status: 'ACTIVE', overdue: '' },
    },
    {
      key: 'overdue',
      name: w('Просрочены', 'Overdue'),
      Icon: CalendarClock,
      selected: overdue && !status,
      filter: { status: '', overdue: 'true' },
    },
    {
      key: 'completed',
      name: w('Завершены', 'Completed'),
      Icon: CircleCheck,
      selected: status === 'COMPLETED' && !overdue,
      filter: { status: 'COMPLETED', overdue: '' },
    },
  ] as const
  const columns = projects.data?.columns
  const table = projects.data?.table
  const total = table?.total ?? columns?.reduce((count, column) => count + column.total, 0)
  const empty = total === 0

  return (
    <PageContent>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{w('Проекты', 'Projects')}</h2>
          <p className="mt-1 text-sm text-ink-2">
            {w(
              'Сроки, команда и ход работ по клиентским проектам.',
              'Track deadlines, teams, and delivery across client projects.',
            )}
          </p>
        </div>
        {canCreate && (
          <Button variant="brand" onClick={() => setFilters({ create: '1' })}>
            <Plus className="size-4" aria-hidden="true" />
            {w('Новый проект', 'New project')}
          </Button>
        )}
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {stats.map(({ key, name, Icon, selected, filter }) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            onClick={() => setFilters(filter)}
            className={cn(
              'workspace-surface workspace-interactive flex min-w-0 items-start gap-2 rounded-xl border bg-surface p-3 text-left sm:gap-3 sm:p-4',
              selected ? 'border-brand/55' : 'border-line',
            )}
          >
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-lg sm:size-9',
                key === 'overdue' ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand-strong',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="grid gap-0.5">
              <span className="text-xs font-medium text-ink-2">{name}</span>
              <span className="text-xl leading-tight font-semibold tabular-nums sm:text-2xl">
                {summary.data?.[key] ?? '—'}
              </span>
            </span>
          </button>
        ))}
      </div>
      {summary.error && (
        <div className="mb-4">
          <RequestError error={summary.error} retry={summary.reload} />
        </div>
      )}
      <div className="workspace-toolbar mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 basis-full md:basis-0 md:grow">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2"
              aria-hidden="true"
            />
            <Input
              className="min-h-10 pl-9"
              aria-label={w('Поиск проектов', 'Search projects')}
              placeholder={w('Проект или клиент', 'Project or client')}
              maxLength={200}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div
            className="flex rounded-lg border border-line bg-shell p-0.5"
            role="group"
            aria-label={w('Вид проектов', 'Project view')}
          >
            <Button
              size="sm"
              variant={!board ? 'outline' : 'ghost'}
              aria-pressed={!board}
              onClick={() => setFilters({ view: '' })}
            >
              <List className="size-4" aria-hidden="true" />
              {w('Список', 'List')}
            </Button>
            <Button
              ref={boardControl}
              size="sm"
              variant={board ? 'outline' : 'ghost'}
              aria-pressed={board}
              onClick={() => setFilters({ view: 'board' })}
            >
              <FolderKanban className="size-4" aria-hidden="true" />
              {w('Доска', 'Board')}
            </Button>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 md:flex md:flex-wrap">
          <select
            aria-label={w('Фильтр по статусу', 'Filter by status')}
            className={projectControl + ' md:w-auto'}
            value={status ?? ''}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">{w('Все статусы', 'All statuses')}</option>
            <Options values={projectStatuses} />
          </select>
          {clients.data && (
            <select
              aria-label={w('Фильтр по клиенту', 'Filter by client')}
              className={projectControl + ' md:w-auto md:max-w-56'}
              value={clientId ?? ''}
              onChange={(e) => setFilters({ clientId: e.target.value })}
            >
              <option value="">{w('Все клиенты', 'All clients')}</option>
              {clientId && !clients.data.some((client) => client.id === clientId) && (
                <option value={clientId}>{w('Выбранный клиент', 'Selected client')}</option>
              )}
              {clients.data.map((client) => (
                <option value={client.id} key={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          )}
          {people.data && (
            <select
              aria-label={w('Фильтр по руководителю', 'Filter by project lead')}
              className={projectControl + ' md:w-auto md:max-w-56'}
              value={leadId ?? ''}
              onChange={(e) => setFilters({ leadId: e.target.value })}
            >
              <option value="">{w('Все руководители', 'All project leads')}</option>
              {leadId && !people.data.some((person) => person.id === leadId) && (
                <option value={leadId}>{w('Выбранный руководитель', 'Selected project lead')}</option>
              )}
              {people.data.map((person) => (
                <option value={person.id} key={person.id}>
                  {fullName(person)}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label={w('Сортировка проектов', 'Sort projects')}
            className={projectControl + ' md:w-auto'}
            value={sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
          >
            <option value="updated">{w('По обновлению', 'Recently updated')}</option>
            <option value="deadline">{w('По ближайшему сроку', 'Soonest deadline')}</option>
            <option value="priority">{w('По приоритету', 'Highest priority')}</option>
            <option value="budget">{w('По бюджету', 'Highest budget')}</option>
            <option value="name">{w('По названию', 'By name')}</option>
          </select>
          {(hasFilters || q || sort !== 'updated') && (
            <Button variant="ghost" className="h-10" onClick={clear}>
              {w('Сбросить', 'Clear filters')}
            </Button>
          )}
        </div>
      </div>
      {clients.error && (
        <div className="mb-4">
          <RequestError error={clients.error} retry={clients.reload} />
        </div>
      )}
      {people.error && (
        <div className="mb-4">
          <RequestError error={people.error} retry={people.reload} />
        </div>
      )}
      {writeError && (
        <PageFeedback state="error" className="mb-4">
          {writeError}
        </PageFeedback>
      )}
      {notice && (
        <PageFeedback state="success" className="mb-4">
          {notice}
        </PageFeedback>
      )}
      {projects.error ? (
        <RequestError error={projects.error} retry={projects.reload} />
      ) : !projects.data ? (
        <PageFeedback state="loading">{w('Загружаем проекты…', 'Loading projects…')}</PageFeedback>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-2" aria-live="polite">
            {w('Найдено проектов', 'Projects found')}{' '}
            <span className="font-medium text-ink tabular-nums">{total}</span>
          </p>
          {empty ? (
            <PageFeedback state="empty">
              {hasFilters
                ? w('Проекты по этим фильтрам не найдены.', 'No projects match these filters.')
                : w('В этом рабочем пространстве пока нет проектов.', 'This workspace has no projects yet.')}
              {hasFilters && (
                <Button className="mt-2 block" size="sm" variant="outline" onClick={clear}>
                  {w('Сбросить фильтры', 'Clear filters')}
                </Button>
              )}
            </PageFeedback>
          ) : table ? (
            <ProjectTable
              data={table}
              link={openProject}
              onPage={(target) => setFilters({ page: target === 1 ? '' : String(target) })}
            />
          ) : (
            <div
              className={cn('grid items-start gap-3', status ? 'max-w-md' : 'sm:grid-cols-2 xl:grid-cols-5')}
            >
              {columns?.map((column) => (
                <section
                  className="min-w-0 rounded-xl border border-line bg-shell/70 p-3"
                  key={column.status}
                >
                  <h3 className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold">
                    {labels.status(column.status)}
                    <span className="rounded-md bg-cell px-2 py-0.5 text-xs text-ink-2 tabular-nums">
                      {column.total}
                    </span>
                  </h3>
                  <div className="grid gap-2">
                    {column.items.map((item) => (
                      <ProjectCard key={item.id} item={item} link={openProject(item.id)}>
                        {canWrite && (
                          <select
                            id={`project-status-${item.id}`}
                            className={cn(projectControl, 'mt-3 min-h-8 py-1 text-xs')}
                            aria-label={w(`Статус проекта ${item.name}`, `Status for ${item.name}`)}
                            value={item.status}
                            disabled={writing || projects.loading}
                            onChange={(e) =>
                              void changeStatus(item, e.target.value as Project['status'], e.currentTarget)
                            }
                          >
                            <Options values={projectStatuses} />
                          </select>
                        )}
                      </ProjectCard>
                    ))}
                    {!column.total && (
                      <p className="rounded-lg border border-dashed border-line p-3 text-xs text-ink-2">
                        {w('Нет проектов', 'No projects')}
                      </p>
                    )}
                    {column.items.length < column.total && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ view: '', status: column.status })}
                      >
                        {w(`Смотреть все (${column.total})`, `View all (${column.total})`)}
                      </Button>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
      {createOpen && clients.data && (
        <ProjectForm
          clients={clients.data}
          initialClient={clientId}
          onClose={() => setFilters({ create: '' }, true)}
          onSave={(item) => {
            window.dispatchEvent(new Event('crm:changed'))
            navigate(`/projects/${item.id}`, { replace: true, state: { returnTo } })
          }}
        />
      )}
    </PageContent>
  )
}

type ProjectLink = { to: string; state: { returnTo: string } }

function ProjectCard({
  item,
  link,
  children,
}: {
  item: ProjectListItem
  link: ProjectLink
  children?: React.ReactNode
}) {
  const labels = useProjectLabels()
  return (
    <article className="workspace-surface workspace-interactive min-w-0 rounded-xl border border-line bg-surface p-3">
      <Link
        {...link}
        className="flex items-start justify-between gap-2 font-semibold [overflow-wrap:anywhere] hover:text-brand-strong"
      >
        {item.name}
        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden="true" />
      </Link>
      <p className="mt-1 text-xs text-ink-2 [overflow-wrap:anywhere]">{item.client.companyName}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge value={item.status} />
        <StatusBadge value={item.priority} />
      </div>
      <div className="mt-3 grid gap-2">
        <ProjectDeadline value={item.endDate} status={item.status} />
        {item.lead && <p className="text-xs text-ink-2 [overflow-wrap:anywhere]">{fullName(item.lead)}</p>}
        {item.budget !== null && (
          <p className="text-xs font-medium tabular-nums">{labels.money(item.budget)}</p>
        )}
        {item.taskProgress && <ProjectProgress progress={item.taskProgress} />}
      </div>
      {children}
    </article>
  )
}

function ProjectTable({
  data,
  link,
  onPage,
}: {
  data: ProjectsPageData
  link: (id: string) => ProjectLink
  onPage: (page: number) => void
}) {
  const labels = useProjectLabels()
  const { w } = labels
  const pages = Math.max(1, Math.ceil(data.total / data.limit))
  const headers = [
    w('Проект / клиент', 'Project / client'),
    w('Статус', 'Status'),
    w('Руководитель', 'Project lead'),
    w('Приоритет', 'Priority'),
    w('Срок', 'Deadline'),
    w('Бюджет', 'Budget'),
    w('Задачи', 'Tasks'),
  ]
  if (!data.items.length) {
    return (
      <PageFeedback state="empty">
        <p>{w('На этой странице нет проектов.', 'No projects on this page.')}</p>
        <Button variant="outline" className="mt-2" onClick={() => onPage(pages)}>
          {w('К последней странице', 'Go to last page')}
        </Button>
      </PageFeedback>
    )
  }
  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:hidden">
        {data.items.map((item) => (
          <ProjectCard key={item.id} item={item} link={link(item.id)} />
        ))}
      </div>
      <div className="workspace-surface hidden overflow-hidden rounded-xl border border-line bg-surface xl:block">
        <table
          className="workspace-table w-full table-fixed text-left text-sm"
          aria-label={w('Список проектов', 'Project list')}
        >
          <thead className="bg-shell">
            <tr>
              {headers.map((header, index) => (
                <th
                  scope="col"
                  key={header}
                  className={cn('px-3.5 py-3', index === 0 && 'w-[23%]', index === 4 && 'w-[15%]')}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="px-3.5 py-3 [overflow-wrap:anywhere]">
                  <Link {...link(item.id)} className="font-semibold hover:text-brand-strong hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-2">{item.client.companyName}</p>
                </td>
                <td className="px-3.5 py-3">
                  <StatusBadge value={item.status} />
                </td>
                <td className="px-3.5 py-3 text-xs [overflow-wrap:anywhere]">
                  {item.lead ? fullName(item.lead) : '—'}
                </td>
                <td className="px-3.5 py-3">
                  <StatusBadge value={item.priority} />
                </td>
                <td className="px-3.5 py-3">
                  <ProjectDeadline value={item.endDate} status={item.status} />
                </td>
                <td className="px-3.5 py-3 text-xs tabular-nums [overflow-wrap:anywhere]">
                  {labels.money(item.budget)}
                </td>
                <td className="px-3.5 py-3">
                  {item.taskProgress ? <ProjectProgress progress={item.taskProgress} /> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav
          className="mt-4 flex flex-wrap items-center gap-2 text-sm"
          aria-label={w('Страницы проектов', 'Project pages')}
        >
          <Button variant="outline" disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>
            {w('Назад', 'Previous')}
          </Button>
          <span className="px-2 text-ink-2">
            {data.page} / {pages}
          </span>
          <Button variant="outline" disabled={data.page >= pages} onClick={() => onPage(data.page + 1)}>
            {w('Далее', 'Next')}
          </Button>
        </nav>
      )}
    </>
  )
}
