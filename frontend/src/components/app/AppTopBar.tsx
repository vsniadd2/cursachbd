import { Bell, Menu, UserCog } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { getPageMeta } from '@/config/navigation'
import { useNavBadges } from '@/hooks/useNavBadges'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'
import { cn } from '@/lib/utils'

const ME = 'https://cdn.magicpatterns.com/patterns/generated-images/8dae5578-0701-4d73-a4d4-7555c1cb3985.jpg'
const TEAM = [
  'https://cdn.magicpatterns.com/patterns/generated-images/03f0f64e-669d-4fc1-b487-0cdac7f2faf8.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/c4ea19ea-7d67-408c-9a63-cbbd98998120.jpg',
]

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
  const teamExtra =
    badges.team != null && badges.team > 2 ? badges.team - 2 : badges.team != null ? Math.max(0, badges.team) : 3

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-6">
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
          <h1 className="truncate text-[17px] leading-tight font-medium tracking-[-0.01em] sm:text-[19px]">{title}</h1>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-2 sm:line-clamp-1 sm:text-[11.5px]">{subtitle}</p>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-[14px]">
        <Link to="/tasks" aria-label={tt('notifications')} className={iconBtn}>
          <Bell className="size-[17px]" strokeWidth={1.6} />
        </Link>
        <LocaleLangToggle size="compact" className="shrink-0" />
        <span className="hidden h-[30px] w-px shrink-0 bg-line sm:block" />
        <Link
          to="/team"
          className="hidden shrink-0 items-center sm:flex"
          aria-label={tt('teamAria')}
          title={tt('teamTitle')}
        >
          {TEAM.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="size-[34px] rounded-full border-2 border-surface object-cover"
              style={{ marginLeft: i ? -12 : 0 }}
            />
          ))}
          <span className="-ml-3 grid size-[34px] place-items-center rounded-full border-2 border-surface bg-brand text-[12px] font-medium text-white tabular">
            +{teamExtra}
          </span>
        </Link>
        <Link
          to="/roles"
          aria-label={tt('rolesAria')}
          title={tt('rolesTitle')}
          className={iconBtn}
        >
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
          <img src={ME} alt={userName} className="size-[40px] rounded-full object-cover" />
        </Link>
      </div>
    </header>
  )
}
