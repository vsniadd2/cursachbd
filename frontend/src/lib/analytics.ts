export type MetricRecord = {
  id: string
  status: string
  createdAt?: string
  updatedAt?: string
  paidAt?: string | null
  issuedAt?: string | null
  amount?: string | number
  budget?: string | number | null
  currency?: string
  companyName?: string
  title?: string
  name?: string
}
export function summarize(
  clients: MetricRecord[],
  projects: MetricRecord[],
  tasks: MetricRecord[],
  invoices: MetricRecord[],
  currency: string,
  since = '',
) {
  const recent = (r: MetricRecord) => !since || (r.createdAt ?? '') >= since
  const paid = invoices.filter(
    (r) =>
      r.status === 'PAID' && r.currency === currency && (!since || (r.paidAt ?? r.updatedAt ?? '') >= since),
  )
  const outstanding = invoices.filter(
    (r) => ['SENT', 'OVERDUE'].includes(r.status) && r.currency === currency && recent(r),
  )
  const sum = (rows: MetricRecord[], field: 'amount' | 'budget') =>
    rows.reduce((s, r) => s + Math.round(Number(r[field] ?? 0) * 100), 0) / 100
  const deals = projects.filter(recent),
    won = deals.filter((r) => r.status === 'COMPLETED').length
  const months: { month: string; actual: number; projected?: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 7)
    months.push({
      month,
      actual: sum(
        paid.filter((r) => (r.paidAt ?? r.updatedAt ?? '').startsWith(month)),
        'amount',
      ),
    })
  }
  return {
    leads: clients.filter((r) => r.status === 'LEAD' && recent(r)).length,
    customers: clients.filter((r) => r.status === 'ACTIVE' && recent(r)).length,
    activeDeals: deals.filter((r) => ['PLANNING', 'ACTIVE', 'ON_HOLD'].includes(r.status)).length,
    pipeline: sum(
      deals.filter((r) => ['PLANNING', 'ACTIVE', 'ON_HOLD'].includes(r.status)),
      'budget',
    ),
    won,
    score: deals.some((r) => r.status !== 'CANCELLED')
      ? Math.round((won / deals.filter((r) => r.status !== 'CANCELLED').length) * 100)
      : 0,
    openTasks: tasks.filter((r) => !['DONE', 'CANCELLED'].includes(r.status) && recent(r)).length,
    paid: sum(paid, 'amount'),
    outstanding: sum(outstanding, 'amount'),
    months,
    forecast: Math.round((months.slice(-3).reduce((s, r) => s + r.actual, 0) / 3) * 100) / 100,
  }
}
