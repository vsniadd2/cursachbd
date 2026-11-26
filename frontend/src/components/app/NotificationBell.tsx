import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, Bell, Check, ClipboardList, Volume2, VolumeX, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api/client'
import { useWords, errorText } from '@/lib/product'
import { cn } from '@/lib/utils'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { Button } from '@/components/ui/button'
import { PageFeedback } from '@/components/app/PageFeedback'
import type { ApiSuccess } from '@/types/api'

type Item = {
  id: string
  type: string
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
  task: { id: string; project: { id: string; name: string } } | null
}
type Inbox = { items: Item[]; unreadCount: number }

export function NotificationBell({ userId, canReadProjects }: { userId: string; canReadProjects: boolean }) {
  const w = useWords()
  const { i18n } = useTranslation()
  const formatTime = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' })
  const { enabled, available, toggle, play } = useNotificationSound(userId)
  const id = useId()
  const host = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const request = useRef<AbortController | null>(null)
  const previousIds = useRef<Set<string> | null>(null)
  const [open, setOpen] = useState(false)
  const [inbox, setInbox] = useState<Inbox | null>(null)
  const [error, setError] = useState('')
  const [reading, setReading] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    if (request.current && !force) return
    if (force) request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    try {
      const { data } = await apiClient.get<ApiSuccess<Inbox>>('/notifications', {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      const { items } = data.data
      const known = previousIds.current
      previousIds.current = new Set(items.map((item) => item.id))
      if (
        known &&
        items.some((item) => item.type === 'TASK_ASSIGNED' && !item.readAt && !known.has(item.id))
      ) {
        play()
      }
      setInbox(data.data)
      setError('')
    } catch (e) {
      if (!controller.signal.aborted) setError(errorText(e))
    } finally {
      if (request.current === controller) request.current = null
    }
  }, [play])

  useEffect(() => {
    const refreshVisible = () => {
      if (!document.hidden) void load()
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read inbox from the API on mount.
    void load()
    const timer = window.setInterval(refreshVisible, 5000)
    window.addEventListener('crm:changed', refreshVisible)
    window.addEventListener('focus', refreshVisible)
    document.addEventListener('visibilitychange', refreshVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('crm:changed', refreshVisible)
      window.removeEventListener('focus', refreshVisible)
      document.removeEventListener('visibilitychange', refreshVisible)
      request.current?.abort()
      request.current = null
    }
  }, [load])

  function close() {
    setOpen(false)
    trigger.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !host.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !event.defaultPrevented) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function markRead(itemId?: string) {
    if (reading) return
    setReading(itemId ?? 'all')
    try {
      await apiClient.patch(itemId ? `/notifications/${itemId}/read` : '/notifications/read-all')
      await load(true)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setReading(null)
    }
  }

  const unread = inbox?.unreadCount ?? 0
  const SoundIcon = enabled ? Volume2 : VolumeX
  const soundLabel = enabled ? w('Выключить звук', 'Mute notifications') : w('Включить звук', 'Enable sound')
  return (
    <div ref={host} className="sm:relative">
      <button
        ref={trigger}
        type="button"
        aria-label={w('Уведомления', 'Notifications')}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-describedby={`${id}-unread`}
        onClick={() => {
          setOpen(!open)
          if (!open) void load()
        }}
        className={cn(
          'workspace-interactive relative grid size-[37px] place-items-center rounded-[9px] border border-line bg-surface',
          unread > 0 && 'text-brand-strong',
        )}
      >
        <Bell className="size-[17px]" aria-hidden="true" />
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-brand px-1 text-[9px] leading-tight font-semibold text-white ring-2 ring-surface"
            aria-hidden="true"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      <span className="sr-only" id={`${id}-unread`} aria-live="polite">
        {w(`Непрочитанных уведомлений: ${unread}`, `Unread notifications: ${unread}`)}
      </span>
      {open && (
        <section
          id={id}
          aria-label={w('Уведомления', 'Notifications')}
          className="workspace-enter absolute right-4 top-full z-30 mt-2 max-h-[min(30rem,65dvh)] w-[min(360px,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-4 shadow-xl sm:right-0"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">{w('Уведомления', 'Notifications')}</h2>
            <div className="flex items-center gap-1">
              {available && (
                <button
                  type="button"
                  className={cn(
                    'grid size-8 place-items-center rounded-lg hover:bg-shell',
                    enabled && 'bg-brand-soft text-brand-strong',
                  )}
                  aria-label={soundLabel}
                  title={soundLabel}
                  onClick={toggle}
                >
                  <SoundIcon className="size-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="grid size-8 place-items-center rounded-lg hover:bg-shell"
                aria-label={w('Закрыть', 'Close')}
                onClick={close}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
            {unread > 0 ? (
              <span>{w(`Непрочитанных · ${unread}`, `Unread · ${unread}`)}</span>
            ) : (
              <span>{enabled ? w('Звук включён', 'Sound on') : w('Звук выключен', 'Sound off')}</span>
            )}
            {unread > 0 && (
              <Button size="sm" variant="ghost" disabled={reading !== null} onClick={() => void markRead()}>
                {w('Прочитать все', 'Mark all read')}
              </Button>
            )}
          </div>
          {!inbox && !error && <PageFeedback state="loading">{w('Загрузка…', 'Loading…')}</PageFeedback>}
          {error && (
            <PageFeedback state="error" className="mb-3">
              <p>{error}</p>
              <Button className="mt-2" size="sm" variant="outline" onClick={() => void load()}>
                {w('Повторить', 'Retry')}
              </Button>
            </PageFeedback>
          )}
          {inbox && !inbox.items.length && !error && (
            <PageFeedback state="empty">{w('Нет уведомлений', 'No notifications')}</PageFeedback>
          )}
          {inbox?.items.map((item) => {
            const assignment = item.type === 'TASK_ASSIGNED'
            const project = item.task?.project
            const to =
              item.task && project
                ? canReadProjects
                  ? `/projects/${project.id}?tab=tasks&taskId=${item.task.id}`
                  : `/tasks?projectId=${project.id}&taskId=${item.task.id}`
                : null
            return (
              <article
                key={item.id}
                className={cn(
                  'mb-2 rounded-xl border border-line p-3 last:mb-0 [overflow-wrap:anywhere]',
                  !item.readAt && 'border-brand/25 bg-brand-soft/55',
                )}
              >
                <div className="flex items-start gap-2.5">
                  {assignment && (
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                      <ClipboardList className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      {assignment ? w('Вам назначена задача', 'A task was assigned to you') : item.title}
                      {!item.readAt && (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                      )}
                    </h3>
                    {item.body && <p className="mt-1 text-sm text-ink">{item.body}</p>}
                    {project && <p className="mt-1 text-xs text-ink-2">{project.name}</p>}
                    <time dateTime={item.createdAt} className="mt-1.5 block text-xs text-ink-2">
                      {formatTime.format(new Date(item.createdAt))}
                    </time>
                    {(to || !item.readAt) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {to && (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              to={to}
                              onClick={() => {
                                setOpen(false)
                                if (!item.readAt) void markRead(item.id)
                              }}
                            >
                              {w('Открыть задачу', 'Open task')}
                              <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            </Link>
                          </Button>
                        )}
                        {!item.readAt && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={reading !== null}
                            onClick={() => void markRead(item.id)}
                          >
                            <Check className="size-3.5" aria-hidden="true" />
                            {w('Прочитано', 'Mark read')}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
