import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const CAPABILITIES = ['CRM', 'Leads', 'Pipeline', 'Tasks', 'Reports', 'Integrations']

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, var(--color-brand-soft) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, #fff1ea 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 0% 80%, #f7f7f7 0%, transparent 45%)',
        }}
      />
      <div className="relative mx-auto flex max-w-[720px] flex-col items-center gap-8 text-center">
        <p className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
          Платформа для команд продаж
        </p>
        <div className="space-y-4">
          <h1 className="text-balance text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.02em] text-ink">
            Flexora — CRM и рост в одной панели
          </h1>
          <p className="mx-auto max-w-[540px] text-pretty text-[16px] leading-[1.55] text-ink-2 lg:text-[17px]">
            Собирайте лиды, ведите сделки, смотрите выручку и задачи команды — без переключения между десятком
            сервисов. После входа открывается полноэкранная рабочая область.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="brand" asChild className="h-[42px] px-6">
            <Link to="/register">Начать бесплатно</Link>
          </Button>
          <Button variant="outline" asChild className="h-[42px] px-6">
            <Link to="/login">Войти в аккаунт</Link>
          </Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {CAPABILITIES.map((label) => (
            <li
              key={label}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-ink-2"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
