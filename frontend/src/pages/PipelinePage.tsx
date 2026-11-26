import { errorText } from '@/lib/product'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { StatusBadge } from '@/components/app/StatusBadge'
import { fetchProjects, updateProject } from '@/services/projects.service'
import type { Project } from '@/types/crm'

const COLUMNS: Project['status'][] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

export function PipelinePage() {
  const { t } = useTranslation('pages')
  const { t: ts } = useTranslation('components')
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    void fetchProjects()
      .then(setProjects)
      .catch((e) => setError(errorText(e)))
  }, [])

  async function advance(project: Project, status: Project['status']) {
    setBusy(true)
    setError('')
    try {
      const updated = await updateProject(project.id, { status })
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageContent>
      <PageHeader title={t('pipeline.title')} description={t('pipeline.description')} />
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((status) => (
          <PageSection key={status} className="min-h-[280px] bg-shell/40 p-4">
            <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-2">
              {ts(`status.${status}`)}
            </h3>
            <ul className="space-y-2">
              {projects
                .filter((p) => p.status === status)
                .map((p) => (
                  <li key={p.id}>
                    <div className="w-full rounded-[10px] border border-line bg-surface p-3 text-left transition-colors hover:border-brand/40">
                      <p className="text-[12.5px] font-medium">{p.name}</p>
                      <p className="mt-1 text-[11px] text-ink-2">{p.client?.companyName}</p>
                      <div className="mt-2">
                        <StatusBadge value={p.status} />
                      </div>
                      <select
                        aria-label={p.name}
                        className="mt-3 w-full rounded border border-line bg-surface p-2 text-xs"
                        value={p.status}
                        disabled={busy || !userCan(user, 'projects:write')}
                        onChange={(e) => void advance(p, e.target.value as Project['status'])}
                      >
                        {COLUMNS.map((s) => (
                          <option key={s} value={s}>
                            {ts(`status.${s}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
            </ul>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
