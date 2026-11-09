import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export function RegisterPage() {
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
      setError('Не удалось зарегистрироваться. Проверьте данные или email.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 font-sans text-ink">
      <Card className="w-full max-w-[400px] shadow-none">
        <CardHeader>
          <BrandLogo subtitle="Регистрация" />
          <CardTitle className="pt-4">Создать аккаунт</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Имя</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль (мин. 8 символов)</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-[12px] text-brand">{error}</p>}
            <Button type="submit" variant="brand" disabled={pending} className="w-full">
              {pending ? 'Создание…' : 'Зарегистрироваться'}
            </Button>
            <p className="text-center text-[12px] text-ink-2">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-brand hover:underline">
                Войти
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
