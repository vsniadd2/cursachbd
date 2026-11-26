import { errorText } from '@/lib/product'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/app/DataTable'
import { Button } from '@/components/ui/button'
import { cancelInvite, fetchInvites } from '@/services/invites.service'
import { userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import type { TeamInviteRow } from '@/types/crm'

export function TeamInvitesTab() {
  const { t } = useTranslation('pages')
  const { user } = useAuth()
  const canWrite = userCan(user, 'users:write', '*')
  const [error, setError] = useState('')
  const [rows, setRows] = useState<TeamInviteRow[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setRows(await fetchInvites())
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } catch (e) {
        setError(errorText(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          {
            key: 'type',
            header: t('team.invites.type'),
            cell: (r) => t(`team.invite.mode.${r.type}`),
          },
          {
            key: 'status',
            header: t('team.invites.status'),
            cell: (r) => t(`team.invites.statuses.${r.status}`),
          },
          { key: 'email', header: t('team.invite.email'), cell: (r) => r.email ?? r.targetPublicCode ?? '—' },
          { key: 'role', header: t('team.invite.roleGroup'), cell: (r) => r.role?.name ?? '—' },
          {
            key: 'actions',
            header: ' ',
            cell: (r) =>
              canWrite && r.status === 'PENDING' ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-[11px]"
                  onClick={() =>
                    void cancelInvite(r.id)
                      .then(reload)
                      .catch((e) => setError(errorText(e)))
                  }
                >
                  {t('team.invites.cancel')}
                </Button>
              ) : null,
          },
        ]}
      />
    </>
  )
}
