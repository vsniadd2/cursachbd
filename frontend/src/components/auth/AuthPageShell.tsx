import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@/components/BrandLogo'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'

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
  const { t } = useTranslation('auth')

  return (
    <div className="auth-blob-bg relative min-h-screen overflow-hidden font-sans text-ink">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col items-center justify-center px-5 py-10">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandLogo subtitle={t(subtitleKey)} centered />
          {showLangToggle && <LocaleLangToggle />}
        </div>

        <article className="w-full rounded-[24px] border border-line/90 bg-surface/95 px-6 py-7 shadow-[0_20px_60px_rgba(23,23,26,0.08)] backdrop-blur-md">
          {children}
        </article>

        {footer && <div className="mt-5 w-full">{footer}</div>}
      </div>
    </div>
  )
}
