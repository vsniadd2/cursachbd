import { Link, NavLink, useMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Rocket, ChevronRight, PanelLeft, PanelLeftClose } from 'lucide-react'
import { NAVIGATION, SECTION_LABEL_KEYS, type NavItemConfig, type NavSection } from '@/config/navigation'
import { useNavBadges } from '@/hooks/useNavBadges'
import { cn } from '@/lib/utils'

export function SidebarNav({
  onNavigate,
  showCollapse = true,
  compact = false,
  onToggleCompact,
  className,
}: {
  onNavigate?: () => void
  showCollapse?: boolean
  compact?: boolean
  onToggleCompact?: () => void
  className?: string
}) {
  const { t } = useTranslation('nav')
  const { t: tc } = useTranslation('common')
  const badges = useNavBadges()
  const sections: NavSection[] = ['main', 'sales', 'tools', 'team']
  const footer = NAVIGATION.filter((n) => n.section === 'footer')

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-shell', className)}>
      <div
        className={cn(
          'border-b border-line bg-shell py-3',
          compact ? 'flex flex-col items-center gap-2 px-2' : 'flex items-center gap-[8px] px-3',
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className={cn(
            'rounded-[8px] text-ink outline-none transition-colors duration-150 hover:bg-surface/80 focus-visible:ring-2 focus-visible:ring-brand/40',
            compact
              ? 'grid shrink-0 place-items-center p-1'
              : 'flex min-w-0 flex-1 items-center gap-[8px]',
          )}
          aria-label={t('dashboardAria')}
          title={t('toDashboard')}
        >
          <LogoMark />
          {!compact && (
            <div className="min-w-0 text-left">
              <p className="text-[19px] leading-[1.05] font-medium tracking-[-0.01em]">Flexora</p>
              <p className="text-[9.5px] text-ink-2">{tc('growthPlan')}</p>
            </div>
          )}
        </Link>
        {showCollapse && onToggleCompact && (
          <button
            type="button"
            aria-label={compact ? t('expandMenu') : t('collapseMenu')}
            title={compact ? t('expandMenu') : t('collapseMenu')}
            onClick={onToggleCompact}
            className="hidden size-[24px] shrink-0 place-items-center rounded-[6px] text-ink transition-colors hover:bg-surface lg:grid"
          >
            {compact ? (
              <PanelLeftClose className="size-[16px]" strokeWidth={1.6} />
            ) : (
              <PanelLeft className="size-[16px]" strokeWidth={1.6} />
            )}
          </button>
        )}
      </div>

      <div className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto py-2', compact ? 'px-1' : 'px-2')}>
        {sections.map((section, idx) => (
          <Section key={section} label={t(SECTION_LABEL_KEYS[section])} first={idx === 0} compact={compact}>
            {NAVIGATION.filter((n) => n.section === section).map((item) => (
              <NavItem
                key={item.path}
                item={item}
                badge={badgeFor(item, badges)}
                onNavigate={onNavigate}
                compact={compact}
              />
            ))}
          </Section>
        ))}

        <div className={cn('mt-auto border-t border-line', compact ? 'pt-2' : 'pt-4')}>
          {footer.map((item) => (
            <NavItem key={item.path} item={item} roomy onNavigate={onNavigate} compact={compact} />
          ))}
          <Link
            to="/pricing"
            onClick={onNavigate}
            title={t('upgradeTitle')}
            className={cn(
              'mt-[13px] flex w-full items-center rounded-[10px] border border-line bg-surface text-left transition-colors duration-150 hover:bg-shell',
              compact ? 'justify-center p-[7px]' : 'gap-[12px] p-[7px] pr-[12px]',
            )}
          >
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-brand text-white">
              <Rocket className="size-[16px]" strokeWidth={1.7} />
            </span>
            {!compact && (
              <>
                <span className="flex-1 text-[12.5px] leading-[1.25] text-ink">
                  {t('upgradeLine1')}
                  <br />
                  {t('upgradeLine2')}
                </span>
                <ChevronRight className="size-[15px] stroke-ink" strokeWidth={1.8} />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}

function badgeFor(item: NavItemConfig, badges: ReturnType<typeof useNavBadges>) {
  if (!item.badgeKey) return undefined
  return badges[item.badgeKey]
}

function Section({
  label,
  first,
  compact,
  children,
}: {
  label: string
  first?: boolean
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={first || compact ? '' : 'border-t border-line'}>
      {!compact && (
        <p
          className={cn(
            'px-[9px] text-[9.5px] tracking-[0.02em] text-ink-2 uppercase',
            first ? 'pt-4 pb-[11px]' : 'px-[12px] pt-[19px] pb-[6px]',
          )}
        >
          {label}
        </p>
      )}
      {compact && !first && <div className="my-2 border-t border-line" />}
      <nav className={compact ? 'pb-1' : 'pb-[11px]'}>{children}</nav>
    </div>
  )
}

function NavItem({
  item,
  badge,
  roomy,
  compact,
  onNavigate,
}: {
  item: NavItemConfig
  badge?: number
  roomy?: boolean
  compact?: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation('nav')
  const label = t(item.labelKey)
  const Icon = item.icon
  const match = useMatch({ path: item.path, end: item.path === '/dashboard' })
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      onClick={onNavigate}
      title={label}
      className={({ isActive }) =>
        cn(
          'relative flex w-full items-center rounded-[9px] border text-left text-[12.5px] transition-colors duration-150',
          compact
            ? 'mb-1 h-[37px] justify-center gap-0 border-transparent px-0'
            : 'gap-[9px] px-[12px]',
          !compact && isActive && 'mb-[8px] h-[37px] border-line bg-surface text-ink',
          !compact && !isActive && (roomy ? 'h-[28px]' : 'h-[27px]'),
          compact && isActive && 'border-line bg-surface text-ink',
          !isActive && 'border-transparent text-ink hover:bg-surface/70',
        )
      }
    >
      {match && (
        <span
          className={cn(
            'pointer-events-none absolute top-1/2 h-[38px] w-[3px] -translate-y-1/2 rounded-r-full bg-brand',
            compact ? '-left-[5px]' : '-left-[10px]',
          )}
        />
      )}
      <span className="relative shrink-0">
        <Icon className="size-[14px]" strokeWidth={1.6} />
        {compact && badge != null && (
          <span className="absolute -top-0.5 -right-0.5 size-[6px] rounded-full bg-brand" aria-hidden />
        )}
      </span>
      {!compact && <span className="flex-1 truncate">{label}</span>}
      {!compact && badge != null && (
        <span className="rounded-[4px] bg-[#ececee] px-[5px] py-[1px] text-[9.5px] tabular text-ink">{badge}</span>
      )}
    </NavLink>
  )
}

function LogoMark() {
  const rays = Array.from({ length: 11 }, (_, i) => -180 + (i * 180) / 10)
  return (
    <span className="grid size-[30px] shrink-0 place-items-center overflow-hidden rounded-[7px] bg-brand">
      <svg viewBox="0 0 30 30" className="size-[30px]">
        {rays.map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={15 + Math.cos(r) * 4}
              y1={17 + Math.sin(r) * 4}
              x2={15 + Math.cos(r) * 12}
              y2={17 + Math.sin(r) * 12}
              stroke="white"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          )
        })}
        {[20, 45, 70, 110, 135, 160].map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={15 + Math.cos(r) * 4}
              y1={17 + Math.sin(r) * 4}
              x2={15 + Math.cos(r) * 9}
              y2={17 + Math.sin(r) * 9}
              stroke="white"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    </span>
  )
}
