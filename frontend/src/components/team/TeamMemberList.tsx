import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/app/DataTable'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { patchUser } from '@/services/users.service'
import { userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import type { Department, RoleRow, TeamUser } from '@/types/crm'

type Props = {
  users: TeamUser[]
  roles: RoleRow[]
  departments: Department[]
  loading?: boolean
  onReload: (search?: string) => Promise<void>
}

export function TeamMemberList({ users, roles, departments, loading, onReload }: Props) {
  const { t } = useTranslation('pages')
  const { user: authUser } = useAuth()
  const canWrite = userCan(authUser, 'users:write', '*')
  const [query, setQuery] = useState('')

  async function runSearch() {
    await onReload(query.trim())
  }

  async function onRoleChange(userId: string, roleId: string) {
    await patchUser(userId, { roleId })
    await onReload(query.trim())
  }

  async function onDeptChange(userId: string, departmentId: string) {
    await patchUser(userId, { departmentId: departmentId === '' ? null : departmentId })
    await onReload(query.trim())
  }

  async function onManagerChange(userId: string, managerId: string) {
    await patchUser(userId, { managerId: managerId === '' ? null : managerId })
    await onReload(query.trim())
  }

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-[13px] font-medium text-ink">{t('team.membersListTitle')}</h3>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('team.searchPlaceholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void runSearch()
          }}
          className="max-w-md"
        />
        <Button type="button" variant="outline" className="shrink-0 px-3" onClick={() => void runSearch()} aria-label={t('team.searchAction')}>
          <Search className="size-4" />
        </Button>
      </div>

      <DataTable
        loading={loading}
        rows={users}
        columns={[
          {
            key: 'name',
            header: t('settings.name'),
            cell: (r) => (
              <span>
                {r.firstName} {r.lastName}
              </span>
            ),
          },
          { key: 'email', header: t('team.invite.email'), cell: (r) => r.email },
          {
            key: 'manager',
            header: t('team.manager'),
            cell: (r) =>
              canWrite ? (
                <select
                  className="h-8 max-w-[160px] rounded-[8px] border border-line bg-surface px-2 text-[11px]"
                  value={r.managerId ?? ''}
                  onChange={(e) => void onManagerChange(r.id, e.target.value)}
                >
                  <option value="">{t('team.noManager')}</option>
                  {users
                    .filter((u) => u.id !== r.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                </select>
              ) : (
                (r.manager ? `${r.manager.firstName} ${r.manager.lastName}` : t('team.noManager'))
              ),
          },
          {
            key: 'role',
            header: t('team.invite.roleGroup'),
            cell: (r) =>
              canWrite ? (
                <select
                  className="h-8 rounded-[8px] border border-line bg-surface px-2 text-[11px]"
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
            key: 'dept',
            header: t('team.subgroup'),
            cell: (r) =>
              canWrite ? (
                <select
                  className="h-8 max-w-[140px] rounded-[8px] border border-line bg-surface px-2 text-[11px]"
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
        ]}
      />
    </div>
  )
}
