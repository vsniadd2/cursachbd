import { useWords } from '@/lib/product'
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { AuthFieldLabel } from '@/components/auth/AuthFieldLabel'
import { AuthGoogleStub } from '@/components/auth/AuthGoogleStub'
import { AuthBackHomeLink } from '@/components/auth/AuthBackHomeLink'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/auth/demoAuth'

export function LoginPage() {
  const w = useWords()
  const { t } = useTranslation('auth')
  const { t: tc } = useTranslation('common')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = new URLSearchParams(location.search).has('invite')
    ? `/register${location.search}`
    : ((location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function submitCredentials(nextEmail: string, nextPassword: string, demo = false) {
    setError(null)
    setPending(true)
    try {
      await login({ email: nextEmail, password: nextPassword })
      navigate(from, { replace: true })
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      if (status === 401) {
        setError(t(demo ? 'demoUnavailable' : 'badCredentials'))
      } else if (status === 400) {
        setError(t('loginInvalidInput'))
      } else {
        setError(t('loginUnavailable'))
      }
    } finally {
      setPending(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitCredentials(email, password)
  }

  async function onDemoLogin() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    await submitCredentials(DEMO_EMAIL, DEMO_PASSWORD, true)
  }

  return (
    <AuthPageShell
      subtitleKey="loginSubtitle"
      showLangToggle
      footer={
        <p className="text-center text-[11px] leading-relaxed text-ink-2">
          {t('demo')} <span className="tabular text-ink">{DEMO_EMAIL}</span> /{' '}
          <span className="tabular">{DEMO_PASSWORD}</span>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-brand-strong">
            {w('Рады видеть вас снова', 'Welcome back')}
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            {w('С возвращением.', 'Make yourself at home.')}
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            {w(
              'Ваша команда и всё важное — уже здесь.',
              'Your team and everything that matters, right here.',
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AuthFieldLabel htmlFor="email">{t('login')}</AuthFieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('loginPlaceholder')}
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
            autoComplete="current-password"
            placeholder={t('passwordMask')}
            className="h-[44px] rounded-[12px] border-line bg-surface px-4 text-[13px]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p role="alert" className="text-center text-[12px] text-brand">{error}</p>}
        <Button
          type="submit"
          variant="brand"
          disabled={pending}
          className="h-[44px] w-full rounded-[12px] text-[13px] font-medium"
        >
          {pending ? t('signingIn') : t('signIn')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="h-[42px] w-full rounded-[12px] border-line text-[13px] font-medium"
          onClick={() => void onDemoLogin()}
        >
          {t('demoQuickLogin')}
        </Button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-3 uppercase tracking-wide">{tc('or')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthGoogleStub />
        <p className="text-center text-[12px] text-ink-2">
          {t('noAccount')}{' '}
          <Link to="/register" className="font-medium text-brand hover:underline">
            {t('registerLink')}
          </Link>
        </p>
        <AuthBackHomeLink />
      </form>
    </AuthPageShell>
  )
}
