export type Campaign = { id: string; name: string; status: string; reach: number }
export type Automation = { id: string; name: string; enabled: boolean; triggers: number }
export type Integration = { id: string; name: string; connected: boolean; category: string }

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Q2 Product Launch', status: 'Live', reach: 12400 },
  { id: '2', name: 'Win-back inactive', status: 'Draft', reach: 0 },
]

export const INITIAL_AUTOMATIONS: Automation[] = [
  { id: '1', name: 'Lead nurture sequence', enabled: true, triggers: 842 },
  { id: '2', name: 'Invoice reminder', enabled: true, triggers: 126 },
  { id: '3', name: 'Task due SLA', enabled: false, triggers: 0 },
]

export const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'slack', name: 'Slack', connected: true, category: 'Communication' },
  { id: 'github', name: 'GitHub', connected: true, category: 'Development' },
  { id: 'stripe', name: 'Stripe', connected: false, category: 'Payments' },
]

export const REPORT_TEMPLATES = [
  { id: 'pipeline', name: 'Pipeline summary', period: 'Monthly' },
  { id: 'revenue', name: 'Revenue breakdown', period: 'Quarterly' },
  { id: 'team', name: 'Team utilization', period: 'Weekly' },
]

export const FORECAST_SERIES = [
  { month: 'Jan', actual: 12, projected: 14 },
  { month: 'Feb', actual: 14, projected: 15 },
  { month: 'Mar', actual: 16, projected: 17 },
  { month: 'Apr', actual: 18, projected: 19 },
  { month: 'May', actual: 20, projected: 22 },
  { month: 'Jun', actual: 0, projected: 24 },
]
