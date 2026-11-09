import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { SettingsAccountForm } from '@/components/settings/SettingsAccountForm'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    void logout().then(() => navigate('/', { replace: true }))
  }

  return (
    <PageContent>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />
      {user ? <SettingsAccountForm key={user.id} user={user} /> : null}
      <div className="mt-6 max-w-2xl">
        <Button type="button" variant="outline" className="h-[40px] rounded-[10px] text-[13px]" onClick={handleLogout}>
          {t('settings.logout')}
        </Button>
      </div>
    </PageContent>
  )
}
