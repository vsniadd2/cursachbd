import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Department, TeamUser } from '@/types/crm'
import { TeamOrgChartCanvas } from '@/components/team/TeamOrgChartCanvas'
import { TeamOrgPersonCard } from '@/components/team/TeamOrgPersonCard'
import { buildDeptMemberTree, type DeptWithMembers } from '@/components/team/teamOrgTree'

function DeptSubtree({ node }: { node: DeptWithMembers }) {
  const { t } = useTranslation('pages')

  return (
    <li className="team-org-dept-node flex flex-col items-center gap-3">
      <div className="rounded-[10px] border border-dashed border-line bg-shell/80 px-4 py-2 text-center">
        <p className="text-[12px] font-medium text-ink">{node.name}</p>
        <p className="text-[10px] text-ink-2">{t('team.memberCount', { count: node.members.length })}</p>
      </div>
      {node.members.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap justify-center gap-4 p-0">
          {node.members.map((u) => (
            <li key={u.id}>
              <TeamOrgPersonCard user={u} />
            </li>
          ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <ul className="team-org-children m-0 flex list-none flex-row flex-wrap justify-center gap-10 pt-4">
          {node.children.map((child) => (
            <DeptSubtree key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function TeamDepartmentOrgChart({
  departments,
  users,
  loading,
}: {
  departments: Department[]
  users: TeamUser[]
  loading?: boolean
}) {
  const { t } = useTranslation('pages')
  const roots = useMemo(() => buildDeptMemberTree(departments, users), [departments, users])

  if (loading) {
    return (
      <TeamOrgChartCanvas>
        <p className="text-center text-[12px] text-ink-2">{t('team.loading')}</p>
      </TeamOrgChartCanvas>
    )
  }

  if (!roots.length) {
    return (
      <TeamOrgChartCanvas>
        <p className="text-center text-[12px] text-ink-2">{t('team.noSubgroups')}</p>
      </TeamOrgChartCanvas>
    )
  }

  return (
    <TeamOrgChartCanvas>
      <ul className="team-org-tree m-0 flex list-none flex-row flex-wrap justify-center gap-12 p-0">
        {roots.map((root) => (
          <DeptSubtree key={root.id} node={root} />
        ))}
      </ul>
    </TeamOrgChartCanvas>
  )
}
