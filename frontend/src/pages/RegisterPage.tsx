import { Building2, UserRound, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useWords } from '@/lib/product'
import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { errorText } from '@/lib/product'
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
  const w = useWords()
  const [accountType, setAccountType] = useState<'BUSINESS' | 'PERSONAL'>(() =>
    new URLSearchParams(window.location.search).get('account') === 'personal' ? 'PERSONAL' : 'BUSINESS',
  )
  const [businessName, setBusinessName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const inviteToken = new URLSearchParams(window.location.search).get('invite') ?? undefined
  const accepting = useRef(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    if (!inviteToken) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (accepting.current) return
    accepting.current = true
    void apiClient
      .post('/invites/accept', { token: inviteToken })
      .then(() => window.location.assign('/dashboard'))
      .catch((e) => setError(errorText(e)))
  }, [isAuthenticated, navigate, inviteToken])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      accepting.current = true
      await register({
        email,
        password,
        firstName,
        lastName,
        inviteToken,
        accountType: inviteToken ? 'PERSONAL' : accountType,
        businessName: !inviteToken && accountType === 'BUSINESS' ? businessName : undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      accepting.current = false
      setError(errorText(e))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthPageShell subtitleKey="registerSubtitle" showLangToggle>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-brand-strong">
            {w('Начните с главного', 'A new beginning')}
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            {w('Ваш следующий шаг.', 'Your next chapter.')}
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            {inviteToken
              ? w(
                  'Вас пригласили в команду. Создайте аккаунт, чтобы присоединиться.',
                  'You have been invited. Create an account to join.',
                )
              : w(
                  'Создайте пространство для бизнеса или присоединитесь к своей команде.',
                  'Create a space for your business or join your team.',
                )}
          </p>
        </div>
        {!inviteToken && (
          <fieldset>
            <legend className="sr-only">{w('Тип аккаунта', 'Account type')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['BUSINESS', 'PERSONAL'] as const).map((type) => {
                const Icon = type === 'BUSINESS' ? Building2 : UserRound
                return (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-2xl border p-3 transition-all duration-200 ${accountType === type ? 'border-brand bg-brand-soft shadow-sm' : 'border-line hover:border-brand-2'}`}
                  >
                    <input
                      className="float-right size-4 accent-brand"
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={accountType === type}
                      onChange={() => setAccountType(type)}
                    />
                    <Icon className="mb-2 size-5 text-brand-strong" />
                    <span className="block text-sm font-medium">
                      {type === 'BUSINESS' ? w('Бизнес', 'Business') : w('Личный аккаунт', 'Personal')}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-2">
                      {type === 'BUSINESS'
                        ? w('Создать свою команду', 'Create your team')
                        : w('Войти по приглашению', 'Join with a code')}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}
        {!inviteToken && accountType === 'BUSINESS' && (
          <label className="flex flex-col gap-2 text-sm">
            {w('Название компании', 'Business name')}
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder={w('Например, Acme Studio', 'e.g. Acme Studio')}
              className="h-11 rounded-xl"
            />
          </label>
        )}

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
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('passwordMinPlaceholder')}
            minLength={8}
            maxLength={72}
            className="h-[44px] rounded-[12px] border-line bg-surface px-4 text-[13px]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="-mt-2 flex items-center gap-2 self-end text-xs text-ink-2"
        >
          {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showPassword ? w('Скрыть пароль', 'Hide password') : w('Показать пароль', 'Show password')}
        </button>
        {error && <p className="text-center text-[12px] text-brand">{error}</p>}
        <Button
          type="submit"
          variant="brand"
          disabled={pending}
          className="h-[44px] w-full rounded-[12px] text-[13px] font-medium"
        >
          {pending
            ? t('signingUp')
            : accountType === 'BUSINESS' && !inviteToken
              ? w('Создать пространство', 'Create workspace')
              : t('signUp')}
          <ArrowRight className="ml-2 size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-3 uppercase tracking-wide">{tc('or')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthGoogleStub variant="continue" />
        <p className="text-center text-[12px] text-ink-2">
          {t('hasAccount')}{' '}
          <Link
            to={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : '/login'}
            className="font-medium text-brand hover:underline"
          >
            {t('loginLink')}
          </Link>
        </p>
        <AuthBackHomeLink />
      </form>
    </AuthPageShell>
  )
}
