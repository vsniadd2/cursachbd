import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { Database, GitBranch, Github, Kanban, MessageSquare, Plug, Users, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'

type OrbitId = 'jira' | 'github' | 'slack' | 'gitlab' | 'tasks' | 'postgres' | 'webhooks' | 'crm'

const ORBIT_ICONS: Record<OrbitId, LucideIcon> = {
  jira: Kanban,
  github: Github,
  slack: MessageSquare,
  gitlab: GitBranch,
  tasks: Workflow,
  postgres: Database,
  webhooks: Plug,
  crm: Users,
}

/** Расположение как у Keitaro: по бокам и углам, не плотным кольцом вокруг заголовка */
const ORBIT_ITEMS: {
  id: OrbitId
  delay: number
  hideMobile?: boolean
  sm: { x: number; y: number }
  md: { x: number; y: number }
  lg: { x: number; y: number }
}[] = [
  { id: 'crm', delay: 0, sm: { x: -132, y: -112 }, md: { x: -280, y: -168 }, lg: { x: -468, y: -188 } },
  { id: 'github', delay: 0.35, hideMobile: true, sm: { x: 122, y: -106 }, md: { x: 268, y: -162 }, lg: { x: 448, y: -178 } },
  { id: 'webhooks', delay: 0.7, sm: { x: -148, y: 10 }, md: { x: -320, y: 8 }, lg: { x: -512, y: 12 } },
  { id: 'slack', delay: 1.05, sm: { x: 138, y: 6 }, md: { x: 308, y: -4 }, lg: { x: 502, y: -8 } },
  { id: 'postgres', delay: 1.4, hideMobile: true, sm: { x: -112, y: 114 }, md: { x: -240, y: 178 }, lg: { x: -388, y: 198 } },
  { id: 'gitlab', delay: 1.75, hideMobile: true, sm: { x: 116, y: 110 }, md: { x: 252, y: 172 }, lg: { x: 418, y: 188 } },
  { id: 'jira', delay: 2.1, sm: { x: -76, y: 138 }, md: { x: -168, y: 218 }, lg: { x: -268, y: 248 } },
  { id: 'tasks', delay: 2.45, hideMobile: true, sm: { x: 80, y: 134 }, md: { x: 178, y: 212 }, lg: { x: 288, y: 242 } },
]

export function LandingHeroOrbit() {
  const { t } = useTranslation('landing')

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {ORBIT_ITEMS.map((item) => {
        const Icon = ORBIT_ICONS[item.id]
        return (
          <div
            key={item.id}
            className={cn('landing-orbit-slot absolute', item.hideMobile && 'hidden sm:block')}
            style={
              {
                '--orbit-x-sm': `${item.sm.x}px`,
                '--orbit-y-sm': `${item.sm.y}px`,
                '--orbit-x-md': `${item.md.x}px`,
                '--orbit-y-md': `${item.md.y}px`,
                '--orbit-x-lg': `${item.lg.x}px`,
                '--orbit-y-lg': `${item.lg.y}px`,
                animationDelay: `${item.delay}s`,
              } as React.CSSProperties
            }
          >
            <div
              className="landing-orbit-card landing-float-card flex w-[84px] flex-col items-center gap-1.5 px-2 py-3 sm:w-[92px]"
              style={{ animationDelay: `${item.delay}s` }}
            >
              <span className="grid size-10 place-items-center rounded-[10px] bg-brand-soft text-brand">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <span className="text-center text-[10px] font-medium leading-tight text-ink-2 sm:text-[11px]">
                {t(`keitaro.hero.orbit.${item.id}`)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
