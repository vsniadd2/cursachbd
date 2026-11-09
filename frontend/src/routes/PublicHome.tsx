import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LandingPage } from '@/pages/LandingPage'

export function PublicHome() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface font-sans text-ink">
        <p className="text-[13px] text-ink-2">Загрузка…</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}
