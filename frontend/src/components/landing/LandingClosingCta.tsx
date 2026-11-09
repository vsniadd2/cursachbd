import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@/components/BrandLogo'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'

type FooterLink = { to: string; label: string }

function FooterColumn({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to} className="text-[14px] text-ink-2 transition-colors hover:text-brand">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function LandingClosingCta() {
  const { t } = useTranslation('landing')
  const year = new Date().getFullYear()

  const columns: FooterLink[][] = [
    [
      { to: '/login', label: t('keitaro.footer.changelog') },
      { to: '/#features', label: t('keitaro.footer.features') },
    ],
    [
      { to: '/#blog', label: t('keitaro.footer.blog') },
      { to: '/login', label: t('keitaro.footer.academy') },
    ],
    [
      { to: '/login', label: t('keitaro.footer.install') },
      { to: '/login', label: t('keitaro.footer.docs') },
      { to: '/login', label: t('keitaro.footer.faq') },
    ],
    [
      { to: 'https://github.com', label: t('keitaro.footer.socialGithub') },
      { to: 'https://linkedin.com', label: t('keitaro.footer.socialLinkedin') },
      { to: 'https://t.me', label: t('keitaro.footer.socialTelegram') },
    ],
    [
      { to: '/login', label: t('keitaro.footer.careers') },
      { to: '/login', label: t('keitaro.footer.contact') },
      { to: '/', label: t('keitaro.footer.about') },
    ],
    [
      { to: '/login', label: t('keitaro.footer.trust') },
      { to: '/login', label: t('keitaro.footer.terms') },
      { to: '/login', label: t('keitaro.footer.privacy') },
    ],
  ]

  return (
    <footer id="closing" className="landing-bg-footer border-t border-line overflow-hidden pt-10 lg:pt-14">
      <div className="landing-container">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/80 pb-8">
          <BrandLogo />
          <div className="hidden flex-wrap items-center gap-6 md:flex">
            <Link to="/#product" className="landing-label text-ink-2 hover:text-brand">
              {t('keitaro.nav.product')}
            </Link>
            <Link to="/login" className="text-[14px] font-medium text-ink-2 hover:text-ink">
              {t('keitaro.footer.help')}
            </Link>
            <Link to="/pricing" className="text-[14px] font-medium text-ink-2 hover:text-ink">
              {t('keitaro.nav.pricing')}
            </Link>
            <Link to="/#blog" className="text-[14px] font-medium text-ink-2 hover:text-ink">
              {t('keitaro.footer.resourcesNav')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LocaleLangToggle />
            <Link to="/login" className="landing-label px-3 text-ink-2 hover:text-ink">
              {t('nav.signIn')}
            </Link>
            <Link to="/register" className="landing-btn-primary !h-10 !px-5 !text-[12px]">
              {t('nav.register')}
            </Link>
          </div>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {columns.map((links, i) => (
            <FooterColumn key={i} links={links} />
          ))}
        </div>

        <p className="relative z-10 pb-2 text-[13px] text-ink-3">{t('keitaro.closing.copyright', { year })}</p>
      </div>

      <div className="landing-container relative pb-6 pt-2">
        <p className="landing-footer-watermark text-center" aria-hidden>
          FLEXORA
        </p>
      </div>
    </footer>
  )
}
