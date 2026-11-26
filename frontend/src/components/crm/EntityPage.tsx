import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Download, Plus, RefreshCw, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { useWords, errorText, exportCsv } from '@/lib/product'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageFeedback } from '@/components/app/PageFeedback'
import { StatusBadge } from '@/components/app/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Row = Record<string, unknown> & { id: string }
type Field = {
  key: string
  ru: string
  en: string
  type?: string
  required?: boolean
  options?: string[]
  source?: string
}
const clients: Field[] = [
  { key: 'companyName', ru: 'Компания', en: 'Company', required: true },
  { key: 'contactName', ru: 'Контактное лицо', en: 'Contact' },
  { key: 'email', ru: 'Email', en: 'Email', type: 'email' },
  { key: 'phone', ru: 'Телефон', en: 'Phone' },
  { key: 'status', ru: 'Статус', en: 'Status', options: ['LEAD', 'ACTIVE', 'INACTIVE', 'CHURNED'] },
  { key: 'notes', ru: 'Заметки', en: 'Notes', type: 'textarea' },
]
const tasks: Field[] = [
  { key: 'title', ru: 'Задача', en: 'Task', required: true },
  { key: 'projectId', ru: 'Проект', en: 'Project', source: 'projects', required: true },
  { key: 'assigneeId', ru: 'Исполнитель', en: 'Assignee', source: 'users' },
  {
    key: 'status',
    ru: 'Статус',
    en: 'Status',
    options: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'],
  },
  { key: 'priority', ru: 'Приоритет', en: 'Priority', options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
  { key: 'dueDate', ru: 'Срок', en: 'Due date', type: 'date' },
  { key: 'description', ru: 'Описание', en: 'Description', type: 'textarea' },
]
const invoices: Field[] = [
  { key: 'invoiceNumber', ru: 'Номер счёта', en: 'Invoice number', required: true },
  { key: 'clientId', ru: 'Клиент', en: 'Client', source: 'clients', required: true },
  { key: 'projectId', ru: 'Проект', en: 'Project', source: 'projects' },
  { key: 'amount', ru: 'Сумма', en: 'Amount', type: 'number', required: true },
  { key: 'currency', ru: 'Валюта', en: 'Currency', options: ['USD', 'EUR', 'BYN'] },
  { key: 'status', ru: 'Статус', en: 'Status', options: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] },
  { key: 'dueDate', ru: 'Срок оплаты', en: 'Due date', type: 'date' },
  { key: 'notes', ru: 'Примечание', en: 'Notes', type: 'textarea' },
]
const configs = {
  leads: { endpoint: 'clients', ru: 'Лиды', en: 'Leads', fields: clients, status: 'LEAD' },
  customers: { endpoint: 'clients', ru: 'Клиенты', en: 'Customers', fields: clients, status: 'ACTIVE' },
  tasks: { endpoint: 'tasks', ru: 'Задачи', en: 'Tasks', fields: tasks, status: 'TODO' },
  revenue: {
    endpoint: 'invoices',
    ru: 'Счета и выручка',
    en: 'Invoices and revenue',
    fields: invoices,
    status: 'DRAFT',
  },
}
const control = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink'
function label(row: Row) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ')
  return String(row.companyName ?? row.name ?? (name || row.id || '—'))
}

const relationByField: Record<string, string> = {
  clientId: 'client',
  projectId: 'project',
  assigneeId: 'assignee',
}

