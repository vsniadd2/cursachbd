import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createInvite, type CreateInviteBody } from '@/services/invites.service'
import { PUBLIC_CODE_PATTERN } from '@/lib/auth/permissions'
import type { Department, RoleRow } from '@/types/crm'

type Mode = CreateInviteBody['type']

type Props = {
  open: boolean
  onClose: () => void
  roles: RoleRow[]
  departments: Department[]
  onCreated: () => void
}

export function TeamInviteSheet({ open, onClose, roles, departments, onCreated }: Props) {
  const { t } = useTranslation('pages')
  const [mode, setMode] = useState<Mode>('EMAIL')
  const [email, setEmail] = useState('')
  const [publicCode, setPublicCode] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [busy, setBusy] = useState(false)
  const [resultLink, setResultLink] = useState<string | null>(null)
  const [resultCreds, setResultCreds] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function switchMode(next: Mode) {
    setMode(next)
    setResultLink(null)
    setResultCreds(null)
    setError(null)
  }

  async function submit() {
    setBusy(true)
    setError(null)
  setResultLink(null)
    setResultCreds(null)
    try {
      const bodyBase = {
        roleId: roleId || undefined,
        departmentId: departmentId || null,
      }
      if (mode === 'EMAIL') {
        const res = await createInvite({ type: 'EMAIL', email: email.trim(), ...bodyBase })
        if (res.inviteToken) {
          const link = `${window.location.origin}/register?invite=${encodeURIComponent(res.inviteToken)}`
          setResultLink(link)
        }
      } else if (mode === 'PUBLIC_CODE') {
        if (!PUBLIC_CODE_PATTERN.test(publicCode.trim())) {
          setError(t('team.invite.invalidCode'))
          return
        }
        await createInvite({ type: 'PUBLIC_CODE', publicCode: publicCode.trim(), ...bodyBase })
        onCreated()
        onClose()
      } else {
        const res = await createInvite({
          type: 'TEMP_ACCOUNT',
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          ...bodyBase,
        })
        if (res.credentials) {
          const lines = [
            `${t('team.invite.credEmail')}: ${res.credentials.email}`,
            `${t('team.invite.credPass')}: ${res.credentials.password}`,
            `${t('team.publicCode')}: ${res.credentials.publicCode}`,
          ].join('\n')
          setResultCreds(lines)
        }
        onCreated()
      }
    } catch {
      setError(t('team.invite.error'))
    } finally {
      setBusy(false)
    }
  }

  function copyLink() {
    if (resultLink) void navigator.clipboard.writeText(resultLink)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 p-4 sm:items-center" role="dialog" aria-modal>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[14px] border border-line bg-surface p-5 shadow-[0_24px_80px_rgba(23,23,26,0.12)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-medium">{t('team.invite.title')}</h3>
            <p className="mt-0.5 text-[12px] text-ink-2">{t('team.invite.subtitle')}</p>
          </div>
          <button type="button" className="rounded-[8px] border border-line p-1.5" onClick={onClose} aria-label={t('team.invite.close')}>
            <X className="size-4" />
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['EMAIL', 'PUBLIC_CODE', 'TEMP_ACCOUNT'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
                mode === m ? 'border-brand bg-brand text-white' : 'border-line bg-shell text-ink-2'
              }`}
            >
              {t(`team.invite.mode.${m}`)}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {(mode === 'EMAIL' || mode === 'TEMP_ACCOUNT') && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-ink-2">{t('team.invite.email')}</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
          )}
          {mode === 'PUBLIC_CODE' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-ink-2">{t('team.publicCode')}</label>
              <Input
                value={publicCode}
                onChange={(e) => setPublicCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                inputMode="numeric"
                placeholder="123456789"
              />
            </div>
          )}
          {mode === 'TEMP_ACCOUNT' && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-ink-2">{t('team.invite.firstName')}</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-ink-2">{t('team.invite.lastName')}</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-ink-2">{t('team.invite.password')}</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              </div>
            </>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] text-ink-2">{t('team.invite.roleGroup')}</label>
              <select
                className="h-[36px] w-full rounded-[7px] border border-line bg-surface px-3 text-[13px]"
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
            <div className="space-y-1.5">
              <label className="text-[11px] text-ink-2">{t('team.subgroup')}</label>
              <select
                className="h-[36px] w-full rounded-[7px] border border-line bg-surface px-3 text-[13px]"
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
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          {resultLink && (
            <div className="rounded-[10px] border border-line bg-shell p-3 text-[12px]">
              <p className="mb-2 text-ink-2">{t('team.invite.linkReady')}</p>
              <p className="break-all font-mono text-[11px]">{resultLink}</p>
              <Button type="button" variant="outline" className="mt-2 h-[32px]" onClick={copyLink}>
                {t('team.invite.copyLink')}
              </Button>
              <Button type="button" variant="ghost" className="mt-2 h-[32px] text-[12px]" onClick={() => onCreated()}>
                {t('team.invite.stubSend')}
              </Button>
            </div>
          )}
          {resultCreds && (
            <pre className="whitespace-pre-wrap rounded-[10px] border border-line bg-shell p-3 text-[11px]">{resultCreds}</pre>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('team.invite.close')}
          </Button>
          <Button type="button" variant="brand" disabled={busy} onClick={() => void submit()}>
            {t('team.invite.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}
