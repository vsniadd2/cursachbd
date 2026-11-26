import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { apiClient } from '@/lib/api/client'
import { useWords, errorText, exportCsv } from '@/lib/product'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageFeedback } from '@/components/app/PageFeedback'
import { StatusBadge } from '@/components/app/StatusBadge'
import { Button } from '@/components/ui/button'

type Item = { id: string; title: string; body: string; status: string; runs: number; createdAt: string }
const style = 'w-full rounded-lg border border-line bg-surface p-3 text-sm'
export function WorkspacePage({ kind }: { kind: 'CAMPAIGN' | 'EMAIL' | 'AUTOMATION' | 'FEEDBACK' }) {
  const w = useWords(),
    { user } = useAuth()
  const canWrite = kind === 'FEEDBACK' || userCan(user, 'projects:write')
  const form = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState<Item[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [title, setTitle] = useState(''),
    [body, setBody] = useState(''),
    [status, setStatus] = useState('DRAFT'),
    [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get('/workspace', { params: { kind } })
      setItems(data.data.items)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [kind])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial HTTP fetch; updates occur only after the asynchronous response.
    void load()
  }, [load])
  async function save() {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (editing) await apiClient.patch(`/workspace/${editing}`, { title, body, status })
      else await apiClient.post('/workspace', { kind, title, body, status })
      setEditing(null)
      setTitle('')
      setBody('')
      setStatus('DRAFT')
      await load()
      setMessage(w('Сохранено в базе', 'Saved to database'))
      if (kind === 'EMAIL') window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  const titles = {
    CAMPAIGN: w('Кампании', 'Campaigns'),
    EMAIL: w('Черновики писем', 'Email drafts'),
    AUTOMATION: w('Автоматизация', 'Automation'),
    FEEDBACK: w('Обратная связь', 'Feedback'),
  }
  const [deleting, setDeleting] = useState<string | null>(null)
  async function remove() {
    if (!deleting || busy) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      await apiClient.delete(`/workspace/${deleting}`)
      setDeleting(null)
      await load()
      if (kind === 'EMAIL') window.dispatchEvent(new Event('crm:changed'))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <PageContent>
      <PageHeader
        title={titles[kind]}
        description={
          kind === 'EMAIL'
            ? w(
                'Сохраняйте темы и тексты. Отправка через почтового провайдера не подключена.',
                'Save subjects and content. Mail delivery is not connected.',
              )
            : kind === 'AUTOMATION'
              ? w(
                  'Активное правило создаёт уведомление его автору при каждой новой задаче.',
                  'An active rule notifies its author whenever a task is created.',
                )
              : w('История сохраняется после перезагрузки.', 'History persists after reload.')
        }
        actions={
          <>
            <Button
              variant="outline"
              disabled={loading || !items.length}
              onClick={() => exportCsv(`${kind}.csv`, items)}
            >
              <Download className="size-4" aria-hidden="true" />
              {w('Экспорт CSV', 'Export CSV')}
            </Button>
            <Button variant="outline" disabled={loading || busy} onClick={() => void load()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {w('Обновить', 'Refresh')}
            </Button>
          </>
        }
      />
      {error && (
        <PageFeedback state="error" className="mb-3">
          {error}
        </PageFeedback>
      )}
      {message && (
        <PageFeedback state="success" className="mb-3">
          {message}
        </PageFeedback>
      )}
      {canWrite && (
        <form
          ref={form}
          className="workspace-surface mb-6 grid max-w-2xl gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">
              {kind === 'EMAIL' ? w('Тема письма', 'Subject') : w('Название', 'Title')}
            </span>
            <input
              className={style}
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">{w('Содержание', 'Content')}</span>
            <textarea
              className={style}
              rows={4}
              maxLength={10000}
              required={kind === 'FEEDBACK' || kind === 'EMAIL'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          {kind !== 'FEEDBACK' && (
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">{w('Статус', 'Status')}</span>
              <select className={style} value={status} onChange={(e) => setStatus(e.target.value)}>
                {(kind === 'EMAIL' ? ['DRAFT', 'COMPLETED'] : ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </label>
          )}
          <div className="flex gap-2">
            <Button variant="brand" disabled={busy}>
              {busy
                ? w('Сохранение…', 'Saving…')
                : editing
                  ? w('Сохранить изменения', 'Save changes')
                  : w('Создать', 'Create')}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setEditing(null)
                  setTitle('')
                  setBody('')
                  setStatus('DRAFT')
                }}
              >
                {w('Отмена', 'Cancel')}
              </Button>
            )}
          </div>
        </form>
      )}
      {deleting && (
        <div
          role="alertdialog"
          aria-label={w('Подтверждение удаления', 'Confirm deletion')}
          className="workspace-enter mb-4 rounded-xl border border-danger-line bg-danger-soft p-4"
        >
          <p className="mb-3">{w('Удалить запись навсегда?', 'Delete this record permanently?')}</p>
          <Button disabled={busy} onClick={() => void remove()}>
            {w('Удалить навсегда', 'Delete permanently')}
          </Button>{' '}
          <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>
            {w('Отмена', 'Cancel')}
          </Button>
        </div>
      )}
      {loading && !message ? (
        <PageFeedback state="loading">{w('Загрузка…', 'Loading…')}</PageFeedback>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="workspace-surface workspace-interactive min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="min-w-0 font-medium [overflow-wrap:anywhere]">{item.title}</h3>
                <StatusBadge value={item.status} />
              </div>
              <p className="my-3 whitespace-pre-wrap break-words text-sm text-ink-2">{item.body}</p>
              <p className="text-xs text-ink-2">
                {new Date(item.createdAt).toLocaleString()}
                {kind === 'AUTOMATION' && ` · ${w('Запусков', 'Runs')}: ${item.runs}`}
              </p>
              {canWrite && kind !== 'FEEDBACK' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setEditing(item.id)
                      setTitle(item.title)
                      setBody(item.body)
                      setStatus(item.status)
                      setError('')
                      setMessage('')
                      form.current?.scrollIntoView({ block: 'nearest' })
                      form.current?.querySelector('input')?.focus({ preventScroll: true })
                    }}
                  >
                    {w('Изменить', 'Edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setDeleting(item.id)
                      setMessage('')
                      setError('')
                    }}
                  >
                    {w('Удалить', 'Delete')}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {!loading && !error && !items.length && (
        <PageFeedback state="empty">
          {canWrite
            ? w('Здесь пока пусто. Создайте первую запись.', 'No records yet. Create the first one.')
            : w('Записей пока нет.', 'No records yet.')}
        </PageFeedback>
      )}
    </PageContent>
  )
}
