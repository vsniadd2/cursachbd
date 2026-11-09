import type { Department, TeamUser } from '@/types/crm'
import { buildDeptTree, type DeptNode } from '@/components/team/DeptTree'

export type PersonNode = TeamUser & { children: PersonNode[] }

export function buildPeopleTree(users: TeamUser[]): PersonNode[] {
  const byId = new Map<string, PersonNode>()
  for (const u of users) {
    byId.set(u.id, { ...u, children: [] })
  }
  const roots: PersonNode[] = []
  for (const u of users) {
    const node = byId.get(u.id)!
    if (u.managerId && byId.has(u.managerId)) {
      byId.get(u.managerId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortTree = (nodes: PersonNode[]) => {
    nodes.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
    nodes.forEach((n) => sortTree(n.children))
  }
  sortTree(roots)
  return roots
}

export type DeptWithMembers = DeptNode & { members: TeamUser[] }

export function buildDeptMemberTree(departments: Department[], users: TeamUser[]): DeptWithMembers[] {
  const roots = buildDeptTree(departments)
  const attach = (nodes: DeptNode[]): DeptWithMembers[] =>
    nodes.map((n) => ({
      ...n,
      members: users.filter((u) => u.departmentId === n.id),
      children: attach(n.children),
    }))
  return attach(roots)
}
