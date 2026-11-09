import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { StatusBadge } from '@/components/app/StatusBadge'
import { fetchProjects, updateProject } from '@/services/projects.service'
import type { Project } from '@/types/crm'

const COLUMNS: Project['status'][] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']

export function PipelinePage() {
  const { t } = useTranslation('pages')
  const { t: ts } = useTranslation('components')
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    void fetchProjects().then(setProjects)
  }, [])

  async function advance(project: Project) {
    const idx = COLUMNS.indexOf(project.status)
    const next = COLUMNS[Math.min(idx + 1, COLUMNS.length - 1)]
    const updated = await updateProject(project.id, { status: next })
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  return (
    <PageContent>
      <PageHeader title={t('pipeline.title')} description={t('pipeline.description')} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                    <button
                      type="button"
                      onClick={() => void advance(p)}
                      className="w-full rounded-[10px] border border-line bg-surface p-3 text-left transition-colors hover:border-brand/40"
                    >
                      <p className="text-[12.5px] font-medium">{p.name}</p>
                      <p className="mt-1 text-[11px] text-ink-2">{p.client?.companyName}</p>
                      <div className="mt-2">
                        <StatusBadge value={p.status} />
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