export function EntityPage({ kind }: { kind: keyof typeof configs }) {
  const cfg = configs[kind],
    w = useWords(),
    { user } = useAuth()
  const canWrite = userCan(user, `${cfg.endpoint}:write`)
  const canRead = userCan(user, `${cfg.endpoint}:read`)
  const canReadProjects = userCan(user, 'projects:read')
  const [urlFilters] = useSearchParams()
  const projectFilter = (kind === 'tasks' || kind === 'revenue') ? urlFilters.get('projectId') : null
  const taskFilter = kind === 'tasks' ? urlFilters.get('taskId') : null
  const clientProjects = kind === 'customers' && canReadProjects
  const unavailableField = cfg.fields.find(
    (f) => f.required && f.source && !userCan(user, `${f.source}:read`),
  )
  const formElement = useRef<HTMLFormElement>(null)
  const [rows, setRows] = useState<Row[]>([]),
    [refs, setRefs] = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false)
  const [error, setError] = useState(''),
    [message, setMessage] = useState('')
  const [form, setForm] = useState<Record<string, string> | null>(null),
    [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState(kind === 'leads' || kind === 'customers' ? cfg.status : '')
  const [page, setPage] = useState(0),
    [deleting, setDeleting] = useState<string | null>(null)
  const formOpen = form !== null
  useLayoutEffect(() => {
    if (!formOpen) return
    formElement.current?.scrollIntoView({ block: 'nearest' })
    formElement.current?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true })
  }, [formOpen, editing])

  const load = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/${cfg.endpoint}`, { params: projectFilter ? { projectId: projectFilter } : undefined })
      setRows(data.data.items)
      const sources = [
        ...new Set(
          cfg.fields.flatMap((f) =>
            canWrite && f.source && userCan(user, `${f.source}:read`) ? [f.source] : [],
          ),
        ),
      ]
      const entries = await Promise.all(
        sources.map(async (s) => [s, (await apiClient.get(`/${s}`)).data.data.items] as const),
      )
      setRefs(Object.fromEntries(entries))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [canRead, canWrite, cfg, projectFilter, user])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial HTTP fetch; updates occur only after the asynchronous response.
    void load()
  }, [load])
  function open(row?: Row) {
    setEditing(row?.id ?? null)
    setError('')
    setMessage('')
    const initialProject = row ? undefined : refs.projects?.find((project) => project.id === projectFilter)
    setForm(
      Object.fromEntries(
        cfg.fields.map((f) => [
          f.key,
          row?.[f.key] == null
            ? f.key === 'status'
              ? cfg.status
              : f.key === 'projectId' && initialProject
                ? initialProject.id
              : f.key === 'clientId' && initialProject
                ? String(initialProject.clientId)
              : f.key === 'priority'
                ? 'MEDIUM'
                : (f.options?.[0] ?? '')
            : String(row[f.key]).slice(0, f.type === 'date' ? 10 : undefined),
        ]),
      ),
    )
  }
  async function save() {
    if (!form || busy) return
    setBusy(true)
    setError('')
    const payload: Record<string, unknown> = {}
    for (const f of cfg.fields) {
      if (f.source && !userCan(user, `${f.source}:read`)) continue
      const v = form[f.key]?.trim() ?? ''
      if (f.type === 'number') {
        if (v) payload[f.key] = Number(v)
      } else if (f.type === 'date') payload[f.key] = v ? new Date(`${v}T12:00:00.000Z`).toISOString() : null
      else if (f.source) {
        if (v) payload[f.key] = v
        else if (!f.required) payload[f.key] = null
      } else payload[f.key] = v
    }
    try {
      if (editing) await apiClient.patch(`/${cfg.endpoint}/${editing}`, payload)
      else await apiClient.post(`/${cfg.endpoint}`, payload)
      setForm(null)
      await load()
      setMessage(w('Сохранено', 'Saved'))
      window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!deleting || busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiClient.delete(`/${cfg.endpoint}/${deleting}`)
      setDeleting(null)
      await load()
      window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  const filtered = rows.filter(
    (r) =>
      (!taskFilter || r.id === taskFilter) &&
      (!status || r.status === status) &&
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
  )
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 10) - 1))
  if (!canRead) {
    return (
      <PageContent>
        <PageHeader title={w(cfg.ru, cfg.en)} />
        <PageFeedback state="empty">
          {w('У вашей роли нет доступа к этому разделу.', 'Your role cannot access this section.')}
        </PageFeedback>
      </PageContent>
    )
  }

  return (
    <PageContent>
      <PageHeader
        title={w(cfg.ru, cfg.en)}
        actions={
          canWrite && (
            <Button
              variant="brand"
              disabled={loading || busy || Boolean(unavailableField)}
              onClick={() => open()}
            >
              <Plus className="size-4" aria-hidden="true" />
              {w('Создать', 'Create')}
            </Button>
          )
        }
      />
      {canWrite && unavailableField && (
        <PageFeedback state="empty" className="mb-4">
          {w(
            `Для создания записи нужен доступ к полю «${unavailableField.ru}».`,
            `Creating a record requires access to the ${unavailableField.en} field.`,
          )}
        </PageFeedback>
      )}
      <div className="workspace-toolbar mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-0 grow sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2"
            aria-hidden="true"
          />
          <Input
            aria-label={w('Поиск', 'Search')}
            placeholder={w('Поиск…', 'Search…')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            className="w-full pl-9"
          />
        </div>
        <select
          aria-label={w('Фильтр статуса', 'Status filter')}
          className={control + ' max-w-48 grow sm:grow-0'}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(0)
          }}
        >
          <option value="">{w('Все статусы', 'All statuses')}</option>
          {cfg.fields
            .find((f) => f.key === 'status')
            ?.options?.map((s) => (
              <option key={s}>{s}</option>
            ))}
        </select>
        <Button
          variant="outline"
          disabled={loading || !filtered.length}
          onClick={() => exportCsv(`${kind}.csv`, filtered)}
        >
          <Download className="size-4" aria-hidden="true" />
          {w('Экспорт CSV', 'Export CSV')}
        </Button>
        <Button variant="outline" disabled={loading || busy} onClick={() => void load()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {w('Обновить', 'Refresh')}
        </Button>
      </div>
      {projectFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-2">{w('Показаны записи проекта', 'Showing records for one project')}</span>
          {canReadProjects && <Button asChild variant="outline" size="sm"><Link to={`/projects/${projectFilter}`}>{w('Открыть проект', 'Open project')}</Link></Button>}
          <Button asChild variant="ghost" size="sm"><Link to={kind === 'revenue' ? '/revenue' : '/tasks'}>{w('Показать все', 'Show all')}</Link></Button>
        </div>
      )}
      {error && (
        <PageFeedback state="error" className="mb-4">
          {error}
        </PageFeedback>
      )}
      {message && (
        <PageFeedback state="success" className="mb-4">
          {message}
        </PageFeedback>
      )}
      {deleting && (
        <div
          role="alertdialog"
          aria-label={w('Подтверждение удаления', 'Confirm deletion')}
          className="workspace-enter workspace-surface mb-4 rounded-xl border border-danger-line bg-danger-soft p-4"
        >
          <p className="mb-3">
            {w(
              'Удалить запись? Это действие нельзя отменить. Связанные данные защищены от удаления.',
              'Delete record? This cannot be undone. Linked records are protected.',
            )}
          </p>
          <Button disabled={busy} onClick={() => void remove()}>
            {w('Удалить навсегда', 'Delete permanently')}
          </Button>{' '}
          <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>
            {w('Отмена', 'Cancel')}
          </Button>
        </div>
      )}
      {form && (
        <form
          ref={formElement}
          className="workspace-enter workspace-surface mb-6 rounded-xl border border-line bg-surface p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <h2 className="mb-4 text-lg">
            {editing ? w('Редактирование', 'Edit record') : w('Новая запись', 'New record')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {cfg.fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-1 text-sm">
                {w(f.ru, f.en)}
                {f.required ? ' *' : ''}
                {f.source || f.options ? (
                  <select
                    aria-label={w(f.ru, f.en)}
                    className={control}
                    disabled={Boolean(f.source && !userCan(user, `${f.source}:read`))}
                    required={f.required}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [f.key]: e.target.value,
                        ...(kind === 'revenue' && f.key === 'clientId' ? { projectId: '' } : {}),
                      })
                    }
                  >
                    {f.source && <option value="">{w('Выберите…', 'Select…')}</option>}
                    {f.options?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                    {f.source &&
                      refs[f.source]
                        ?.filter(
                          (r) =>
                            !(kind === 'revenue' && f.key === 'projectId') || r.clientId === form.clientId,
                        )
                        .map((r) => (
                          <option value={r.id} key={r.id}>
                            {label(r)}
                          </option>
                        ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    aria-label={w(f.ru, f.en)}
                    className={control}
                    maxLength={2000}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    aria-label={w(f.ru, f.en)}
                    className={control}
                    type={f.type ?? 'text'}
                    required={f.required}
                    maxLength={f.type === 'email' ? 255 : f.key === 'phone' ? 50 : 200}
                    min={f.key === 'amount' ? '0.01' : '0'}
                    step="0.01"
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="brand" disabled={busy}>
              {busy ? w('Сохранение…', 'Saving…') : w('Сохранить', 'Save')}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setForm(null)}>
              {w('Отмена', 'Cancel')}
            </Button>
          </div>
        </form>
      )}
      {kind === 'revenue' && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {['USD', 'EUR', 'BYN'].map((currency) => (
            <div key={currency} className="workspace-surface rounded-xl border border-line bg-surface p-4">
              <p>{currency}</p>
              <p className="text-sm text-ink-2">
                {w('Оплачено', 'Paid')}:{' '}
                {rows
                  .filter((r) => r.currency === currency && r.status === 'PAID')
                  .reduce((s, r) => s + Number(r.amount), 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm">
                {w('К оплате', 'Outstanding')}:{' '}
                {rows
                  .filter((r) => r.currency === currency && ['SENT', 'OVERDUE'].includes(String(r.status)))
                  .reduce((s, r) => s + Number(r.amount), 0)
                  .toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {loading ? (
        <PageFeedback state="loading">{w('Загрузка…', 'Loading…')}</PageFeedback>
      ) : !filtered.length ? (
        !error && (
          <PageFeedback state="empty">
            {w(
              'Записей не найдено. Попробуйте изменить фильтры.',
              'No records found. Try changing the filters.',
            )}
          </PageFeedback>
        )
      ) : (
        <div
          className="workspace-surface overflow-x-auto rounded-xl border border-line bg-surface"
          tabIndex={0}
          role="region"
          aria-label={w(cfg.ru, cfg.en)}
        >
          <table className="workspace-table w-full text-left text-sm">
            <thead className="bg-shell">
              <tr>
                {cfg.fields
                  .filter((f) => f.type !== 'textarea')
                  .map((f) => (
                    <th className="p-3 font-medium" key={f.key}>
                      {w(f.ru, f.en)}
                    </th>
                  ))}
                {(canWrite || clientProjects) && <th className="p-3">{w('Действия', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(currentPage * 10, currentPage * 10 + 10).map((row) => (
                <tr className="border-t border-line" key={row.id}>
                  {cfg.fields
                    .filter((f) => f.type !== 'textarea')
                    .map((f) => (
                      <td className="max-w-xs break-words p-3" key={f.key}>
                        {f.key === 'status' || f.key === 'priority' ? (
                          <StatusBadge value={String(row[f.key])} />
                        ) : f.key === 'projectId' && row.projectId && row.project && canReadProjects ? (
                          <Link className="font-medium underline decoration-line underline-offset-2 hover:decoration-brand" to={`/projects/${row.projectId}`}>{label(row.project as Row)}</Link>
                        ) : f.source ? (
                          label(
                            refs[f.source]?.find((r) => r.id === row[f.key]) ??
                              (row[relationByField[f.key]] as Row | undefined) ?? { id: '—' },
                          )
                        ) : (
                          String(row[f.key] ?? '—').slice(0, f.type === 'date' ? 10 : undefined)
                        )}
                      </td>
                    ))}
                  {(canWrite || clientProjects) && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        {clientProjects && <Button asChild variant="outline" size="sm"><Link to={`/projects?clientId=${row.id}`}>{w('Проекты', 'Projects')}</Link></Button>}
                        {canWrite && <>
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => open(row)}>
                          {w('Изменить', 'Edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => {
                            setDeleting(row.id)
                            setError('')
                          }}
                        >
                          {w('Удалить', 'Delete')}
                        </Button>
                        </>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <Button
            variant="outline"
            aria-label={w('Предыдущая страница', 'Previous page')}
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            ←
          </Button>
          <span>
            {currentPage + 1} / {Math.max(1, Math.ceil(filtered.length / 10))} · {filtered.length}
          </span>
          <Button
            variant="outline"
            aria-label={w('Следующая страница', 'Next page')}
            disabled={(currentPage + 1) * 10 >= filtered.length}
            onClick={() => setPage(currentPage + 1)}
          >
            →
          </Button>
        </div>
      )}
    </PageContent>
  )
}
