import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas font-sans text-ink">
        <p className="text-[13px] text-ink-2">Загрузка…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}
