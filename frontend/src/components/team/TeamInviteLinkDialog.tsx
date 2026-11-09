import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createInvite } from '@/services/invites.service'
import type { Department, RoleRow } from '@/types/crm'

type Props = {
  open: boolean
  onClose: () => void
  roles: RoleRow[]
  departments: Department[]
}

export function TeamInviteLinkDialog({ open, onClose, roles, departments }: Props) {
  const { t } = useTranslation('pages')
  const [roleId, setRoleId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  async function onCreate() {
    setBusy(true)
    setError(null)
    setLink(null)
    try {
      const res = await createInvite({
        type: 'LINK',
        roleId: roleId || undefined,
        departmentId: departmentId || null,
      })
      if (res.inviteToken) {
        setLink(`${window.location.origin}/register?invite=${encodeURIComponent(res.inviteToken)}`)
      }
    } catch {
      setError(t('team.invite.error'))
    } finally {
      setBusy(false)
    }
  }

  function copy() {
    if (!link) return
    void navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-[14px] border border-line bg-surface p-5 shadow-[0_24px_80px_rgba(23,23,26,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-medium">{t('team.invite.linkTitle')}</h3>
            <p className="mt-0.5 text-[12px] text-ink-2">{t('team.invite.linkSubtitle')}</p>
          </div>
          <button type="button" className="rounded-[8px] border border-line p-1.5" onClick={onClose} aria-label={t('team.invite.close')}>
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] text-ink-2">{t('team.invite.roleGroup')}</label>
            <select
              className="mt-1 h-[40px] w-full rounded-[10px] border border-line bg-surface px-3 text-[13px]"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">{t('team.invite.roleDefault')}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-ink-2">{t('team.subgroup')}</label>
            <select
              className="mt-1 h-[40px] w-full rounded-[10px] border border-line bg-surface px-3 text-[13px]"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">{t('team.noGroup')}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {link && (
          <div className="mt-4 rounded-[10px] border border-line bg-shell p-3">
            <p className="text-[11px] text-ink-2">{t('team.invite.linkReady')}</p>
            <p className="mt-1 break-all font-mono text-[11px] text-ink">{link}</p>
            <Button type="button" variant="brand" className="mt-3 h-[36px] w-full rounded-[10px] text-[12px]" onClick={copy}>
              {copied ? t('settings.copied') : t('team.invite.copyLink')}
            </Button>
          </div>
        )}

        {error && <p className="mt-3 text-[12px] text-brand">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-[38px] flex-1 rounded-[10px]" onClick={onClose}>
            {t('team.invite.close')}
          </Button>
          <Button type="button" variant="brand" className="h-[38px] flex-1 rounded-[10px]" disabled={busy} onClick={() => void onCreate()}>
            {busy ? t('team.invite.creating') : t('team.invite.createLink')}
          </Button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-3">
          <Link to="/roles?tab=invites" className="text-brand hover:underline">
            {t('team.invite.history')}
          </Link>
        </p>
      </div>
    </div>
  )
}
