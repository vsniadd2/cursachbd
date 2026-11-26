import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'
import { useWords } from '@/lib/product'
export function AuthPageShell({
  subtitleKey,
  children,
  footer,
  showLangToggle = false,
}: {
  subtitleKey: 'loginSubtitle' | 'registerSubtitle'
  children: ReactNode
  footer?: ReactNode
  showLangToggle?: boolean
}) {
  const w = useWords()
  return (
    <div className="auth-atmosphere relative min-h-screen overflow-hidden font-sans text-ink">
      <div aria-hidden="true" className="auth-atmosphere-light" />
      <div aria-hidden="true" className="auth-atmosphere-grain" />
      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-12">
        <Link to="/" aria-label="Flexora">
          <BrandLogo />
        </Link>
        {showLangToggle && <LocaleLangToggle />}
      </header>
      <main className="relative z-10 mx-auto grid min-h-[calc(100svh-100px)] max-w-[1280px] items-center gap-12 px-5 pb-12 lg:grid-cols-[1fr_460px] lg:px-12">
        <section className="auth-hero-enter hidden max-w-xl pb-24 lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/25 px-4 py-2 text-xs backdrop-blur-md">
            <Sparkles className="size-3.5" />
            {w('Место, где растут идеи', 'A place for what comes next')}
          </div>
          <h2 className="text-[clamp(48px,5vw,76px)] leading-[1.04] font-medium tracking-[-.055em]">
            {w('Всё начинается', 'It all starts')}
            <br />
            {w('с вашей команды.', 'with your team.')}
          </h2>
          <p className="mt-7 max-w-sm text-lg leading-relaxed text-ink-2">
            {w(
              'От первой идеи до большого результата. Клиенты, сделки и люди — в одном пространстве.',
              'From the first spark to your next big milestone. Customers, deals and people, in one space.',
            )}
          </p>
          <div className="mt-14 flex gap-4">
            <span className="grid size-11 place-items-center rounded-full border border-ink/15">
              <ArrowUpRight className="size-5" />
            </span>
            <p className="text-sm leading-relaxed">
              {w('Меньше рутины.', 'Less busywork.')}
              <br />
              <span className="text-ink-2">
                {w('Больше пространства для роста.', 'More room to grow.')}
              </span>
            </p>
          </div>
        </section>
        <div className="auth-card-enter mx-auto w-full max-w-[460px]">
          <article
            className="auth-glass-card rounded-[28px] border border-white/80 bg-white/85 px-6 py-7 shadow-[0_28px_100px_-30px_rgba(112,57,30,.35)] backdrop-blur-2xl sm:px-9 sm:py-9"
            data-auth={subtitleKey}
          >
            {children}
          </article>
          {footer && <div className="mt-5 text-center">{footer}</div>}
          <p className="mt-6 text-center text-[11px] text-ink-2">
            Flexora · {w('Ваш фокус. Ваша команда. Ваш рост.', 'Your focus. Your team. Your growth.')}
          </p>
        </div>
      </main>
    </div>
  )
}
