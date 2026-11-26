import { useState, type FormEvent } from 'react'
import { Plus, UserRound, UserRoundMinus } from 'lucide-react'
import { PageFeedback } from '@/components/app/PageFeedback'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { errorText } from '@/lib/product'
import { removeProjectMember, saveProjectMember } from '@/services/projects.service'
import type { ProjectDetails, ProjectRole, TeamUser } from '@/types/crm'
import {
  Field,
  fullName,
  projectControl,
  projectRoles,
  RequestError,
  useProjectLabels,
} from './projectShared'

export function ProjectTeam({
  project,
  people,
  canWrite,
  error,
  retry,
  changed,
}: {
  project: ProjectDetails
  people?: TeamUser[]
  canWrite: boolean
  error?: string
  retry: () => void
  changed: () => void
}) {
  const labels = useProjectLabels()
  const { w } = labels
  const [selected, setSelected] = useState('')
  const [role, setRole] = useState<ProjectRole>('MEMBER')
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState('')
  const available = people?.filter((person) => !project.members.some((member) => member.userId === person.id))
  const owner = project.members.find((member) => member.role === 'OWNER')
  const roles = projectRoles.map((value) => (
    <option value={value} key={value}>
      {labels.role(value)}
    </option>
  ))

  async function change(userId: string, next: ProjectRole | null) {
    if (busy) return false
    setBusy(true)
    setWriteError('')
    try {
      if (next) await saveProjectMember(project.id, userId, next)
      else await removeProjectMember(project.id, userId)
      changed()
      return true
    } catch (e) {
      setWriteError(errorText(e))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selected && (await change(selected, role))) {
      setSelected('')
      setRole('MEMBER')
    }
  }

  return (
    <PageSection>
      <h3 className="mb-4 font-semibold">
        {w('Команда проекта', 'Project team')}{' '}
        <span className="ml-1 text-sm font-normal text-ink-2">{project.members.length}</span>
      </h3>
      {canWrite && error && (
        <div className="mb-4">
          <RequestError error={error} retry={retry} />
        </div>
      )}
      {writeError && (
        <PageFeedback state="error" className="mb-4">
          {writeError}
        </PageFeedback>
      )}
      {canWrite && Boolean(available?.length) && (
        <form
          className="mb-5 grid items-end gap-2 rounded-xl border border-line bg-shell/60 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          onSubmit={(event) => void add(event)}
        >
          <Field label={w('Сотрудник', 'Team member')}>
            <select
              className={projectControl}
              value={selected}
              required
              disabled={busy}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">{w('Выберите сотрудника', 'Select a team member')}</option>
              {available?.map((person) => (
                <option value={person.id} key={person.id}>
                  {fullName(person)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={w('Роль в проекте', 'Project role')}>
            <select
              className={projectControl}
              value={role}
              disabled={busy}
              onChange={(e) => setRole(e.target.value as ProjectRole)}
            >
              {roles}
            </select>
          </Field>
          <Button type="submit" variant="brand" disabled={!selected || busy}>
            <Plus className="size-4" aria-hidden="true" />
            {w('Добавить', 'Add')}
          </Button>
        </form>
      )}
      {canWrite && owner && (
        <p className="mb-4 text-xs text-ink-2">
          {w(
            'При назначении нового руководителя текущий руководитель станет менеджером проекта.',
            'Assigning a new lead changes the current lead’s role to project manager.',
          )}
        </p>
      )}
      {!project.members.length ? (
        <PageFeedback state="empty">
          {w('В проекте пока нет участников.', 'This project has no team members yet.')}
        </PageFeedback>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line px-3 sm:px-4">
          {project.members.map((member) => {
            const name = fullName(member.user)
            return (
              <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 [overflow-wrap:anywhere]">
                    <p className="text-sm font-medium">{name}</p>
                    {!member.user.isActive && (
                      <p className="text-xs text-ink-2">{w('Неактивный сотрудник', 'Inactive employee')}</p>
                    )}
                  </div>
                </div>
                {canWrite ? (
                  <div className="flex max-w-full items-center gap-1">
                    <select
                      className={projectControl}
                      value={member.role}
                      disabled={busy || !member.user.isActive}
                      aria-label={w(`Роль сотрудника ${name}`, `Role for ${name}`)}
                      onChange={(e) => void change(member.userId, e.target.value as ProjectRole)}
                    >
                      {roles}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      aria-label={w(`Убрать из проекта ${name}`, `Remove ${name} from project`)}
                      onClick={() => void change(member.userId, null)}
                    >
                      <UserRoundMinus className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-ink-2">{labels.role(member.role)}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </PageSection>
  )
}
