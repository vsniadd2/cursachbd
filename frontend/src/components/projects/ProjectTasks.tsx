import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ListTodo, Pencil, Plus } from 'lucide-react'
import { WorkspaceDialog } from '@/components/app/WorkspaceDialog'
import { PageFeedback } from '@/components/app/PageFeedback'
import { StatusBadge } from '@/components/app/StatusBadge'
import { Button } from '@/components/ui/button'
import { errorText } from '@/lib/product'
import { cn } from '@/lib/utils'
import { createTask, updateTask } from '@/services/tasks.service'
import type { ProjectDetails, Task, TeamUser } from '@/types/crm'
import {
  dateInput,
  Field,
  fullName,
  Options,
  priorities,
  projectControl,
  ProjectDeadline,
  taskStatuses,
  useProjectLabels,
} from './projectShared'

export function ProjectTasks({
  project,
  tasks,
  selectedTask,
  people,
  canWrite,
  refreshing,
  changed,
}: {
  project: ProjectDetails
  tasks: Task[]
  selectedTask: string | null
  people?: TeamUser[]
  canWrite: boolean
  refreshing: boolean
  changed: () => void
}) {
  const { w } = useProjectLabels()
  const [filter, setFilter] = useState('')
  const [editor, setEditor] = useState<Task | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selectedRow = useRef<HTMLLIElement>(null)
  const shown = filter ? tasks.filter((task) => task.status === filter) : tasks
  const selectedVisible = Boolean(selectedTask && shown.some((task) => task.id === selectedTask))
  useEffect(() => {
    if (!selectedVisible) return
    selectedRow.current?.focus({ preventScroll: true })
    selectedRow.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedTask, selectedVisible])

  async function changeStatus(task: Task, status: Task['status']) {
    if (busy || status === task.status) return
    setBusy(true)
    setError('')
    try {
      await updateTask(task.id, { status })
      changed()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <ListTodo className="size-4 text-brand-strong" aria-hidden="true" />
          {w('Задачи проекта', 'Project tasks')}{' '}
          <span className="text-sm font-normal text-ink-2">{tasks.length}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={cn(projectControl, 'w-auto max-w-full')}
            aria-label={w('Фильтр задач по статусу', 'Filter tasks by status')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">{w('Все статусы', 'All statuses')}</option>
            <Options values={taskStatuses} />
          </select>
          {canWrite && (
            <Button variant="brand" onClick={() => setEditor('new')}>
              <Plus className="size-4" aria-hidden="true" />
              {w('Новая задача', 'New task')}
            </Button>
          )}
        </div>
      </div>
      {error && (
        <PageFeedback state="error" className="mb-3">
          {error}
        </PageFeedback>
      )}
      {selectedTask && !refreshing && !tasks.some((task) => task.id === selectedTask) && (
        <PageFeedback state="empty" className="mb-3">
          {w(
            'Задача из уведомления больше недоступна в этом проекте.',
            'The task from the notification is no longer available in this project.',
          )}
        </PageFeedback>
      )}
      {!shown.length ? (
        <PageFeedback state="empty">
          {filter
            ? w('Задач с этим статусом нет.', 'No tasks have this status.')
            : w('В проекте пока нет задач.', 'This project has no tasks yet.')}
        </PageFeedback>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface px-3 sm:px-4">
          {shown.map((task) => (
            <li
              className={cn(
                'grid min-w-0 items-center gap-2 py-3 md:grid-cols-[minmax(0,1fr)_minmax(135px,auto)_minmax(140px,auto)] md:gap-4',
                task.id === selectedTask && 'rounded-lg bg-brand-soft px-2',
              )}
              key={task.id}
              id={`task-${task.id}`}
              ref={task.id === selectedTask ? selectedRow : undefined}
              tabIndex={task.id === selectedTask ? -1 : undefined}
            >
              <div className="min-w-0 [overflow-wrap:anywhere]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <StatusBadge value={task.priority} />
                </div>
                <p className="mt-1 text-xs text-ink-2">
                  {task.assignee ? fullName(task.assignee) : w('Без исполнителя', 'Unassigned')}
                </p>
                {task.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-2">{task.description}</p>
                )}
              </div>
              <ProjectDeadline value={task.dueDate} status={task.status} />
              {canWrite ? (
                <div className="flex items-center gap-1">
                  <select
                    className={projectControl + ' max-w-44'}
                    aria-label={w(`Статус задачи ${task.title}`, `Status for task ${task.title}`)}
                    value={task.status}
                    disabled={busy || refreshing}
                    onChange={(e) => void changeStatus(task, e.target.value as Task['status'])}
                  >
                    <Options values={taskStatuses} />
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy || refreshing}
                    aria-label={w(`Изменить задачу ${task.title}`, `Edit task ${task.title}`)}
                    onClick={() => setEditor(task)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <StatusBadge value={task.status} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {editor && (
        <TaskForm
          project={project}
          task={editor === 'new' ? undefined : editor}
          people={people}
          close={() => setEditor(null)}
          saved={() => {
            setEditor(null)
            changed()
          }}
        />
      )}
    </div>
  )
}

function TaskForm({
  project,
  task,
  people,
  close,
  saved,
}: {
  project: ProjectDetails
  task?: Task
  people?: TeamUser[]
  close: () => void
  saved: () => void
}) {
  const { w } = useProjectLabels()
  const [value, setValue] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'TODO',
    priority: task?.priority ?? 'MEDIUM',
    assigneeId: task?.assigneeId ?? '',
    dueDate: dateInput(task?.dueDate ?? null),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const title = task ? w('Редактировать задачу', 'Edit task') : w('Новая задача', 'New task')
  const memberIds = new Set(project.members.map((member) => member.userId))
  const members = people?.filter((person) => memberIds.has(person.id)) ?? []
  const others = people?.filter((person) => !memberIds.has(person.id)) ?? []
  const originalAssignee = task?.assignee

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!value.title.trim()) {
      setError(w('Введите название задачи.', 'Enter a task name.'))
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      ...value,
      title: value.title.trim(),
      description: value.description.trim(),
      assigneeId: value.assigneeId || null,
      dueDate: value.dueDate ? `${value.dueDate}T12:00:00.000Z` : null,
    }
    try {
      if (task) await updateTask(task.id, payload)
      else await createTask({ ...payload, projectId: project.id })
      saved()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <WorkspaceDialog
      label={title}
      onClose={close}
      dismissible={!busy}
      className="m-auto max-h-dvh w-full max-w-lg rounded-2xl p-4 sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:p-6"
    >
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      <form onSubmit={(event) => void save(event)}>
        <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <Field label={w('Название задачи', 'Task name')} wide>
            <input
              className={projectControl}
              autoFocus
              required
              maxLength={300}
              value={value.title}
              onChange={(e) => setValue({ ...value, title: e.target.value })}
            />
          </Field>
          <Field label={w('Статус', 'Status')}>
            <select
              className={projectControl}
              value={value.status}
              onChange={(e) => setValue({ ...value, status: e.target.value as Task['status'] })}
            >
              <Options values={taskStatuses} />
            </select>
          </Field>
          <Field label={w('Приоритет', 'Priority')}>
            <select
              className={projectControl}
              value={value.priority}
              onChange={(e) => setValue({ ...value, priority: e.target.value as Task['priority'] })}
            >
              <Options values={priorities} />
            </select>
          </Field>
          <Field label={w('Исполнитель', 'Assignee')}>
            <select
              className={projectControl}
              disabled={!people}
              value={value.assigneeId}
              onChange={(e) => setValue({ ...value, assigneeId: e.target.value })}
            >
              <option value="">{w('Без исполнителя', 'Unassigned')}</option>
              {originalAssignee && !people?.some((person) => person.id === originalAssignee.id) && (
                <option value={originalAssignee.id}>{fullName(originalAssignee)}</option>
              )}
              {members.length > 0 && (
                <optgroup label={w('Команда проекта', 'Project team')}>
                  {members.map((person) => (
                    <option value={person.id} key={person.id}>
                      {fullName(person)}
                    </option>
                  ))}
                </optgroup>
              )}
              {others.length > 0 && (
                <optgroup label={w('Сотрудники компании', 'Company staff')}>
                  {others.map((person) => (
                    <option value={person.id} key={person.id}>
                      {fullName(person)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </Field>
          <Field label={w('Срок', 'Due date')}>
            <input
              className={projectControl}
              type="date"
              value={value.dueDate}
              onChange={(e) => setValue({ ...value, dueDate: e.target.value })}
            />
          </Field>
          <Field label={w('Описание', 'Description')} wide>
            <textarea
              className={projectControl}
              maxLength={5000}
              rows={3}
              value={value.description}
              onChange={(e) => setValue({ ...value, description: e.target.value })}
            />
          </Field>
        </fieldset>
        {error && (
          <PageFeedback state="error" className="mt-4">
            {error}
          </PageFeedback>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={close}>
            {w('Отмена', 'Cancel')}
          </Button>
          <Button type="submit" variant="brand" disabled={busy}>
            {busy ? w('Сохранение…', 'Saving…') : w('Сохранить', 'Save')}
          </Button>
        </div>
      </form>
    </WorkspaceDialog>
  )
}
