import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { TeamRoleGroupsTab } from '@/components/team/TeamRoleGroupsTab'
import { TeamSubgroupsTab } from '@/components/team/TeamSubgroupsTab'
import { TeamInvitesTab } from '@/components/team/TeamInvitesTab'
import { RolesCatalogTab } from '@/components/team/RolesCatalogTab'
import { cn } from '@/lib/utils'

const TABS = ['roles', 'groups', 'subgroups', 'invites'] as const
type RolesTab = (typeof TABS)[number]

function isRolesTab(v: string | null): v is RolesTab {
  return TABS.includes(v as RolesTab)
}

export function RolesPage() {
  const { t } = useTranslation('pages')
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: RolesTab = isRolesTab(raw) ? raw : 'roles'

  function setTab(next: RolesTab) {
    setParams({ tab: next }, { replace: true })
  }

  return (
    <PageContent>
      <PageHeader title={t('roles.title')} description={t('roles.description')} />
      <nav className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3" aria-label={t('roles.tabsAria')}>
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
              tab === key ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink-2 hover:text-ink',
            )}
          >
            {t(`roles.tabs.${key}`)}
          </button>
        ))}
      </nav>
      {tab === 'roles' && <RolesCatalogTab />}
      {tab === 'groups' && <TeamRoleGroupsTab />}
      {tab === 'subgroups' && <TeamSubgroupsTab />}
      {tab === 'invites' && <TeamInvitesTab />}
    </PageContent>
  )
}
