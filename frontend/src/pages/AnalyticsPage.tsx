import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { FlexoraChart, CHART_COLORS } from '@/components/charts/FlexoraChart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const DATA = [
  { name: 'Leads', value: 128 },
  { name: 'Won', value: 36 },
  { name: 'Tasks', value: 84 },
  { name: 'Revenue', value: 52 },
]

export function AnalyticsPage() {
  const { t } = useTranslation('pages')

  return (
    <PageContent>
      <PageHeader title={t('analytics.title')} description={t('analytics.description')} />
      <FlexoraChart title={t('analytics.chart')}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={DATA}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_COLORS.ink2 }} />
            <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.ink2 }} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS.brand} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </FlexoraChart>
    </PageContent>
  )
}
