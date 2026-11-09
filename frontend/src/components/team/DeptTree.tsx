import { useTranslation } from 'react-i18next'
import type { Department } from '@/types/crm'

export type DeptNode = Department & { children: DeptNode[] }

export function buildDeptTree(items: Department[]): DeptNode[] {
  const map = new Map(items.map((d) => [d.id, { ...d, children: [] as DeptNode[] }]))
  const roots: DeptNode[] = []
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sort = (nodes: DeptNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)
  return roots
}

export function DeptTree({ nodes, depth = 0 }: { nodes: DeptNode[]; depth?: number }) {
  const { t } = useTranslation('pages')

  if (!nodes.length) {
    return <p className="text-[12px] text-ink-2">{t('team.noSubgroups')}</p>
  }
  return (
    <ul className={depth ? 'ml-4 border-l border-line pl-3' : 'space-y-2'}>
      {nodes.map((node) => (
        <li key={node.id} className="py-1">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[9px] border border-line bg-shell px-3 py-2">
            <span className="text-[13px] font-medium">{node.name}</span>
            <span className="text-[11px] text-ink-2 tabular">
              {t('team.memberCount', { count: node._count.users })}
              {node.parent ? t('team.insideParent', { name: node.parent.name }) : ''}
            </span>
          </div>
          {node.children.length > 0 && <DeptTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}
