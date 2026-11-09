import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'

const FAQ_KEYS = ['q1', 'q2', 'q3'] as const

export function HelpPage() {
  const { t } = useTranslation('pages')

  return (
    <PageContent>
      <PageHeader title={t('help.title')} description={t('help.description')} />
      <div className="space-y-3">
        {FAQ_KEYS.map((key) => (
          <PageSection key={key}>
            <p className="text-[13px] font-medium">{t(`helpFaq.${key}`)}</p>
            <p className="mt-1 text-[12px] text-ink-2">{t(`helpFaq.a${key.slice(1)}`)}</p>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
