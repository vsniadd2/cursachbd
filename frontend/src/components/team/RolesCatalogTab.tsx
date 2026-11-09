import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/app/DataTable'
import { PageSection } from '@/components/app/PageSection'
import { fetchRoles } from '@/services/roles.service'
import type { RoleRow } from '@/types/crm'

export function RolesCatalogTab() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [rows, setRows] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)

  function formatPerm(p: string) {
    return t(`roles.perms.${p}`, { defaultValue: p })
  }

  useEffect(() => {
    void fetchRoles()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageSection className="mb-5">
        <p className="text-[12px] leading-relaxed text-ink-2">{t('roles.intro')}</p>
      </PageSection>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', header: tc('table.role'), cell: (r) => r.name },
          { key: 'desc', header: tc('table.description'), cell: (r) => r.description ?? tc('dash') },
          {
            key: 'perm',
            header: tc('table.permissions'),
            cell: (r) => (
              <ul className="max-w-md list-inside list-disc text-[11px] text-ink-2">
                {r.permissions.map((p) => (
                  <li key={p}>{formatPerm(p)}</li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </>
  )
}
