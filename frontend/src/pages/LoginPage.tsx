import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 font-sans text-ink">
      <Card className="w-full max-w-[400px] shadow-none">
        <CardHeader>
          <BrandLogo subtitle="Вход в систему" />
          <CardTitle className="pt-4">Добро пожаловать</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-[12px] text-brand">{error}</p>}
            <Button type="submit" variant="brand" disabled={pending} className="w-full">
              {pending ? 'Вход…' : 'Войти'}
            </Button>
            <p className="text-center text-[12px] text-ink-2">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-brand hover:underline">
                Регистрация
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
