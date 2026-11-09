import type { LucideIcon } from 'lucide-react'
import type { TFunction } from 'i18next'
import {
  LayoutGrid,
  Database,
  Newspaper,
  User,
  Workflow,
  CheckSquare,
  BarChart3,
  CircleDollarSign,
  BarChart2,
  LineChart,
  GitFork,
  Megaphone,
  Mail,
  Network,
  Users,
  Contact,
  Info,
  MessageCircle,
  Settings,
} from 'lucide-react'

export type NavSection = 'main' | 'sales' | 'tools' | 'team' | 'footer'

export type NavItemConfig = {
  path: string
  labelKey: string
  section: NavSection
  icon: LucideIcon
  badgeKey?: 'tasks' | 'email' | 'team' | 'roles'
}

const entries: Omit<NavItemConfig, 'section'>[] = [
  { path: '/dashboard', labelKey: 'items.dashboard', icon: LayoutGrid },
  { path: '/leads', labelKey: 'items.leads', icon: Database },
  { path: '/deals', labelKey: 'items.deals', icon: Newspaper },
  { path: '/customers', labelKey: 'items.customers', icon: User },
  { path: '/pipeline', labelKey: 'items.pipeline', icon: Workflow },
  { path: '/tasks', labelKey: 'items.tasks', icon: CheckSquare, badgeKey: 'tasks' },
  { path: '/analytics', labelKey: 'items.analytics', icon: BarChart3 },
  { path: '/revenue', labelKey: 'items.revenue', icon: CircleDollarSign },
  { path: '/reports', labelKey: 'items.reports', icon: BarChart2 },
  { path: '/forecast', labelKey: 'items.forecast', icon: LineChart },
  { path: '/automation', labelKey: 'items.automation', icon: GitFork },
  { path: '/campaigns', labelKey: 'items.campaigns', icon: Megaphone },
  { path: '/email-marketing', labelKey: 'items.emailMarketing', icon: Mail, badgeKey: 'email' },
  { path: '/integrations', labelKey: 'items.integrations', icon: Network },
  { path: '/team', labelKey: 'items.team', icon: Users, badgeKey: 'team' },
  { path: '/roles', labelKey: 'items.roles', icon: Contact, badgeKey: 'roles' },
  { path: '/help', labelKey: 'items.help', icon: Info },
  { path: '/feedback', labelKey: 'items.feedback', icon: MessageCircle },
  { path: '/settings', labelKey: 'items.settings', icon: Settings },
]

const sectionByPath: Record<string, NavSection> = {
  '/dashboard': 'main',
  '/leads': 'main',
  '/deals': 'main',
  '/customers': 'main',
  '/pipeline': 'main',
  '/tasks': 'main',
  '/analytics': 'sales',
  '/revenue': 'sales',
  '/reports': 'sales',
  '/forecast': 'sales',
  '/automation': 'tools',
  '/campaigns': 'tools',
  '/email-marketing': 'tools',
  '/integrations': 'tools',
  '/team': 'team',
  '/roles': 'team',
  '/help': 'footer',
  '/feedback': 'footer',
  '/settings': 'footer',
}

export const NAVIGATION: NavItemConfig[] = entries.map((e) => ({
  ...e,
  section: sectionByPath[e.path] ?? 'main',
}))

export const NAV_BY_PATH = Object.fromEntries(NAVIGATION.map((n) => [n.path, n])) as Record<string, NavItemConfig>

export const SECTION_LABEL_KEYS: Record<Exclude<NavSection, 'footer'>, string> = {
  main: 'sections.main',
  sales: 'sections.sales',
  tools: 'sections.tools',
  team: 'sections.team',
}

export function getPageMeta(pathname: string, t: TFunction<'nav'>): { title: string; subtitle: string } {
  if (pathname === '/pricing') {
    return {
      title: t('pricingPageTitle'),
      subtitle: t('subtitles./pricing'),
    }
  }
  const item = NAV_BY_PATH[pathname] ?? NAVIGATION[0]
  const pageTitle = t(item.labelKey)
  const subtitle = t(`subtitles.${pathname}`, {
    defaultValue: t('subtitles.default', { page: pageTitle }),
  })
  return { title: pageTitle, subtitle }
}
