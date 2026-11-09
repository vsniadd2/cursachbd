import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { TeamUser } from '@/types/crm'
import { getOrgPositionLabel } from '@/components/team/teamOrgHierarchy'
import { cn } from '@/lib/utils'

function initials(user: TeamUser) {
  return `${user.firstName.charAt(0) || ''}${user.lastName.charAt(0) || ''}`.toUpperCase()
}

export function TeamOrgPersonCard({
  user,
  directReports = 0,
  totalReports = 0,
  selected = false,
  dimmed = false,
  collapsed = false,
  onSelect,
  onToggleCollapse,
  buttonRef,
  className,
}: {
  user: TeamUser
  /** Прямые подчинённые (назначен managerId на этого человека) */
  directReports?: number
  /** Вся ветка подчинения ниже по дереву */
  totalReports?: number
  selected?: boolean
  dimmed?: boolean
  collapsed?: boolean
  onSelect: () => void
  onToggleCollapse?: () => void
  buttonRef?: (el: HTMLButtonElement | null) => void
  className?: string
}) {
  const { t } = useTranslation('pages')
  const positionLabel = getOrgPositionLabel(user, directReports, t)

  const displayName =
    user.lastName.length <= 4 ? `${user.firstName} ${user.lastName}` : `${user.firstName} ${user.lastName.charAt(0)}.`

  const deptSubtitle = user.department?.name
    ? t(`team.deptLabels.${user.department.name}`, { defaultValue: user.department.name })
    : null

  return (
    <div className={cn('relative flex flex-col items-center', dimmed && 'opacity-40', className)}>
      <button
        type="button"
        data-org-interactive
        ref={buttonRef}
        onClick={onSelect}
        className={cn(
          'team-org-card group relative w-[196px] rounded-[12px] border bg-surface pb-3 pt-8 text-left shadow-[0_2px_12px_rgba(23,23,26,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(23,23,26,0.1)]',
          selected ? 'border-brand border-dashed ring-2 ring-brand/25' : 'border-line',
        )}
      >
        <span className="absolute left-1/2 top-0 z-[2] grid size-[52px] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-[3px] border-surface bg-[#e4e5e9] text-[13px] font-medium text-ink-2">
          {initials(user)}
        </span>
        <p className="px-3 text-center text-[13px] font-semibold leading-snug text-ink">{displayName}</p>
        <p className="mt-0.5 px-3 text-center text-[11px] leading-snug text-ink-2">{positionLabel}</p>
        {deptSubtitle && <p className="mt-0.5 px-3 text-center text-[10px] text-ink-3">{deptSubtitle}</p>}
      </button>

      {directReports > 0 && onToggleCollapse && (
        <button
          type="button"
          data-org-interactive
          className="relative z-[3] -mt-2 flex min-w-[2.25rem] items-center justify-center gap-0.5 rounded-full border border-line bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-medium tabular text-ink-2 shadow-sm hover:bg-surface"
          onClick={(e) => {
            e.stopPropagation()
            onToggleCollapse()
          }}
          aria-expanded={!collapsed}
          title={t('team.org.reportsBadgeTitle', { direct: directReports, total: totalReports })}
          aria-label={t('team.org.reportsBadgeAria', { count: totalReports })}
        >
          <span>{totalReports}</span>
          {collapsed ? <ChevronDown className="size-3 shrink-0" /> : <ChevronUp className="size-3 shrink-0" />}
        </button>
      )}
    </div>
  )
}
