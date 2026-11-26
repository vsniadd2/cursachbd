import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({
  children,
  allowNoTeam = false,
}: {
  children: React.ReactNode
  allowNoTeam?: boolean
}) {
  const { t } = useTranslation('common')
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas font-sans text-ink">
        <p className="text-[13px] text-ink-2">{t('loading')}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowNoTeam && user?.teamId === null) return <Navigate to="/join-team" replace />

  return children
}
