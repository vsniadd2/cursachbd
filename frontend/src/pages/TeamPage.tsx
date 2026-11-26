import { errorText, useWords } from '@/lib/product'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Filter, UserPlus } from 'lucide-react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageFeedback } from '@/components/app/PageFeedback'
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
  const w = useWords()
  const { user } = useAuth()
  const canRead = userCan(user, 'users:read')
  const canWrite = userCan(user, 'users:write', '*')
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: TeamTab = isTeamTab(raw) ? raw : 'people'

  const [error, setError] = useState('')
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

  const loadTeam = useCallback(async () => {
    if (!canRead) return
    setError('')
    setLoading(true)
    try {
      await reload('')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [canRead, reload])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load current team data on entry.
    void loadTeam()
  }, [loadTeam])

  function setTab(next: TeamTab) {
    setParams({ tab: next }, { replace: true })
  }

  if (!canRead) {
    return (
      <PageContent>
        <PageHeader title={t('team.title')} />
        <PageFeedback state="empty">
          {w('У вашей роли нет доступа к списку команды.', 'Your role cannot access the team roster.')}
        </PageFeedback>
      </PageContent>
    )
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
              disabled={loading || Boolean(error)}
            >
              <UserPlus className="size-4" strokeWidth={1.6} />
              {t('team.addCta')}
            </Button>
          ) : undefined
        }
      />

      {error && (
        <PageFeedback state="error" className="mb-4">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => void loadTeam()}>
            {w('Повторить', 'Retry')}
          </Button>
        </PageFeedback>
      )}

      <nav className="workspace-toolbar mb-4 flex flex-wrap gap-2" aria-label={t('team.tabsAria')}>
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
              tab === key
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-surface text-ink-2 hover:text-ink',
            )}
          >
            {t(`team.tabs.${key}`)}
          </button>
        ))}
      </nav>

      {!error && tab === 'people' && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowRoster(true)}
            className="h-9 gap-2 rounded-[10px] text-[12px] text-ink-2"
          >
            <Filter className="size-3.5" />
            {t('team.org.addFilter')}
          </Button>
        </div>
      )}

      {!error && tab === 'people' && (
        <div className="workspace-enter">
          <TeamPeopleOrgChart
            users={users}
            loading={loading}
            showRoster={showRoster}
            onShowRosterChange={setShowRoster}
          />
          {showRoster && (
            <TeamMemberList
              users={users}
              roles={roles}
              departments={departments}
              loading={loading}
              onReload={reload}
            />
          )}
        </div>
      )}
      {!error && tab === 'departments' && (
        <div className="workspace-enter">
          <TeamDepartmentOrgChart departments={departments} users={users} loading={loading} />
        </div>
      )}

      <TeamInviteLinkDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roles={roles}
        departments={departments}
      />
    </PageContent>
  )
}
