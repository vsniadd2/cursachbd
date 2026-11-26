import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
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
          <PageSection key={key} className="workspace-interactive max-w-3xl">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {t(`helpFaq.${key}`)}
                <ChevronDown className="size-4 shrink-0 text-brand-strong transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="workspace-enter mt-3 text-sm leading-relaxed text-ink-2">{t(`helpFaq.a${key.slice(1)}`)}</p>
            </details>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
