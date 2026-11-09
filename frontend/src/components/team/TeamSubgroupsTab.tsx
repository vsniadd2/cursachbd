import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDepartment, fetchDepartments } from '@/services/departments.service'
import { userCan } from '@/lib/auth/permissions'
import { useAuth } from '@/contexts/AuthContext'
import { buildDeptTree, DeptTree } from '@/components/team/DeptTree'

export function TeamSubgroupsTab() {
  const { t } = useTranslation('pages')
  const { user } = useAuth()
  const canWrite = userCan(user, 'users:write', '*')
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof fetchDepartments>>>([])
  const [subgroupName, setSubgroupName] = useState('')
  const [parentId, setParentId] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setDepartments(await fetchDepartments())
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const items = await fetchDepartments()
      if (!cancelled) setDepartments(items)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const tree = useMemo(() => buildDeptTree(departments), [departments])

  async function addSubgroup() {
    if (!subgroupName.trim()) return
    setSaving(true)
    try {
      await createDepartment({ name: subgroupName.trim(), parentId: parentId || null })
      setSubgroupName('')
      setParentId('')
      await reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageSection className="space-y-4">
      <div>
        <h3 className="text-[14px] font-medium">{t('team.subgroupsTitle')}</h3>
        <p className="mt-1 text-[12px] text-ink-2">{t('team.subgroupsHelp')}</p>
      </div>
      {canWrite && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] text-ink-2" htmlFor="subgroup-name">
              {t('team.subgroupName')}
            </label>
            <Input
              id="subgroup-name"
              placeholder={t('team.subgroupPlaceholder')}
              value={subgroupName}
              onChange={(e) => setSubgroupName(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] text-ink-2" htmlFor="subgroup-parent">
              {t('team.parentLabel')}
            </label>
            <select
              id="subgroup-parent"
              className="h-[36px] w-full rounded-[7px] border border-line bg-surface px-3 text-[13px] text-ink"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">{t('team.topLevel')}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="brand" disabled={saving || !subgroupName.trim()} onClick={() => void addSubgroup()}>
            {t('team.createSubgroup')}
          </Button>
        </div>
      )}
      <DeptTree nodes={tree} />
    </PageSection>
  )
}
