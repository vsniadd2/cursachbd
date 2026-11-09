import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { LandingPage } from '@/pages/LandingPage'

export function PublicHome() {
  const { t } = useTranslation('common')
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface font-sans text-ink">
        <p className="text-[13px] text-ink-2">{t('loading')}</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}
