import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WorkspaceDialog } from '@/components/app/WorkspaceDialog'
import { PageFeedback } from '@/components/app/PageFeedback'
import { Button } from '@/components/ui/button'
import { errorText, useWords } from '@/lib/product'
import { createProject, updateProject, type ProjectInput } from '@/services/projects.service'
import type { Client, ProjectDetails } from '@/types/crm'
import { dateInput, Field, Options, priorities, projectControl, projectStatuses } from './projectShared'

function normalize(values: ProjectInput): ProjectInput {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description?.trim() || null,
    budget: values.budget?.trim() ? Number(values.budget).toFixed(2) : null,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
  }
}

export function ProjectForm({
  project,
  clients,
  initialClient,
  onClose,
  onSave,
}: {
  project?: ProjectDetails
  clients?: Client[]
  initialClient?: string
  onClose: () => void
  onSave: (project: ProjectDetails) => void
}) {
  const w = useWords()
  const [initialValues] = useState<ProjectInput>(() => ({
    name: project?.name ?? '',
    clientId: project?.clientId ?? initialClient ?? '',
    description: project?.description ?? '',
    startDate: dateInput(project?.startDate ?? null),
    endDate: dateInput(project?.endDate ?? null),
    status: project?.status ?? 'PLANNING',
    priority: project?.priority ?? 'MEDIUM',
    budget: project?.budget ?? '',
  }))
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const title = project ? w('Редактировать проект', 'Edit project') : w('Новый проект', 'New project')
  const initial = project?.client
  const choices = clients ?? []
  const canSave = Boolean(project || choices.length)

  function set<K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !canSave) return
    const payload = normalize(values)
    if (!payload.name) {
      setError(w('Введите название проекта.', 'Enter a project name.'))
      return
    }
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(
        w(
          'Срок проекта должен быть не раньше даты начала.',
          'The deadline must be on or after the start date.',
        ),
      )
      return
    }
    setBusy(true)
    setError('')
    const original = normalize(initialValues)
    const changes = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => value !== original[key as keyof ProjectInput]),
    )
    try {
      const item = project ? await updateProject(project.id, changes) : await createProject(payload)
      onSave(item)
    } catch (e) {
      const message = errorText(e)
      setError(
        message === 'Client cannot be changed while the project has linked invoices'
          ? w(
              'У проекта есть счета. Клиента можно изменить после отвязки счетов.',
              'Unlink the project’s invoices before changing its client.',
            )
          : message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <WorkspaceDialog
      label={title}
      onClose={onClose}
      dismissible={!busy}
      className="m-auto max-h-dvh w-full max-w-xl rounded-2xl p-4 sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:p-6"
    >
      <form onSubmit={(event) => void submit(event)}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={w('Закрыть', 'Close')}
            disabled={busy}
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        {!canSave ? (
          <PageFeedback state="empty">
            <p>
              {w('Сначала добавьте компанию в список клиентов.', 'Add a company to the customer list first.')}
            </p>
            <Link className="mt-2 inline-block font-medium underline" to="/customers">
              {w('Открыть клиентов', 'Open customers')}
            </Link>
          </PageFeedback>
        ) : (
          <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field label={w('Название проекта', 'Project name')} wide>
              <input
                className={projectControl}
                value={values.name}
                maxLength={200}
                required
                autoFocus
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>
            <Field label={w('Клиент', 'Client')} wide>
              <select
                className={projectControl}
                required
                value={values.clientId}
                disabled={!clients}
                onChange={(e) => set('clientId', e.target.value)}
              >
                <option value="">{w('Выберите клиента', 'Select a client')}</option>
                {initial && !choices.some((client) => client.id === initial.id) && (
                  <option value={initial.id}>{initial.companyName}</option>
                )}
                {choices.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={w('Статус', 'Status')}>
              <select
                className={projectControl}
                value={values.status}
                onChange={(e) => set('status', e.target.value as ProjectInput['status'])}
              >
                <Options values={projectStatuses} />
              </select>
            </Field>
            <Field label={w('Приоритет', 'Priority')}>
              <select
                className={projectControl}
                value={values.priority}
                onChange={(e) => set('priority', e.target.value as ProjectInput['priority'])}
              >
                <Options values={priorities} />
              </select>
            </Field>
            <Field label={w('Дата начала', 'Start date')}>
              <input
                className={projectControl}
                type="date"
                value={values.startDate ?? ''}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </Field>
            <Field label={w('Срок проекта', 'Project deadline')}>
              <input
                className={projectControl}
                type="date"
                min={values.startDate || undefined}
                value={values.endDate ?? ''}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </Field>
            <Field label={w('Плановый бюджет (USD)', 'Planned budget (USD)')}>
              <input
                className={projectControl}
                type="number"
                min="0"
                max="999999999999.99"
                step="0.01"
                value={values.budget ?? ''}
                onChange={(e) => set('budget', e.target.value)}
              />
            </Field>
            <Field label={w('Описание', 'Description')} wide>
              <textarea
                className={projectControl}
                rows={3}
                maxLength={2000}
                value={values.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
          </fieldset>
        )}
        {error && (
          <PageFeedback state="error" className="mt-4">
            {error}
          </PageFeedback>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            {w('Отмена', 'Cancel')}
          </Button>
          {canSave && (
            <Button type="submit" variant="brand" disabled={busy}>
              {busy ? w('Сохранение…', 'Saving…') : w('Сохранить', 'Save')}
            </Button>
          )}
        </div>
      </form>
    </WorkspaceDialog>
  )
}
