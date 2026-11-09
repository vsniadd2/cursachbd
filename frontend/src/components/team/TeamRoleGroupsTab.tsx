import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createRole, deleteRole, fetchRoles, updateRole } from '@/services/roles.service'
import { createCustomPermission, deleteCustomPermission, fetchPermissionCatalog } from '@/services/permissions.service'
import { userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import type { RoleRow } from '@/types/crm'

export function TeamRoleGroupsTab() {
  const { t } = useTranslation('pages')
  const { user } = useAuth()
  const canWrite = userCan(user, 'roles:write', '*')
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [allPerms, setAllPerms] = useState<string[]>([])
  const [customPerms, setCustomPerms] = useState<{ id: string; slug: string; label: string }[]>([])
  const [editing, setEditing] = useState<RoleRow | null>(null)
  const [draftPerms, setDraftPerms] = useState<string[]>([])
  const [newRoleName, setNewRoleName] = useState('')
  const [newPermSlug, setNewPermSlug] = useState('')
  const [newPermLabel, setNewPermLabel] = useState('')
  const [loading, setLoading] = useState(true)

  async function reload() {
    const [r, catalog] = await Promise.all([fetchRoles(), fetchPermissionCatalog()])
    setRoles(r)
    setAllPerms([...catalog.builtin, ...catalog.custom.map((c) => c.slug)])
    setCustomPerms(catalog.custom)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function formatPerm(p: string) {
    return t(`roles.perms.${p}`, { defaultValue: p })
  }

  async function saveRole() {
    if (!editing) return
    await updateRole(editing.id, { permissions: draftPerms })
    setEditing(null)
    await reload()
  }

  async function addRole() {
    if (!newRoleName.trim()) return
    await createRole({
      name: newRoleName.trim().toUpperCase().replace(/\s+/g, '_'),
      permissions: [],
    })
    setNewRoleName('')
    await reload()
  }

  async function addCustomPerm() {
    if (!newPermSlug.trim() || !newPermLabel.trim()) return
    await createCustomPermission({ slug: newPermSlug.trim(), label: newPermLabel.trim() })
    setNewPermSlug('')
    setNewPermLabel('')
    await reload()
  }

  if (loading) {
    return <p className="text-[12px] text-ink-2">{t('team.loading')}</p>
  }

  return (
    <div className="space-y-6">
      {canWrite && (
        <section className="rounded-[14px] border border-line bg-surface p-4">
          <h3 className="text-[14px] font-medium">{t('team.groups.createPerm')}</h3>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input placeholder="reports:export" value={newPermSlug} onChange={(e) => setNewPermSlug(e.target.value)} />
            <Input placeholder={t('team.groups.permLabel')} value={newPermLabel} onChange={(e) => setNewPermLabel(e.target.value)} />
            <Button type="button" variant="brand" onClick={() => void addCustomPerm()}>
              {t('team.groups.addPerm')}
            </Button>
          </div>
          {customPerms.length > 0 && (
            <ul className="mt-3 space-y-1 text-[12px] text-ink-2">
              {customPerms.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-[8px] bg-shell px-2 py-1">
                  <span>
                    {p.label} <span className="font-mono text-[11px]">({p.slug})</span>
                  </span>
                  <Button type="button" variant="ghost" className="h-7 text-[11px]" onClick={() => void deleteCustomPermission(p.id).then(reload)}>
                    {t('team.delete')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {canWrite && (
        <section className="rounded-[14px] border border-line bg-surface p-4">
          <h3 className="text-[14px] font-medium">{t('team.groups.createRole')}</h3>
          <div className="mt-3 flex gap-2">
            <Input placeholder="CUSTOM_SALES" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
            <Button type="button" variant="outline" onClick={() => void addRole()}>
              {t('team.groups.addRole')}
            </Button>
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => (
          <article
            key={role.id}
            className="rounded-[14px] border border-line bg-surface p-5 shadow-[0_2px_16px_rgba(23,23,26,0.04)]"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-[10px] border border-brand/20 bg-brand-soft text-brand">
                <Shield className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-medium">{role.name}</h4>
                <p className="mt-0.5 text-[12px] text-ink-2">{role.description ?? t('team.groups.noDesc')}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 8).map((p) => (
                    <li key={p} className="rounded-full border border-line bg-shell px-2 py-0.5 text-[10px] text-ink-2">
                      {formatPerm(p)}
                    </li>
                  ))}
                  {role.permissions.length > 8 && (
                    <li className="text-[10px] text-ink-3">+{role.permissions.length - 8}</li>
                  )}
                </ul>
                {canWrite && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 text-[12px]"
                      onClick={() => {
                        setEditing(role)
                        setDraftPerms(role.permissions)
                      }}
                    >
                      {t('team.groups.edit')}
                    </Button>
                    {!role.isSystem && (
                      <Button type="button" variant="ghost" className="h-8 text-[12px]" onClick={() => void deleteRole(role.id).then(reload)}>
                        {t('team.delete')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4" role="dialog" aria-modal>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-line bg-surface p-5">
            <h3 className="text-[15px] font-medium">{t('team.groups.editTitle', { name: editing.name })}</h3>
            <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
              {allPerms.map((p) => (
                <label key={p} className="flex items-center gap-2 text-[12px]">
                  <input
                    type="checkbox"
                    checked={draftPerms.includes(p)}
                    onChange={(e) =>
                      setDraftPerms((prev) => (e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)))
                    }
                  />
                  {formatPerm(p)}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t('team.cancel')}
              </Button>
              <Button type="button" variant="brand" onClick={() => void saveRole()}>
                {t('team.save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
