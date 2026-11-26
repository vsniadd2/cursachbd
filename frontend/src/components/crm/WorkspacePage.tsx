import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { apiClient } from '@/lib/api/client'
import { useWords, errorText, exportCsv } from '@/lib/product'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'

type Item = { id: string; title: string; body: string; status: string; runs: number; createdAt: string }
const style = 'w-full rounded-lg border border-line bg-surface p-3 text-sm'
export function WorkspacePage({ kind }: { kind: 'CAMPAIGN' | 'EMAIL' | 'AUTOMATION' | 'FEEDBACK' }) {
  const w = useWords(),
    { user } = useAuth()
  const canWrite = kind === 'FEEDBACK' || userCan(user, 'projects:write')
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
      setMessage(w('Сохранено в базе', 'Saved to database'))
      await load()
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
    setBusy(true)
    try {
      await apiClient.delete(`/workspace/${deleting}`)
      setDeleting(null)
      await load()
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
          <Button variant="outline" disabled={!items.length} onClick={() => exportCsv(`${kind}.csv`, items)}>
            {w('Экспорт CSV', 'Export CSV')}
          </Button>
        }
      />
      {error && (
        <p role="alert" className="mb-3 text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-3 text-pos">
          {message}
        </p>
      )}
      {canWrite && (
        <form
          className="mb-6 grid max-w-2xl gap-3 rounded-xl border border-line bg-surface p-5"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <label className="text-sm">
            {kind === 'EMAIL' ? w('Тема письма', 'Subject') : w('Название', 'Title')}
            <input
              className={style}
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="text-sm">
            {w('Содержание', 'Content')}
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
              {w('Статус', 'Status')}
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
              {editing ? w('Сохранить изменения', 'Save changes') : w('Создать', 'Create')}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
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
          className="mb-4 rounded-xl border border-line p-4"
        >
          <p>{w('Удалить запись навсегда?', 'Delete this record permanently?')}</p>
          <Button disabled={busy} onClick={() => void remove()}>
            {w('Удалить навсегда', 'Delete permanently')}
          </Button>{' '}
          <Button variant="outline" onClick={() => setDeleting(null)}>
            {w('Отмена', 'Cancel')}
          </Button>
        </div>
      )}
      {loading ? (
        <p>{w('Загрузка…', 'Loading…')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex justify-between gap-3">
                <h3 className="font-medium">{item.title}</h3>
                <span className="text-xs text-ink-2">{item.status}</span>
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
                    onClick={() => {
                      setEditing(item.id)
                      setTitle(item.title)
                      setBody(item.body)
                      setStatus(item.status)
                      window.scrollTo(0, 0)
                    }}
                  >
                    {w('Изменить', 'Edit')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleting(item.id)}>
                    {w('Удалить', 'Delete')}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {!loading && !items.length && (
        <p>{w('Здесь пока пусто. Создайте первую запись.', 'No records yet. Create the first one.')}</p>
      )}
    </PageContent>
  )
}
