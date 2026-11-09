import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TeamUser } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { getOrgPositionLabel } from '@/components/team/teamOrgHierarchy'
import { cn } from '@/lib/utils'

function initials(user: TeamUser) {
  return `${user.firstName.charAt(0) || ''}${user.lastName.charAt(0) || ''}`.toUpperCase()
}

function displayName(user: TeamUser) {
  return user.lastName.length <= 4 ? `${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName}`
}

type Props = {
  user: TeamUser
  directReportCount: number
  totalReportCount: number
  onClose: () => void
  className?: string
}

export function TeamPersonDetailPanel({ user, directReportCount, totalReportCount, onClose, className }: Props) {
  const { t } = useTranslation('pages')
  const position = getOrgPositionLabel(user, directReportCount, t)
  const dept = user.department?.name
    ? t(`team.deptLabels.${user.department.name}`, { defaultValue: user.department.name })
    : t('team.noGroup')

  const rows = [
    { label: t('team.org.panel.position'), value: position },
    { label: t('team.subgroup'), value: dept },
    { label: t('team.org.panel.location'), value: t('team.org.panel.remote') },
    {
      label: t('team.manager'),
      value: user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : t('team.noManager'),
    },
    { label: t('team.org.panel.directReports'), value: String(directReportCount) },
    {
      label: t('team.org.panel.totalReports'),
      value: totalReportCount > 0 ? String(totalReportCount) : '—',
    },
    { label: t('team.invite.email'), value: user.email },
    { label: t('team.publicCode'), value: user.publicCode },
  ]

  return (
    <aside
      className={cn(
        'absolute inset-y-0 right-0 z-30 flex w-full max-w-[360px] flex-col border-l border-line bg-surface shadow-[-12px_0_40px_rgba(23,23,26,0.08)]',
        className,
      )}
      role="dialog"
      aria-label={t('team.org.panel.title')}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[13px] font-medium text-ink">{t('team.org.panel.title')}</span>
        <button type="button" className="rounded-[8px] border border-line p-1.5" onClick={onClose} aria-label={t('team.invite.close')}>
          <X className="size-4" />
        </button>
      </div>

      <div className="border-b border-line px-4 py-4">
        <h3 className="text-[18px] font-medium tracking-[-0.02em] text-ink">{displayName(user)}</h3>
        <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-line bg-shell/50 p-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e8e9ec] text-[14px] font-medium text-ink-2">
            {initials(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{displayName(user)}</p>
            <p className="text-[12px] text-ink-2">{position}</p>
          </div>
          <Button variant="brand" asChild className="h-8 shrink-0 rounded-[8px] px-3 text-[11px]">
            <Link to="/settings">{t('team.org.panel.viewProfile')}</Link>
          </Button>
        </div>
      </div>

      <dl className="flex-1 overflow-y-auto px-4 py-2">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn('grid grid-cols-[1fr_1.2fr] gap-2 border-b border-line/70 py-3 text-[12px]', i === 0 && 'border-t')}
          >
            <dt className="text-ink-2">{row.label}</dt>
            <dd className="break-all text-right font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}