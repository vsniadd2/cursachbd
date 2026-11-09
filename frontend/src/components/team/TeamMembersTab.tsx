import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus } from 'lucide-react'
import { DataTable } from '@/components/app/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchUsers, patchUser } from '@/services/users.service'
import { fetchDepartments } from '@/services/departments.service'
import { fetchRoles } from '@/services/roles.service'
import { fetchPermissionCatalog } from '@/services/permissions.service'
import { TeamInviteSheet } from '@/components/team/TeamInviteSheet'
import { detectSearchKind, userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import type { Department, RoleRow, TeamUser } from '@/types/crm'

export function TeamMembersTab() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()
  const canWrite = userCan(user, 'users:write', '*')
  const [rows, setRows] = useState<TeamUser[]>([])
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [permSlugs, setPermSlugs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingExtras, setEditingExtras] = useState<string | null>(null)
  const [extraDraft, setExtraDraft] = useState<string[]>([])

  const reload = useCallback(async (search?: string) => {
    const q = (search ?? query).trim()
    const kind = q ? detectSearchKind(q) : undefined
    const params =
      q && (kind === 'email' || kind === 'publicCode') ? { query: q, kind } : q ? { query: q } : undefined
    const [users, r, d, catalog] = await Promise.all([
      fetchUsers(params),
      fetchRoles(),
      fetchDepartments(),
      fetchPermissionCatalog().catch(() => ({ builtin: [], custom: [] })),
    ])
    setRows(users)
    setRoles(r)
    setDepartments(d)
    setPermSlugs([...catalog.builtin, ...catalog.custom.map((c) => c.slug)])
  }, [query])

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

  async function runSearch() {
    setLoading(true)
    try {
      await reload(query)
    } finally {
      setLoading(false)
    }
  }

  async function onRoleChange(userId: string, roleId: string) {
    await patchUser(userId, { roleId })
    await reload()
  }

  async function onDeptChange(userId: string, departmentId: string) {
    await patchUser(userId, { departmentId: departmentId === '' ? null : departmentId })
    await reload()
  }

  async function saveExtras(userId: string) {
    await patchUser(userId, { extraPermissions: extraDraft })
    setEditingExtras(null)
    await reload()
  }

  function formatPerm(p: string) {
    return t(`roles.perms.${p}`, { defaultValue: p })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-[11px] text-ink-2">{t('team.searchLabel')}</label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('team.searchPlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runSearch()
              }}
            />
            <Button type="button" variant="outline" className="shrink-0 px-3" onClick={() => void runSearch()} aria-label={t('team.searchAction')}>
              <Search className="size-4" />
            </Button>
          </div>
        </div>
        {canWrite && (
          <Button type="button" variant="brand" className="w-full sm:w-auto" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            {t('team.invite.cta')}
          </Button>
        )}
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', header: tc('table.name'), cell: (r) => `${r.firstName} ${r.lastName}` },
          { key: 'email', header: tc('table.email'), cell: (r) => r.email },
          { key: 'code', header: t('team.publicCode'), cell: (r) => <span className="font-mono tabular">{r.publicCode}</span> },
          {
            key: 'role',
            header: tc('table.role'),
            cell: (r) =>
              canWrite ? (
                <select
                  className="max-w-[140px] rounded-[6px] border border-line bg-surface px-2 py-1 text-[12px]"
                  value={r.role.id}
                  onChange={(e) => void onRoleChange(r.id, e.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              ) : (
                r.role.name
              ),
          },
          {
            key: 'group',
            header: t('team.subgroup'),
            cell: (r) =>
              canWrite ? (
                <select
                  className="max-w-[160px] rounded-[6px] border border-line bg-surface px-2 py-1 text-[12px]"
                  value={r.departmentId ?? ''}
                  onChange={(e) => void onDeptChange(r.id, e.target.value)}
                >
                  <option value="">{t('team.noGroup')}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : (
                (r.department?.name ?? t('team.noGroup'))
              ),
          },
          {
            key: 'extra',
            header: t('team.extraPerms'),
            cell: (r) =>
              canWrite ? (
                <div className="max-w-[200px]">
                  {editingExtras === r.id ? (
                    <div className="space-y-2">
                      <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-line p-2">
                        {permSlugs.map((p) => (
                          <label key={p} className="flex items-center gap-2 text-[11px]">
                            <input
                              type="checkbox"
                              checked={extraDraft.includes(p)}
                              onChange={(e) => {
                                setExtraDraft((prev) =>
                                  e.target.checked ? [...prev, p] : prev.filter((x) => x !== p),
                                )
                              }}
                            />
                            {formatPerm(p)}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" className="h-7 px-2 text-[11px]" variant="brand" onClick={() => void saveExtras(r.id)}>
                          {t('team.save')}
                        </Button>
                        <Button type="button" className="h-7 px-2 text-[11px]" variant="ghost" onClick={() => setEditingExtras(null)}>
                          {t('team.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="text-left text-[11px] text-brand hover:underline"
                      onClick={() => {
                        setEditingExtras(r.id)
                        setExtraDraft(r.extraPermissions ?? [])
                      }}
                    >
                      {r.extraPermissions?.length ? r.extraPermissions.map(formatPerm).join(', ') : t('team.assignPerms')}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-ink-2">{r.extraPermissions?.length ? r.extraPermissions.length : '—'}</span>
              ),
          },
        ]}
      />

      <TeamInviteSheet
        key={inviteOpen ? 'open' : 'closed'}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roles={roles}
        departments={departments}
        onCreated={() => {
          setInviteOpen(false)
          void reload()
        }}
      />
    </div>
  )
}
