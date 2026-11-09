import { NavLink, useMatch } from 'react-router-dom'
import {
  Rocket,
  ChevronRight,
  PanelLeft,
} from 'lucide-react'
import { NAVIGATION, SECTION_LABELS, type NavItemConfig, type NavSection } from '@/config/navigation'
import { useNavBadges } from '@/hooks/useNavBadges'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const badges = useNavBadges()
  const sections: NavSection[] = ['main', 'sales', 'tools', 'team']
  const footer = NAVIGATION.filter((n) => n.section === 'footer')

  return (
    <aside className="hidden h-full w-[237px] shrink-0 flex-col border-r border-line bg-shell lg:flex">
      <div className="flex items-center gap-[8px] border-b border-line bg-shell px-3 py-3">
        <LogoMark />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] leading-[1.05] font-medium tracking-[-0.01em]">Flexora</p>
          <p className="text-[9.5px] text-ink-2">Growth Plan</p>
        </div>
        <button aria-label="Collapse sidebar" className="grid size-[24px] place-items-center rounded-[6px] text-ink">
          <PanelLeft className="size-[16px]" strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
        {sections.map((section, idx) => (
          <Section key={section} label={SECTION_LABELS[section]} first={idx === 0}>
            {NAVIGATION.filter((n) => n.section === section).map((item) => (
              <NavItem key={item.path} item={item} badge={badgeFor(item, badges)} />
            ))}
          </Section>
        ))}

        <div className="mt-auto border-t border-line pt-4">
          {footer.map((item) => (
            <NavItem key={item.path} item={item} roomy />
          ))}
          <button
            type="button"
            className="mt-[13px] flex w-full items-center gap-[12px] rounded-[10px] border border-line bg-surface p-[7px] pr-[12px] text-left transition-colors duration-150 hover:bg-shell"
          >
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-brand text-white">
              <Rocket className="size-[16px]" strokeWidth={1.7} />
            </span>
            <span className="flex-1 text-[12.5px] leading-[1.25]">
              Upgrade & unlock
              <br />
              all features
            </span>
            <ChevronRight className="size-[15px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function badgeFor(item: NavItemConfig, badges: ReturnType<typeof useNavBadges>) {
  if (!item.badgeKey) return undefined
  return badges[item.badgeKey]
}

function Section({ label, first, children }: { label: string; first?: boolean; children: React.ReactNode }) {
  return (
    <div className={first ? '' : 'border-t border-line'}>
      <p
        className={cn(
          'px-[9px] text-[9.5px] tracking-[0.02em] text-ink-2 uppercase',
          first ? 'pt-4 pb-[11px]' : 'pt-[19px] pb-[6px] px-[12px]',
        )}
      >
        {label}
      </p>
      <nav className="pb-[11px]">{children}</nav>
    </div>
  )
}

function NavItem({
  item,
  badge,
  roomy,
}: {
  item: NavItemConfig
  badge?: number
  roomy?: boolean
}) {
  const Icon = item.icon
  const match = useMatch({ path: item.path, end: item.path === '/dashboard' })
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      className={({ isActive }) =>
        cn(
          'relative flex w-full items-center gap-[9px] rounded-[9px] border px-[12px] text-left text-[12.5px] transition-colors duration-150',
          isActive ? 'mb-[8px] h-[37px] border-line bg-surface text-ink' : roomy ? 'h-[28px]' : 'h-[27px]',
          !isActive && 'border-transparent text-ink hover:bg-surface/70',
        )
      }
    >
      {match && (
        <span className="absolute top-1/2 -left-[10px] h-[38px] w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
      )}
      <Icon className="size-[14px] shrink-0" strokeWidth={1.6} />
      <span className="flex-1 truncate">{item.label}</span>
      {badge != null && (
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
