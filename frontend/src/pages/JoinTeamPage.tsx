import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Users, ArrowRight, LogOut } from 'lucide-react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { useAuth } from '@/contexts/AuthContext'
import { useWords, errorText } from '@/lib/product'
import { apiClient } from '@/lib/api/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export function JoinTeamPage() {
  const { user, logout } = useAuth(),
    w = useWords(),
    [code, setCode] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  if (user?.teamId) return <Navigate to="/dashboard" replace />
  async function join() {
    setBusy(true)
    setError('')
    try {
      let value = code.trim()
      if (value.includes('://')) value = new URL(value).searchParams.get('invite') ?? value
      await apiClient.post('/teams/join', { code: value })
      window.location.assign('/dashboard')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthPageShell subtitleKey="registerSubtitle" showLangToggle>
      <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Users className="size-7" />
      </div>
      <h1 className="text-3xl font-medium tracking-tight">{w('Вместе — больше.', 'Better, together.')}</h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-slate-500">
        {w(
          'Аккаунт готов. Попросите администратора команды прислать код или ссылку приглашения и вставьте ниже.',
          'Your account is ready. Ask your team administrator for an invitation code or link and paste it below.',
        )}
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void join()
        }}
      >
        <label className="block text-sm">
          {w('Код или ссылка приглашения', 'Invitation code or link')}
          <Input
            className="mt-2 h-12 rounded-xl font-mono"
            autoFocus
            required
            minLength={8}
            maxLength={500}
            placeholder="A1B2C3D4E5"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button className="h-12 w-full rounded-xl" disabled={busy}>
          {busy ? w('Подключение…', 'Joining…') : w('Присоединиться к команде', 'Join team')}
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        {w(
          'Код одноразовый и действует 7 дней. До подключения данные команд недоступны.',
          'Codes are single use and valid for 7 days. Team data stays private until you join.',
        )}
      </p>
      <button className="mt-6 flex items-center gap-2 text-sm text-slate-500" onClick={() => void logout()}>
        <LogOut className="size-4" />
        {w('Выйти из аккаунта', 'Sign out')}
      </button>
    </AuthPageShell>
  )
}
