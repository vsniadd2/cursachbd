import { StatCards } from '@/components/StatCards'
import { RevenueChart } from '@/components/RevenueChart'
import { Touchpoints } from '@/components/Touchpoints'
import { LeadActivity } from '@/components/LeadActivity'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartNoAxesCombined, CircleCheck, ClipboardList, Download, RefreshCw, Users } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useCrmData } from '@/hooks/useCrmData'
import { summarize } from '@/lib/analytics'
import { useWords, exportCsv } from '@/lib/product'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { PageContent } from '@/components/app/PageContent'
import { PageFeedback } from '@/components/app/PageFeedback'
import { PageSection } from '@/components/app/PageSection'
import { StatusBadge } from '@/components/app/StatusBadge'
import { ScoreGauge } from '@/components/ScoreGauge'
import { Button } from '@/components/ui/button'
export function DashboardPage() {
  return <MetricsPage mode="dashboard" />
}
export function MetricsPage({ mode }: { mode: 'dashboard' | 'analytics' | 'reports' | 'forecast' }) {
  const data = useCrmData(),
    w = useWords(),
    { user } = useAuth()
  const [currency, setCurrency] = useState('USD'),
    [period, setPeriod] = useState('')
  const [now] = useState(() => Date.now())
  const since = period ? new Date(now - Number(period) * 86400000).toISOString() : ''
  const m = summarize(data.clients, data.projects, data.tasks, data.invoices, currency, since)
  const titles = {
    dashboard: w('Обзор бизнеса', 'Business overview'),
    analytics: w('Аналитика', 'Analytics'),
    reports: w('Отчёты', 'Reports'),
    forecast: w('Прогноз', 'Forecast'),
  }
  const financial = userCan(user, 'invoices:read')
  const canReadClients = userCan(user, 'clients:read')
  const canReadProjects = userCan(user, 'projects:read')
  const canReadTasks = userCan(user, 'tasks:read')
  const money = (n: number, c = currency) =>
    new Intl.NumberFormat(w('ru-RU', 'en-US'), { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n)
  const cards = [
    {
      title: w('Бюджет открытых проектов (USD)', 'Open project budget (USD)'),
      value: money(m.pipeline, 'USD'),
      link: '/projects',
      icon: ChartNoAxesCombined,
      visible: canReadProjects,
    },
    {
      title: w('Лиды / клиенты', 'Leads / customers'),
      value: `${m.leads} / ${m.customers}`,
      link: '/leads',
      icon: Users,
      visible: canReadClients,
    },
    {
      title: w('Завершённые проекты', 'Completed projects'),
      value: m.won,
      link: '/projects?status=COMPLETED',
      icon: CircleCheck,
      visible: canReadProjects,
    },
    {
      title: w('Открытые задачи', 'Open tasks'),
      value: m.openTasks,
      link: '/tasks',
      icon: ClipboardList,
      visible: canReadTasks,
    },
  ].filter((card) => card.visible)
  const reportRows = {
    clients: data.clients.filter((row) => !since || (row.createdAt ?? '') >= since),
    projects: data.projects.filter((row) => !since || (row.createdAt ?? '') >= since),
    tasks: data.tasks.filter((row) => !since || (row.createdAt ?? '') >= since),
    invoices: data.invoices.filter(
      (row) =>
        !since ||
        (row.status === 'PAID'
          ? (row.paidAt ?? row.updatedAt ?? '') >= since
          : (row.createdAt ?? '') >= since),
    ),
  }
  const chart =
    mode === 'forecast'
      ? [...m.months, { month: w('Следующий месяц', 'Next month'), actual: undefined, projected: m.forecast }]
      : m.months
  return (
    <PageContent>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{titles[mode]}</h2>
        <div className="workspace-toolbar flex w-full flex-wrap gap-2 lg:w-auto">
          <select
            aria-label={w('Период', 'Period')}
            className="rounded-lg border border-line bg-surface p-2 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="">{w('Всё время', 'All time')}</option>
            <option value="30">{w('30 дней', '30 days')}</option>
            <option value="90">{w('90 дней', '90 days')}</option>
            <option value="365">{w('365 дней', '365 days')}</option>
          </select>
          <select
            aria-label={w('Валюта', 'Currency')}
            className="rounded-lg border border-line bg-surface p-2 text-sm"
            value={currency}
            disabled={!financial}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {['USD', 'EUR', 'BYN'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Button variant="outline" disabled={data.loading} onClick={() => void data.load()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {w('Обновить', 'Refresh')}
          </Button>
          <Button
            disabled={data.loading || Boolean(data.error) || !data.loaded || (!cards.length && !financial)}
            onClick={() =>
              exportCsv('summary.csv', [
                {
                  currency,
                  period: period || 'all',
                  ...(canReadClients ? { leads: m.leads, customers: m.customers } : {}),
                  ...(canReadProjects ? { completedProjects: m.won, openProjectBudgetUSD: m.pipeline } : {}),
                  ...(financial ? { paid: m.paid, outstanding: m.outstanding } : {}),
                },
              ])
            }
          >
            <Download className="size-4" aria-hidden="true" />
            {w('Экспорт CSV', 'Export CSV')}
          </Button>
        </div>
      </div>
      {data.error && (
        <PageFeedback state="error" className="mb-4">
          {data.error}
        </PageFeedback>
      )}
      {data.loading ? (
        <PageFeedback state="loading">{w('Загрузка…', 'Loading…')}</PageFeedback>
      ) : (
        data.loaded && (
          <>
            {cards.length > 0 && (
              <StatCards metrics={cards} caption={w('За выбранный период', 'Selected period')} />
            )}
            <div className={`mt-5 grid gap-5 ${canReadProjects ? 'xl:grid-cols-[minmax(0,1fr)_351px]' : ''}`}>
              {mode === 'dashboard' && financial ? (
                <RevenueChart series={m.months} currency={currency} />
              ) : (
                <PageSection>
                  <h2 className="mb-5 text-lg">
                    {w('Оплаченная выручка', 'Paid revenue')} · {currency}
                  </h2>
                  {financial ? (
                    <>
                      <div className="mb-5 flex flex-wrap justify-between gap-3">
                        <p>
                          {w('Оплачено', 'Paid')}: <strong>{money(m.paid)}</strong>
                        </p>
                        <p>
                          {w('К оплате', 'Outstanding')}: <strong>{money(m.outstanding)}</strong>
                        </p>
                      </div>
                      <div className="h-72 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chart}>
                            <defs>
                              <pattern
                                id="revenue-hatch"
                                width="10"
                                height="10"
                                patternUnits="userSpaceOnUse"
                                patternTransform="rotate(45)"
                              >
                                <rect width="10" height="10" fill="var(--color-brand-soft)" />
                                <rect width="4" height="10" fill="var(--color-brand-3)" />
                              </pattern>
                            </defs>
                            <CartesianGrid stroke="var(--color-line)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis width={65} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area
                              isAnimationActive={false}
                              name={w('Выручка', 'Revenue')}
                              dataKey="actual"
                              stroke="var(--color-brand)"
                              strokeWidth={2}
                              fill="url(#revenue-hatch)"
                            />
                            <Area
                              isAnimationActive={false}
                              name={w('Прогноз', 'Forecast')}
                              dataKey="projected"
                              stroke="var(--color-brand-strong)"
                              fill="var(--color-brand-3)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      {mode === 'forecast' && (
                        <p className="mt-4 text-sm text-ink-2">
                          {w(
                            'Оценка следующего месяца — средняя оплаченная выручка за последние 3 календарных месяца, включая текущий. Это не гарантия дохода.',
                            'Next month estimate is the average paid revenue over the last 3 calendar months including the current month. It is not guaranteed income.',
                          )}{' '}
                          {money(m.forecast)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      {w(
                        'Для просмотра выручки нужны права invoices:read.',
                        'Revenue requires invoices:read permission.',
                      )}
                    </p>
                  )}
                </PageSection>
              )}
              {canReadProjects && (
                <div>
                  <ScoreGauge score={m.score} />
                  <p className="mt-2 text-xs text-ink-2">
                    {w(
                      'Доля завершённых проектов среди всех неотменённых проектов выбранного периода.',
                      'Completed projects divided by all non-cancelled projects in the selected period.',
                    )}
                  </p>
                </div>
              )}
            </div>
            {mode === 'dashboard' ? (
              canReadClients && (
                <div className="mt-[19px] grid grid-cols-1 gap-[19px] xl:grid-cols-[351px_1fr]">
                  <Touchpoints
                    title={w('Клиенты по статусу', 'Clients by status')}
                    segments={[
                      { label: w('Лиды', 'Leads'), value: m.leads },
                      { label: w('Активные', 'Active'), value: m.customers },
                      {
                        label: w('Неактивные', 'Inactive'),
                        value: data.clients.filter(
                          (r) =>
                            ['INACTIVE', 'CHURNED'].includes(r.status) &&
                            (!since || (r.createdAt ?? '') >= since),
                        ).length,
                      },
                    ]}
                  />
                  <LeadActivity
                    title={w('Создание клиентов по дням недели', 'Client creation by weekday')}
                    activity={[
                      { label: w('Лиды', 'Leads'), status: 'LEAD' },
                      { label: w('Клиенты', 'Customers'), status: 'ACTIVE' },
                      { label: w('Прочие', 'Other'), status: 'OTHER' },
                    ].map((group) => ({
                      label: group.label,
                      values: Array.from(
                        { length: 7 },
                        (_, day) =>
                          data.clients.filter(
                            (r) =>
                              (group.status === 'OTHER'
                                ? ['INACTIVE', 'CHURNED'].includes(r.status)
                                : r.status === group.status) &&
                              (!since || (r.createdAt ?? '') >= since) &&
                              r.createdAt &&
                              new Date(r.createdAt).getUTCDay() === day,
                          ).length,
                      ),
                    }))}
                  />
                </div>
              )
            ) : (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {canReadClients && (
                  <PageSection>
                    <h2 className="mb-3 text-lg">{w('Последние клиенты', 'Recent clients')}</h2>
                    {reportRows.clients.slice(0, 5).map((r) => (
                      <Link
                        className="flex justify-between border-t border-line py-3 text-sm"
                        key={r.id}
                        to="/customers"
                      >
                        <span>{r.companyName}</span>
                        <StatusBadge value={r.status} />
                      </Link>
                    ))}
                    {!reportRows.clients.length && <p>{w('Пока нет клиентов', 'No clients yet')}</p>}
                  </PageSection>
                )}
                {canReadTasks && (
                  <PageSection>
                    <h2 className="mb-3 text-lg">{w('Открытые задачи', 'Open tasks')}</h2>
                    {reportRows.tasks
                      .filter((r) => !['DONE', 'CANCELLED'].includes(r.status))
                      .slice(0, 5)
                      .map((r) => (
                        <Link
                          className="flex justify-between gap-3 border-t border-line py-3 text-sm"
                          key={r.id}
                          to="/tasks"
                        >
                          <span>{r.title}</span>
                          <StatusBadge value={r.status} />
                        </Link>
                      ))}
                    {!m.openTasks && <p>{w('Нет открытых задач', 'No open tasks')}</p>}
                  </PageSection>
                )}
              </div>
            )}
            {mode === 'reports' && (
              <div className="mt-5 flex flex-wrap gap-3">
                {(['clients', 'projects', 'tasks', 'invoices'] as const)
                  .filter((k) => userCan(user, `${k}:read`))
                  .map((k) => (
                    <Button
                      key={k}
                      variant="outline"
                      disabled={Boolean(data.error) || !reportRows[k].length}
                      onClick={() => exportCsv(`${k}.csv`, reportRows[k])}
                    >
                      {k} · CSV
                    </Button>
                  ))}
              </div>
            )}
          </>
        )
      )}
    </PageContent>
  )
}
