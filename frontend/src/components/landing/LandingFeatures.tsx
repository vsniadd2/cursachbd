import { BarChart3, CircleDollarSign, Database, Workflow } from 'lucide-react'

const FEATURES = [
  {
    icon: Database,
    title: 'Leads и клиенты',
    description: 'Квалифицируйте лиды, ведите активных клиентов и историю контактов в единых списках.',
  },
  {
    icon: Workflow,
    title: 'Pipeline',
    description: 'Стадии сделок и проектов на одном экране — от первого контакта до закрытия.',
  },
  {
    icon: BarChart3,
    title: 'Analytics и отчёты',
    description: 'Обзор метрик, прогнозов и отчётов для решений на основе данных, а не догадок.',
  },
  {
    icon: CircleDollarSign,
    title: 'Revenue',
    description: 'Счета и выручка рядом с воронкой — финансы видны в контексте продаж.',
  },
] as const

export function LandingFeatures() {
  return (
    <section className="border-t border-line bg-shell/40 px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 max-w-[520px]">
          <h2 className="text-[26px] font-medium tracking-[-0.015em] text-ink lg:text-[28px]">
            Что внутри Flexora
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
            Те же разделы, что в боковом меню панели: продажи, задачи, маркетинг и команда — в знакомом интерфейсе
            Flexora.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface p-5 transition-shadow duration-150 hover:shadow-[0_8px_30px_rgba(23,23,26,0.06)]"
            >
              <span className="grid size-10 place-items-center rounded-[10px] border border-line bg-brand-soft text-brand">
                <Icon className="size-[18px]" strokeWidth={1.6} />
              </span>
              <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
              <p className="text-[13px] leading-[1.5] text-ink-2">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
