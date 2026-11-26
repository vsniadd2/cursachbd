import { NotificationBell } from './NotificationBell'
import { Menu, UserCog, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { getPageMeta } from '@/config/navigation'
import { useNavBadges } from '@/hooks/useNavBadges'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'
import { cn } from '@/lib/utils'

const iconBtn =
  'grid size-[37px] shrink-0 place-items-center rounded-[9px] border border-line bg-surface text-ink transition-colors duration-150 hover:bg-shell'

export function AppTopBar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { pathname } = useLocation()
  const { t } = useTranslation('nav')
  const { t: tt } = useTranslation('topbar')
  const { user } = useAuth()
  const { title, subtitle } = getPageMeta(pathname, t)
  const userName = user ? `${user.firstName} ${user.lastName}` : tt('userFallback')
  const userRole = user?.role.name ?? tt('employeeFallback')
  const badges = useNavBadges()
  const teamExtra = badges.team ?? 0

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3 lg:flex-none">
        <button
          type="button"
          aria-label={tt('openMenu')}
          className={cn(iconBtn, 'lg:hidden')}
          onClick={onOpenMenu}
        >
          <Menu className="size-[17px]" strokeWidth={1.6} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] leading-tight font-medium tracking-[-0.01em] sm:text-[19px]">
            {title}
          </h1>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-2 sm:line-clamp-1 sm:text-[11.5px]">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-[14px]">
        <NotificationBell />
        <LocaleLangToggle size="compact" className="shrink-0" />
        <span className="hidden h-[30px] w-px shrink-0 bg-line sm:block" />
        <Link
          to="/team"
          className="hidden shrink-0 items-center sm:flex"
          aria-label={tt('teamAria')}
          title={tt('teamTitle')}
        >
          <span className="grid size-[34px] place-items-center rounded-full border-2 border-surface bg-shell">
            <Users className="size-4" />
          </span>
          <span className="-ml-3 grid size-[34px] place-items-center rounded-full border-2 border-surface bg-brand text-[12px] font-medium text-white tabular">
            {teamExtra}
          </span>
        </Link>
        <Link to="/roles" aria-label={tt('rolesAria')} title={tt('rolesTitle')} className={iconBtn}>
          <UserCog className="size-[17px]" strokeWidth={1.6} />
        </Link>
        <span className="hidden h-[30px] w-px shrink-0 bg-line sm:block" />
        <Link
          to="/settings"
          className="flex shrink-0 items-center gap-[10px] rounded-[9px] transition-colors hover:bg-shell/80"
          aria-label={tt('profileAria')}
        >
          <div className="hidden text-right sm:block">
            <p className="text-[12.5px] leading-tight">{userName}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-2 uppercase">{userRole}</p>
          </div>
          <span
            aria-label={userName}
            className="grid size-[40px] place-items-center rounded-full bg-brand-soft text-sm font-medium text-brand"
          >
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </span>
        </Link>
      </div>
    </header>
  )
}
