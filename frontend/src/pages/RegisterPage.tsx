import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { AuthFieldLabel } from '@/components/auth/AuthFieldLabel'
import { AuthGoogleStub } from '@/components/auth/AuthGoogleStub'
import { AuthBackHomeLink } from '@/components/auth/AuthBackHomeLink'
import { useAuth } from '@/contexts/AuthContext'

export function RegisterPage() {
  const { t } = useTranslation('auth')
  const { t: tc } = useTranslation('common')
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register({ email, password, firstName, lastName })
      navigate('/dashboard', { replace: true })
    } catch {
      setError(t('registerFailed'))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthPageShell subtitleKey="registerSubtitle" showLangToggle>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <AuthFieldLabel htmlFor="firstName">{t('firstName')}</AuthFieldLabel>
            <Input
              id="firstName"
              placeholder={t('firstNamePlaceholder')}
              className="h-[44px] rounded-[12px] border-line bg-surface px-3 text-[13px]"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <AuthFieldLabel htmlFor="lastName">{t('lastName')}</AuthFieldLabel>
            <Input
              id="lastName"
              placeholder={t('lastNamePlaceholder')}
              className="h-[44px] rounded-[12px] border-line bg-surface px-3 text-[13px]"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <AuthFieldLabel htmlFor="email">{t('email')}</AuthFieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className="h-[44px] rounded-[12px] border-line bg-surface px-4 text-[13px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <AuthFieldLabel htmlFor="password">{t('password')}</AuthFieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('passwordMinPlaceholder')}
            minLength={8}
            className="h-[44px] rounded-[12px] border-line bg-surface px-4 text-[13px]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-center text-[12px] text-brand">{error}</p>}
        <Button
          type="submit"
          variant="brand"
          disabled={pending}
          className="h-[44px] w-full rounded-[12px] text-[13px] font-medium"
        >
          {pending ? t('signingUp') : t('signUp')}
        </Button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-3 uppercase tracking-wide">{tc('or')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthGoogleStub variant="continue" />
        <p className="text-center text-[12px] text-ink-2">
          {t('hasAccount')}{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            {t('loginLink')}
          </Link>
        </p>
        <AuthBackHomeLink />
      </form>
    </AuthPageShell>
  )
}
