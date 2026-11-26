import { useTranslation } from 'react-i18next'
import { LandingReveal } from './LandingReveal'
export function LandingDashboardMock() {
  const { t, i18n } = useTranslation('landing')
  const ru = i18n.resolvedLanguage?.startsWith('ru')

  const metrics = ru
    ? ['Клиенты', 'Проекты', 'Задачи', 'В работе', 'Бюджет', 'Выполнено']
    : ['Clients', 'Projects', 'Tasks', 'Active', 'Budget', 'Completed']
  return (
    <LandingReveal>
      <div className="lp-dashboard-stage">
        <span className="lp-annotation lp-annotation-left">
          {t('keitaro.dashboard.float1t')}
          <svg viewBox="0 0 90 45">
            <path d="M5 5Q30 40 80 25m-13-5 13 5-10 10" />
          </svg>
        </span>
        <span className="lp-annotation lp-annotation-right">
          {t('keitaro.dashboard.float2t')}
          <svg viewBox="0 0 90 45">
            <path d="M85 5Q55 40 10 25m13-5-13 5 10 10" />
          </svg>
        </span>
        <div className="lp-dashboard">
          <div className="lp-report-head">
            <strong>Flexora Dashboard</strong>
            <span>{ru ? 'Этот месяц' : 'This month'} ⌄</span>
          </div>
          <div className="lp-metrics">
            {metrics.map((m, i) => (
              <div key={m}>
                <span>{m}</span>
                <strong>{['128', '24', '342', '18', '$42,860', '89%'][i]}</strong>
              </div>
            ))}
          </div>
          <div className="lp-chart">
            <div className="lp-chart-axis">
              <span>40k</span>
              <span>30k</span>
              <span>20k</span>
              <span>10k</span>
            </div>
            <svg
              viewBox="0 0 800 210"
              role="img"
              aria-label={ru ? 'Пример графика проектов и выручки' : 'Sample project and revenue chart'}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lp-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="var(--color-brand)" stopOpacity=".3" />
                  <stop offset="1" stopColor="var(--color-brand)" stopOpacity=".02" />
                </linearGradient>
              </defs>
              {[40, 90, 140, 190].map((y) => (
                <path key={y} d={`M0 ${y}H800`} stroke="var(--color-line)" />
              ))}
              <path
                d="M0 160C70 160 70 70 150 90S270 165 340 100S450 130 520 75S650 85 700 40S770 35 800 15V210H0Z"
                fill="url(#lp-chart-fill)"
              />
              <path
                className="lp-chart-line"
                pathLength="1"
                d="M0 160C70 160 70 70 150 90S270 165 340 100S450 130 520 75S650 85 700 40S770 35 800 15"
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth="3"
              />
              <path
                d="M0 180C100 170 140 130 220 150S320 185 400 145S540 130 600 115S740 135 800 80"
                fill="none"
                stroke="var(--color-brand-3)"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="lp-chart-months">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div className="lp-dashboard-tables">
            {[0, 1].map((group) => (
              <div key={group}>
                <div className="lp-mini-toolbar">
                  <span>{group === 0 ? (ru ? 'Проекты' : 'Projects') : ru ? 'Команда' : 'Team'}</span>
                  <span>{ru ? 'Статус' : 'Status'}</span>
                </div>
                {(group === 0
                  ? ['Platform Revamp', 'Discovery Sprint', 'Client Onboarding']
                  : ['Engineering', 'Design', 'Sales']
                ).map((name, i) => (
                  <div className="lp-dash-row" key={name}>
                    <span>{name}</span>
                    <i style={{ width: `${45 + i * 12}%` }} />
                    <span>{[82, 64, 91][i]}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingReveal>
  )
}
