import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { FlexoraChart, CHART_COLORS } from '@/components/charts/FlexoraChart'
import { FORECAST_SERIES } from '@/mocks/marketing'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export function ForecastPage() {
  const { t } = useTranslation('pages')

  return (
    <PageContent>
      <PageHeader title={t('forecast.title')} description={t('forecast.description')} />
      <FlexoraChart title={t('forecast.chart')}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={FORECAST_SERIES}>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_COLORS.ink2 }} />
            <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.ink2 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke={CHART_COLORS.brand} strokeWidth={2} />
            <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.ink2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </FlexoraChart>
    </PageContent>
  )
}
