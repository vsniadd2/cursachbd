import { cloneElement, useEffect, useId, useReducer, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { PageFeedback } from '@/components/app/PageFeedback'
import { Button } from '@/components/ui/button'
import { errorText, useWords } from '@/lib/product'
import type { Person, Project, ProjectRole, Task, TaskProgress } from '@/types/crm'

export const projectStatuses: Project['status'][] = [
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
]
export const taskStatuses: Task['status'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']
export const priorities: Project['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const projectRoles: ProjectRole[] = ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER']
export const projectControl =
  'min-h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink disabled:opacity-60'
export const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

export const fullName = (user: Person) => `${user.firstName} ${user.lastName}`.trim()
export const dateInput = (date: string | null) => date?.slice(0, 10) ?? ''
export const isOverdue = (date: string | null, status: string) =>
  Boolean(
    date &&
    !['COMPLETED', 'DONE', 'CANCELLED', 'PAID', 'DRAFT'].includes(status) &&
    dateInput(date) < new Date().toISOString().slice(0, 10),
  )

export function useProjectLabels() {
  const w = useWords()
  const { t, i18n } = useTranslation('components')
  const locale = i18n.language
  return {
    w,
    status: (value: string) => t(`status.${value}`, { defaultValue: value }),
    role: (role: ProjectRole) =>
      ({
        OWNER: w('Руководитель проекта', 'Project lead'),
        MANAGER: w('Менеджер проекта', 'Project manager'),
        MEMBER: w('Участник', 'Contributor'),
        VIEWER: w('Наблюдатель', 'Observer'),
      })[role],
    date: (date: string | null) =>
      date
        ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date))
        : '—',
    dateTime: (date: string) =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)),
    money: (amount: string | null, currency = 'USD') =>
      amount == null
        ? '—'
        : new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount)),
  }
}

type Result<T> = { data: T; error?: never } | { data?: never; error: string }

export function useProjectRequest<T>(load: ((signal: AbortSignal) => Promise<T>) | null) {
  const [version, reload] = useReducer((value: number) => value + 1, 0)
  const [result, setResult] = useState<(Result<T> & { load: typeof load; version: number }) | null>(null)
  useEffect(() => {
    if (!load) return
    const controller = new AbortController()
    void load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, version, data })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, version, error: errorText(error) })
      },
    )
    return () => controller.abort()
  }, [load, version])

  const current = result?.load === load ? result : null
  const loading = Boolean(load && current?.version !== version)
  return { data: current?.data, error: loading ? undefined : current?.error, loading, reload }
}

export function RequestError({ error, retry }: { error: string; retry: () => void }) {
  const w = useWords()
  return (
    <PageFeedback state="error">
      <p>{error}</p>
      <Button className="mt-2" size="sm" variant="outline" onClick={retry}>
        {w('Повторить', 'Retry')}
      </Button>
    </PageFeedback>
  )
}

export function Options({ values }: { values: readonly string[] }) {
  const { status } = useProjectLabels()
  return (
    <>
      {values.map((value) => (
        <option value={value} key={value}>
          {status(value)}
        </option>
      ))}
    </>
  )
}

export function Field({
  label,
  children,
  wide,
}: {
  label: string
  children: ReactElement<{ id?: string }>
  wide?: boolean
}) {
  const id = useId()
  return (
    <div className={`grid min-w-0 gap-1.5 text-sm font-medium ${wide ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  )
}

export function ProjectDeadline({ value, status }: { value: string | null; status: string }) {
  const labels = useProjectLabels()
  const late = isOverdue(value, status)
  return (
    <div
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm ${late ? 'text-danger-strong' : 'text-ink-2'}`}
    >
      {value && <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />}
      <span className="whitespace-nowrap">{labels.date(value)}</span>
      {late && <span className="text-xs font-semibold">{labels.w('Просрочено', 'Overdue')}</span>}
    </div>
  )
}

export function ProjectProgress({ progress }: { progress: TaskProgress }) {
  const w = useWords()
  if (!progress.total) return <span className="text-xs text-ink-2">{w('Нет задач', 'No tasks')}</span>
  const percent = Math.round((progress.done * 100) / progress.total)
  return (
    <div className="grid min-w-20 flex-1 gap-1.5">
      <div className="flex justify-between gap-2 text-xs tabular-nums text-ink-2">
        <span className="whitespace-nowrap">
          {progress.done} / {progress.total}
        </span>
        <span>{percent}%</span>
      </div>
      <progress
        className="h-1.5 w-full overflow-hidden rounded-full bg-cell accent-brand [&::-webkit-progress-bar]:bg-cell [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand"
        value={progress.done}
        max={progress.total}
        aria-label={w('Выполнено задач', 'Tasks completed')}
      />
    </div>
  )
}
