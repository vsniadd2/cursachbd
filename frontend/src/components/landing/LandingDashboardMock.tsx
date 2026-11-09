import { useTranslation } from 'react-i18next'
import { useLandingTab } from '@/components/landing/LandingTabContext'

const BARS = [72, 55, 88, 40]

export function LandingDashboardMock() {
  const { tab } = useLandingTab()
  const { t } = useTranslation('landing')
  const keys = ['k1', 'k2', 'k3'] as const
  const values = ['v1', 'v2', 'v3'] as const

  return (
    <div className="relative mx-auto w-full max-w-[980px] pb-6 pt-10">
      <div className="landing-float-card absolute left-0 top-0 z-10 hidden w-[220px] text-left md:block">
        <p className="text-[13px] font-medium text-ink">{t('keitaro.dashboard.float1t')}</p>
        <p className="mt-1 text-[12px] leading-snug text-ink-2">{t('keitaro.dashboard.float1d')}</p>
      </div>
      <div className="landing-float-card absolute right-2 top-6 z-10 hidden w-[200px] text-left lg:block">
        <p className="text-[12px] font-medium text-pos">{t('keitaro.dashboard.float3t')}</p>
        <p className="mt-1 text-[12px] text-ink-2">{t('keitaro.dashboard.float3d')}</p>
      </div>
      <div className="landing-float-card absolute bottom-0 right-8 z-10 hidden w-[210px] text-left md:block">
        <p className="text-[13px] font-medium text-ink">{t('keitaro.dashboard.float2t')}</p>
        <p className="mt-1 text-[12px] text-ink-2">{t('keitaro.dashboard.float2d')}</p>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line bg-shell px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[12px] text-ink-2">app.flexora · {t(`keitaro.tabs.${tab}`)}</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[180px_1fr] sm:p-5">
          <aside className="hidden flex-col gap-2 sm:flex">
            {['CRM', 'Projects', 'Tasks', 'Jira'].map((item, i) => (
              <div
                key={item}
                className={`rounded-[8px] px-3 py-2 text-[12px] ${i === 0 ? 'bg-brand-soft font-medium text-brand' : 'text-ink-2'}`}
              >
                {item}
              </div>
            ))}
          </aside>
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {keys.map((k, i) => (
                <div key={k} className="rounded-[10px] border border-line bg-shell/60 p-3 text-left">
                  <p className="text-[11px] text-ink-2">{t(`keitaro.mock.${tab}.${k}`)}</p>
                  <p className="mt-1 text-[20px] font-medium tracking-tight text-ink">
                    {t(`keitaro.mock.${tab}.${values[i]}`)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 rounded-[10px] border border-line p-3">
              {BARS.map((w, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-8 text-[11px] text-ink-3">Q{idx + 1}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
