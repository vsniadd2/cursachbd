import { useNavigate } from 'react-router-dom'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <PageContent>
      <PageHeader title="Settings" description="Profile and security" />
      <PageSection className="max-w-md space-y-3">
        <div>
          <p className="text-[11px] text-ink-2">Name</p>
          <p className="text-[14px]">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-ink-2">Email</p>
          <p className="text-[14px]">{user?.email}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-2">Role</p>
          <p className="text-[14px]">{user?.role.name}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleLogout}>
          Выйти
        </Button>
        <p className="text-[11px] text-ink-3">Password change will be available in a future release.</p>
      </PageSection>
    </PageContent>
  )
}
