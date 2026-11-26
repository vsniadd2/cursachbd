import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useWords, errorText } from '@/lib/product'
import { Button } from '@/components/ui/button'
type Item = { id: string; title: string; body: string | null; readAt: string | null }
export function NotificationBell() {
  const w = useWords(),
    [open, setOpen] = useState(false),
    [items, setItems] = useState<Item[]>([]),
    [error, setError] = useState('')
  async function load() {
    try {
      const { data } = await apiClient.get('/notifications')
      setItems(data.data.items)
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial HTTP fetch; updates occur only after the asynchronous response.
    void load()
    const id = setInterval(() => void load(), 30000)
    return () => clearInterval(id)
  }, [])
  async function read(id: string) {
    try {
      await apiClient.patch(`/notifications/${id}/read`)
      await load()
    } catch (e) {
      setError(errorText(e))
    }
  }
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={w('Уведомления', 'Notifications')}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open)
          void load()
        }}
        className="relative grid size-[37px] place-items-center rounded-[9px] border border-line bg-surface"
      >
        <Bell className="size-[17px]" />
        {items.some((i) => !i.readAt) && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-brand" />
        )}
      </button>
      {open && (
        <section
          aria-label={w('Уведомления', 'Notifications')}
          className="absolute right-0 top-12 z-30 max-h-96 w-[min(320px,85vw)] overflow-y-auto rounded-xl border border-line bg-surface p-4 shadow-lg"
        >
          <div className="mb-3 flex justify-between">
            <h2>{w('Уведомления', 'Notifications')}</h2>
            <button aria-label={w('Закрыть', 'Close')} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
          {!items.length && <p className="text-sm text-ink-2">{w('Нет уведомлений', 'No notifications')}</p>}
          {items.map((i) => (
            <article key={i.id} className="border-t border-line py-3">
              <h3 className="text-sm">{i.title}</h3>
              <p className="my-2 text-xs text-ink-2">{i.body}</p>
              {!i.readAt && (
                <Button size="sm" variant="outline" onClick={() => void read(i.id)}>
                  {w('Прочитано', 'Mark read')}
                </Button>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
