import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Filter, UserPlus } from 'lucide-react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'
import { TeamPeopleOrgChart } from '@/components/team/TeamPeopleOrgChart'
import { TeamDepartmentOrgChart } from '@/components/team/TeamDepartmentOrgChart'
import { TeamMemberList } from '@/components/team/TeamMemberList'
import { TeamInviteLinkDialog } from '@/components/team/TeamInviteLinkDialog'
import { fetchUsers } from '@/services/users.service'
import { fetchDepartments } from '@/services/departments.service'
import { fetchRoles } from '@/services/roles.service'
import { detectSearchKind, userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import type { Department, RoleRow, TeamUser } from '@/types/crm'
import { cn } from '@/lib/utils'

const TABS = ['people', 'departments'] as const
type TeamTab = (typeof TABS)[number]

function isTeamTab(v: string | null): v is TeamTab {
  return TABS.includes(v as TeamTab)
}

export function TeamPage() {
  const { t } = useTranslation('pages')
  const { user } = useAuth()
  const canWrite = userCan(user, 'users:write', '*')
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: TeamTab = isTeamTab(raw) ? raw : 'people'

  const [users, setUsers] = useState<TeamUser[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [showRoster, setShowRoster] = useState(false)

  const reload = useCallback(async (search?: string) => {
    const q = (search ?? '').trim()
    const kind = q ? detectSearchKind(q) : undefined
    const userParams =
      q && (kind === 'email' || kind === 'publicCode') ? { query: q, kind } : q ? { query: q } : undefined
    const [u, d, r] = await Promise.all([fetchUsers(userParams), fetchDepartments(), fetchRoles()])
    setUsers(u)
    setDepartments(d)
    setRoles(r)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload('')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  function setTab(next: TeamTab) {
    setParams({ tab: next }, { replace: true })
  }

  return (
    <PageContent>
      <PageHeader
        title={t('team.title')}
        description={t('team.description')}
        actions={
          canWrite ? (
            <Button
              type="button"
              variant="brand"
              className="h-[38px] w-full gap-2 rounded-full px-5 text-[13px] sm:w-auto"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-4" strokeWidth={1.6} />
              {t('team.addCta')}
            </Button>
          ) : undefined
        }
      />

      <nav className="mb-3 flex gap-6 border-b border-line" aria-label={t('team.tabsAria')}>
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px border-b-2 px-1 pb-2.5 text-[14px] font-medium transition-colors',
              tab === key ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink',
            )}
          >
            {t(`team.tabs.${key}`)}
          </button>
        ))}
      </nav>

      {tab === 'people' && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" className="h-9 gap-2 rounded-[10px] text-[12px] text-ink-2">
            <Filter className="size-3.5" />
            {t('team.org.addFilter')}
          </Button>
        </div>
      )}

      {tab === 'people' && (
        <>
          <TeamPeopleOrgChart
            users={users}
            loading={loading}
            showRoster={showRoster}
            onShowRosterChange={setShowRoster}
          />
          {showRoster && (
            <TeamMemberList users={users} roles={roles} departments={departments} loading={loading} onReload={reload} />
          )}
        </>
      )}
      {tab === 'departments' && <TeamDepartmentOrgChart departments={departments} users={users} loading={loading} />}

      <TeamInviteLinkDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roles={roles}
        departments={departments}
      />
    </PageContent>
  )
}
