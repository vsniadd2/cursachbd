import type { TFunction } from 'i18next'
import type { TeamUser } from '@/types/crm'
import type { PersonNode } from '@/components/team/teamOrgTree'

/** Все сотрудники в подчинении (прямые и ниже по дереву), без самого узла */
export function countDescendants(node: PersonNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

export function findPersonNode(nodes: PersonNode[], id: string): PersonNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findPersonNode(n.children, id)
    if (found) return found
  }
  return null
}

/** Должность на оргчарте: иерархия через managerId, корень без менеджера → CEO */
export function getOrgPositionLabel(
  user: TeamUser,
  directReports: number,
  t: TFunction<'pages'>,
): string {
  if (!user.managerId) {
    if (user.role.name === 'ADMIN') return t('team.roleLabels.CEO')
    return t('team.roleLabels.HEAD')
  }
  if (directReports > 0) return t('team.roleLabels.TL')
  const roleKey = user.role.name as 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  return t(`team.roleLabels.${roleKey}`, { defaultValue: user.role.name })
}
