import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@/components/BrandLogo'

/** Диапазон скролла (px), за который шапка переходит из крупной в компактную */
const SCROLL_RANGE = 140

export function LandingNav() {
  const { t } = useTranslation('landing')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE))
      setProgress(p)
      raf = 0
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const headerStyle = { '--nav-p': progress } as CSSProperties
  const linkClass =
    'landing-nav-link text-ink-2 font-medium hover:text-ink'

  return (
    <header className="landing-nav-header sticky top-0 z-30" style={headerStyle}>
      <div className="landing-nav-inner mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-5 lg:px-8">
        <Link to="/" className="landing-nav-brand min-w-0 shrink">
          <BrandLogo size="lg" />
        </Link>
        <nav className="landing-nav-links hidden items-center md:flex">
          <a href="#product" className={linkClass}>
            {t('keitaro.nav.product')}
          </a>
          <Link to="/pricing" className={linkClass}>
            {t('keitaro.nav.pricing')}
          </Link>
          <a href="#features" className={linkClass}>
            {t('keitaro.nav.features')}
          </a>
        </nav>
      </div>
    </header>
  )
}
