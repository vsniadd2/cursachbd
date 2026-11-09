import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingCtaFooter() {
  return (
    <section className="border-t border-line px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 rounded-[16px] border border-line bg-gradient-to-br from-brand-soft via-surface to-surface px-6 py-12 text-center lg:px-12">
        <h2 className="text-[22px] font-medium tracking-[-0.01em] text-ink lg:text-[26px]">
          Готовы открыть панель?
        </h2>
        <p className="max-w-[440px] text-[14px] text-ink-2">
          Войдите или зарегистрируйтесь — после авторизации вы попадёте в рабочую область с дашбордом и всеми
          разделами CRM.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="brand" asChild className="h-[42px] px-6">
            <Link to="/register">Создать аккаунт</Link>
          </Button>
          <Button variant="outline" asChild className="h-[42px] px-6">
            <Link to="/login">Войти</Link>
          </Button>
        </div>
        <p className="text-[11px] text-ink-3">© {new Date().getFullYear()} Flexora</p>
      </div>
    </section>
  )
}
