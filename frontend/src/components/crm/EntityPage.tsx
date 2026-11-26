import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { useWords, errorText, exportCsv } from '@/lib/product'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
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
const projects: Field[] = [
  { key: 'name', ru: 'Название сделки', en: 'Deal name', required: true },
  { key: 'clientId', ru: 'Клиент', en: 'Client', source: 'clients', required: true },
  { key: 'budget', ru: 'Бюджет (USD)', en: 'Budget (USD)', type: 'number' },
  {
    key: 'status',
    ru: 'Стадия',
    en: 'Stage',
    options: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
  },
  { key: 'priority', ru: 'Приоритет', en: 'Priority', options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
  { key: 'description', ru: 'Описание', en: 'Description', type: 'textarea' },
]
const tasks: Field[] = [
  { key: 'title', ru: 'Задача', en: 'Task', required: true },
  { key: 'projectId', ru: 'Сделка', en: 'Deal', source: 'projects', required: true },
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
  { key: 'projectId', ru: 'Сделка', en: 'Deal', source: 'projects' },
  { key: 'amount', ru: 'Сумма', en: 'Amount', type: 'number', required: true },
  { key: 'currency', ru: 'Валюта', en: 'Currency', options: ['USD', 'EUR', 'BYN'] },
  { key: 'status', ru: 'Статус', en: 'Status', options: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] },
  { key: 'dueDate', ru: 'Срок оплаты', en: 'Due date', type: 'date' },
  { key: 'notes', ru: 'Примечание', en: 'Notes', type: 'textarea' },
]
const configs = {
  leads: { endpoint: 'clients', ru: 'Лиды', en: 'Leads', fields: clients, status: 'LEAD' },
  customers: { endpoint: 'clients', ru: 'Клиенты', en: 'Customers', fields: clients, status: 'ACTIVE' },
  deals: { endpoint: 'projects', ru: 'Сделки', en: 'Deals', fields: projects, status: 'PLANNING' },
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
  return String(
    row.companyName ?? row.name ?? [row.firstName, row.lastName].filter(Boolean).join(' ') ?? row.id,
  )
}
export function EntityPage({ kind }: { kind: keyof typeof configs }) {
  const cfg = configs[kind],
    w = useWords(),
    { user } = useAuth()
  const canWrite = userCan(user, `${cfg.endpoint}:write`)
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
  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/${cfg.endpoint}`)
      setError('')
      setRows(data.data.items)
      const sources = [...new Set(cfg.fields.flatMap((f) => (f.source ? [f.source] : [])))]
      const entries = await Promise.all(
        sources.map(async (s) => [s, (await apiClient.get(`/${s}`)).data.data.items] as const),
      )
      setRefs(Object.fromEntries(entries))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [cfg])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial HTTP fetch; updates occur only after the asynchronous response.
    void load()
  }, [load])
  function open(row?: Row) {
    setEditing(row?.id ?? null)
    setError('')
    setMessage('')
    setForm(
      Object.fromEntries(
        cfg.fields.map((f) => [
          f.key,
          row?.[f.key] == null
            ? f.key === 'status'
              ? cfg.status
              : f.key === 'priority'
                ? 'MEDIUM'
                : (f.options?.[0] ?? '')
            : String(row[f.key]).slice(0, f.type === 'date' ? 10 : undefined),
        ]),
      ),
    )
  }
  async function save() {
    if (!form) return
    setBusy(true)
    setError('')
    const payload: Record<string, unknown> = {}
    for (const f of cfg.fields) {
      const v = form[f.key]?.trim() ?? ''
      if (f.type === 'number') {
        if (v) payload[f.key] = Number(v)
        else if (f.key === 'budget') payload[f.key] = null
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
      setMessage(w('Сохранено', 'Saved'))
      await load()
      window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    setError('')
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
    (r) => (!status || r.status === status) && JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
  )
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 10) - 1))
  return (
    <PageContent>
      <PageHeader
        title={w(cfg.ru, cfg.en)}
        description={w('Данные команды сохраняются в базе', 'Team data is saved in the database')}
        actions={
          canWrite && (
            <Button variant="brand" onClick={() => open()}>
              {w('Создать', 'Create')}
            </Button>
          )
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          aria-label={w('Поиск', 'Search')}
          placeholder={w('Поиск…', 'Search…')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          className="max-w-xs"
        />
        <select
          aria-label={w('Фильтр статуса', 'Status filter')}
          className={control + ' max-w-48'}
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
          disabled={!filtered.length}
          onClick={() => exportCsv(`${kind}.csv`, filtered)}
        >
          {w('Экспорт CSV', 'Export CSV')}
        </Button>
        <Button variant="outline" disabled={loading} onClick={() => void load()}>
          {w('Обновить', 'Refresh')}
        </Button>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {message && (
        <p role="status" className="mb-3 text-sm text-pos">
          {message}
        </p>
      )}
      {deleting && (
        <div
          role="alertdialog"
          aria-label={w('Подтверждение удаления', 'Confirm deletion')}
          className="mb-4 rounded-xl border border-line bg-surface p-4"
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
          className="mb-6 rounded-xl border border-line bg-surface p-5"
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
                    maxLength={f.key === 'description' ? 2000 : 2000}
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
            <div key={currency} className="rounded-xl border border-line bg-surface p-4">
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
        <p role="status">{w('Загрузка…', 'Loading…')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-shell">
              <tr>
                {cfg.fields
                  .filter((f) => f.type !== 'textarea')
                  .map((f) => (
                    <th className="p-3 font-medium" key={f.key}>
                      {w(f.ru, f.en)}
                    </th>
                  ))}
                {canWrite && <th className="p-3">{w('Действия', 'Actions')}</th>}
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
                        ) : f.source ? (
                          label(refs[f.source]?.find((r) => r.id === row[f.key]) ?? { id: '—', name: '—' })
                        ) : (
                          String(row[f.key] ?? '—').slice(0, f.type === 'date' ? 10 : undefined)
                        )}
                      </td>
                    ))}
                  {canWrite && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => open(row)}>
                          {w('Изменить', 'Edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleting(row.id)
                            setError('')
                          }}
                        >
                          {w('Удалить', 'Delete')}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="p-6 text-ink-2">
              {w(
                'Записей не найдено. Измените фильтр или создайте первую запись.',
                'No records found. Change the filter or create your first record.',
              )}
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center gap-3 text-sm">
        <Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
          ←
        </Button>
        <span>
          {currentPage + 1} / {Math.max(1, Math.ceil(filtered.length / 10))} · {filtered.length}
        </span>
        <Button
          variant="outline"
          disabled={(currentPage + 1) * 10 >= filtered.length}
          onClick={() => setPage(currentPage + 1)}
        >
          →
        </Button>
      </div>
    </PageContent>
  )
}
