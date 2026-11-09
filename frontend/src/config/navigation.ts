import type { LucideIcon } from 'lucide-react'
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
  label: string
  section: NavSection
  icon: LucideIcon
  badgeKey?: 'tasks' | 'email' | 'team' | 'roles'
}

const entries: Omit<NavItemConfig, 'section'>[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/leads', label: 'Leads', icon: Database },
  { path: '/deals', label: 'Deals', icon: Newspaper },
  { path: '/customers', label: 'Customers', icon: User },
  { path: '/pipeline', label: 'Pipeline', icon: Workflow },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare, badgeKey: 'tasks' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/revenue', label: 'Revenue', icon: CircleDollarSign },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
  { path: '/forecast', label: 'Forecast', icon: LineChart },
  { path: '/automation', label: 'Automation', icon: GitFork },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/email-marketing', label: 'Email Marketing', icon: Mail, badgeKey: 'email' },
  { path: '/integrations', label: 'Integrations', icon: Network },
  { path: '/team', label: 'Team Members', icon: Users, badgeKey: 'team' },
  { path: '/roles', label: 'Roles & Permissions', icon: Contact, badgeKey: 'roles' },
  { path: '/help', label: 'Help Center', icon: Info },
  { path: '/feedback', label: 'FeedBack', icon: MessageCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const sectionByLabel: Record<string, NavSection> = {
  Dashboard: 'main',
  Leads: 'main',
  Deals: 'main',
  Customers: 'main',
  Pipeline: 'main',
  Tasks: 'main',
  Analytics: 'sales',
  Revenue: 'sales',
  Reports: 'sales',
  Forecast: 'sales',
  Automation: 'tools',
  Campaigns: 'tools',
  'Email Marketing': 'tools',
  Integrations: 'tools',
  'Team Members': 'team',
  'Roles & Permissions': 'team',
  'Help Center': 'footer',
  FeedBack: 'footer',
  Settings: 'footer',
}

export const NAVIGATION: NavItemConfig[] = entries.map((e) => ({
  ...e,
  section: sectionByLabel[e.label] ?? 'main',
}))

export const NAV_BY_PATH = Object.fromEntries(NAVIGATION.map((n) => [n.path, n])) as Record<string, NavItemConfig>

export const SECTION_LABELS: Record<Exclude<NavSection, 'footer'>, string> = {
  main: 'Main Menu',
  sales: 'Sales',
  tools: 'Tools',
  team: 'Team & Collaboration',
}

export function getPageMeta(pathname: string): { title: string; subtitle: string } {
  const item = NAV_BY_PATH[pathname] ?? NAVIGATION[0]
  const subtitles: Record<string, string> = {
    '/dashboard': 'Growth Overview',
    '/leads': 'Qualify and convert prospects',
    '/customers': 'Active client relationships',
    '/tasks': 'Assignments across projects',
    '/revenue': 'Invoices and billing',
    '/settings': 'Account and preferences',
  }
  return {
    title: item.label === 'Dashboard' ? 'Dashboard' : item.label,
    subtitle: subtitles[pathname] ?? `Manage ${item.label.toLowerCase()}`,
  }
}
