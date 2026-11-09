import { useState } from 'react'
import { Copy, Check, KeyRound, Shield, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthFieldLabel } from '@/components/auth/AuthFieldLabel'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/auth/demoAuth'
import { cn } from '@/lib/utils'
import axios from 'axios'
import type { ApiErrorBody } from '@/types/api'
import type { UpdateProfilePayload } from '@/services/auth.service'

function apiErrorMessage(err: unknown): string | null {
  if (axios.isAxiosError<ApiErrorBody>(err) && err.response?.data?.error) {
    return err.response.data.error
  }
  return null
}

type SettingsAccountFormProps = {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
}

export function SettingsAccountForm({ user }: SettingsAccountFormProps) {
  const { t } = useTranslation('pages')
  const { t: ta } = useTranslation('auth')
  const { t: tc } = useTranslation('common')
  const { updateProfile } = useAuth()

  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [email, setEmail] = useState(user.email)
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const demo = isDemoMode()

  async function copyPublicCode() {
    if (!user?.publicCode) return
    await navigator.clipboard.writeText(user.publicCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (demo) {
      setError(t('settings.demoNoEdit'))
      return
    }
    const payload: UpdateProfilePayload = { currentPassword }
    if (firstName.trim() !== user.firstName) payload.firstName = firstName.trim()
    if (lastName.trim() !== user.lastName) payload.lastName = lastName.trim()
    if (email.trim().toLowerCase() !== user.email) payload.email = email.trim().toLowerCase()
    if (newPassword.trim()) payload.newPassword = newPassword.trim()

    const hasChange =
      payload.firstName ?? payload.lastName ?? payload.email ?? payload.newPassword
    if (!hasChange) {
      setError(t('settings.noChanges'))
      return
    }

    setPending(true)
    try {
      await updateProfile(payload)
      setCurrentPassword('')
      setNewPassword('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3200)
    } catch (err) {
      const apiErr = apiErrorMessage(err)
      if (apiErr === 'Current password is incorrect') {
        setError(t('settings.wrongPassword'))
      } else if (apiErr === 'Email already in use') {
        setError(t('settings.emailTaken'))
      } else {
        setError(t('settings.saveFailed'))
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-[0_12px_40px_rgba(23,23,26,0.06)]">
        <div className="flex items-center gap-3 border-b border-line bg-shell/80 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-[10px] bg-brand-soft text-brand">
            <UserRound className="size-[18px]" strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">{t('settings.profileCardTitle')}</p>
            <p className="text-[11px] text-ink-2">{user?.role.name ?? '—'}</p>
          </div>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <AuthFieldLabel htmlFor="settings-firstName">{ta('firstName')}</AuthFieldLabel>
              <Input
                id="settings-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={demo}
                className="h-[42px] rounded-[11px] border-line bg-shell/50 px-3 text-[13px]"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <AuthFieldLabel htmlFor="settings-lastName">{ta('lastName')}</AuthFieldLabel>
              <Input
                id="settings-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={demo}
                className="h-[42px] rounded-[11px] border-line bg-shell/50 px-3 text-[13px]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <AuthFieldLabel htmlFor="settings-email">{ta('email')}</AuthFieldLabel>
            <Input
              id="settings-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={demo}
              className="h-[42px] rounded-[11px] border-line bg-shell/50 px-3 text-[13px]"
              required
            />
          </div>

          <div className="rounded-[12px] border border-dashed border-line bg-shell/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-ink">
              <KeyRound className="size-4 text-brand" strokeWidth={1.6} />
              <span className="text-[12px] font-medium">{t('settings.securityTitle')}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <AuthFieldLabel htmlFor="settings-current-password">{t('settings.currentPassword')}</AuthFieldLabel>
                <Input
                  id="settings-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={demo}
                  placeholder={t('settings.currentPasswordPlaceholder')}
                  className="h-[42px] rounded-[11px] border-line bg-surface px-3 text-[13px]"
                  required
                />
                <p className="text-[10.5px] leading-relaxed text-ink-3">{t('settings.passwordConfirmHint')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <AuthFieldLabel htmlFor="settings-new-password">{t('settings.newPassword')}</AuthFieldLabel>
                <Input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={demo}
                  minLength={8}
                  placeholder={ta('passwordMinPlaceholder')}
                  className="h-[42px] rounded-[11px] border-line bg-surface px-3 text-[13px]"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-[12px] text-brand">{error}</p>}
          {success && (
            <p className="text-[12px] text-emerald-600 dark:text-emerald-400">{t('settings.saved')}</p>
          )}

          <Button
            type="submit"
            variant="brand"
            disabled={pending || demo}
            className="h-[42px] rounded-[11px] px-6 text-[13px] font-medium"
          >
            {pending ? t('settings.saving') : t('settings.save')}
          </Button>
          {demo && <p className="text-[11px] text-ink-3">{t('settings.demoNoEdit')}</p>}
        </form>
      </div>

      <div className="rounded-[16px] border border-line bg-gradient-to-br from-shell to-surface p-5 shadow-[0_8px_28px_rgba(23,23,26,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-brand" strokeWidth={1.6} />
              <p className="text-[12px] font-medium">{t('settings.publicCodeTitle')}</p>
            </div>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-ink-2">{t('settings.publicCodeHelp')}</p>
          </div>
        </div>
        <div
          className={cn(
            'mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface px-4 py-3',
          )}
        >
          <p className="font-mono text-[22px] font-medium tracking-[0.22em] tabular text-ink">
            {user?.publicCode ?? '—'}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-[36px] gap-2 rounded-[10px] text-[12px]"
            onClick={() => void copyPublicCode()}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? t('settings.copied') : t('settings.copyCode')}
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-ink-3">{tc('table.email')}: {user?.email}</p>
      </div>
    </div>
  )
}
