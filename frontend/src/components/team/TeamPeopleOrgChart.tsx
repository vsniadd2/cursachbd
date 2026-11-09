import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TeamUser } from '@/types/crm'
import { TeamOrgPanCanvas } from '@/components/team/TeamOrgPanCanvas'
import { TeamOrgPersonCard } from '@/components/team/TeamOrgPersonCard'
import { TeamPersonDetailPanel } from '@/components/team/TeamPersonDetailPanel'
import { buildPeopleTree, type PersonNode } from '@/components/team/teamOrgTree'
import { countDescendants, findPersonNode } from '@/components/team/teamOrgHierarchy'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  users: TeamUser[]
  loading?: boolean
  showRoster: boolean
  onShowRosterChange: (v: boolean) => void
}

function matchSearch(user: TeamUser, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    user.email.toLowerCase().includes(q) ||
    user.firstName.toLowerCase().includes(q) ||
    user.lastName.toLowerCase().includes(q) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(q)
  )
}

function PersonSubtree({
  node,
  selectedId,
  collapsedIds,
  searchQuery,
  onSelect,
  onToggleCollapse,
  registerCardRef,
}: {
  node: PersonNode
  selectedId: string | null
  collapsedIds: Set<string>
  searchQuery: string
  onSelect: (id: string) => void
  onToggleCollapse: (id: string) => void
  registerCardRef: (id: string, el: HTMLButtonElement | null) => void
}) {
  const collapsed = collapsedIds.has(node.id)
  const highlight = matchSearch(node, searchQuery)

  return (
    <li className="team-pf-node">
      <TeamOrgPersonCard
        user={node}
        directReports={node.children.length}
        totalReports={countDescendants(node)}
        selected={selectedId === node.id}
        dimmed={!!searchQuery && !highlight}
        collapsed={collapsed}
        onSelect={() => onSelect(node.id)}
        onToggleCollapse={node.children.length ? () => onToggleCollapse(node.id) : undefined}
        buttonRef={(el) => registerCardRef(node.id, el)}
      />
      {node.children.length > 0 && !collapsed && (
        <ul className="team-pf-children">
          {node.children.map((child) => (
            <PersonSubtree
              key={child.id}
              node={child}
              selectedId={selectedId}
              collapsedIds={collapsedIds}
              searchQuery={searchQuery}
              onSelect={onSelect}
              onToggleCollapse={onToggleCollapse}
              registerCardRef={registerCardRef}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function TeamPeopleOrgChart({ users, loading, showRoster, onShowRosterChange }: Props) {
  const { t } = useTranslation('pages')
  const { user: authUser } = useAuth()
  const roots = useMemo(() => buildPeopleTree(users), [users])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const boardRef = useRef<HTMLDivElement>(null)

  const selectedUser = users.find((u) => u.id === selectedId)
  const selectedNode = selectedId ? findPersonNode(roots, selectedId) : null
  const directReportCount = selectedNode?.children.length ?? 0
  const totalReportCount = selectedNode ? countDescendants(selectedNode) : 0

  const registerCardRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) cardRefs.current.set(id, el)
    else cardRefs.current.delete(id)
  }, [])

  const onToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const onFindMe = useCallback(() => {
    if (!authUser?.id) return
    setSelectedId(authUser.id)
    const el = cardRefs.current.get(authUser.id)
    el?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    el?.focus()
  }, [authUser])

  if (loading) {
    return (
      <div ref={boardRef} className="relative">
        <TeamOrgPanCanvas
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onFindMe={onFindMe}
          showRoster={showRoster}
          onShowRosterChange={onShowRosterChange}
        >
          <p className="text-center text-[12px] text-ink-2">{t('team.loading')}</p>
        </TeamOrgPanCanvas>
      </div>
    )
  }

  if (!roots.length) {
    return (
      <div ref={boardRef} className="relative">
        <TeamOrgPanCanvas
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onFindMe={onFindMe}
          showRoster={showRoster}
          onShowRosterChange={onShowRosterChange}
        >
          <p className="text-center text-[12px] text-ink-2">{t('team.chartEmpty')}</p>
        </TeamOrgPanCanvas>
      </div>
    )
  }

  return (
    <div ref={boardRef} className="relative">
      <p className="mb-3 text-[12px] leading-relaxed text-ink-2">{t('team.org.hierarchyHint')}</p>
      <TeamOrgPanCanvas
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onFindMe={onFindMe}
        showRoster={showRoster}
        onShowRosterChange={onShowRosterChange}
      >
        <ul className="team-pf-tree">
          {roots.map((root) => (
            <PersonSubtree
              key={root.id}
              node={root}
              selectedId={selectedId}
              collapsedIds={collapsedIds}
              searchQuery={searchQuery}
              onSelect={setSelectedId}
              onToggleCollapse={onToggleCollapse}
              registerCardRef={registerCardRef}
            />
          ))}
        </ul>
      </TeamOrgPanCanvas>

      {selectedUser && (
        <TeamPersonDetailPanel
          user={selectedUser}
          directReportCount={directReportCount}
          totalReportCount={totalReportCount}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
