import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function AuthBackHomeLink() {
  const { t } = useTranslation('auth')

  return (
    <Link
      to="/"
      className="mt-1 block text-center text-[12px] text-ink-2 transition-colors hover:text-brand"
    >
      {t('backHome')}
    </Link>
  )
}
