import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'

export function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
        <Link to="/" className="shrink-0">
          <BrandLogo subtitle="CRM и аналитика" />
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild className="h-[37px]">
            <Link to="/login">Войти</Link>
          </Button>
          <Button variant="brand" asChild className="h-[37px]">
            <Link to="/register">Регистрация</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
