import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { INITIAL_AUTOMATIONS, type Automation } from '@/mocks/marketing'

export function AutomationPage() {
  const { t } = useTranslation('pages')
  const [items, setItems] = useState<Automation[]>(INITIAL_AUTOMATIONS)

  return (
    <PageContent>
      <PageHeader title={t('automation.title')} description={t('automation.description')} />
      <ul className="space-y-3">
        {items.map((a) => (
          <PageSection key={a.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-[13px] font-medium">{a.name}</p>
              <p className="text-[11px] text-ink-2">{t('automationExtra.runs', { count: a.triggers })}</p>
            </div>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-[11px] ${a.enabled ? 'bg-pos-soft text-pos' : 'bg-cell text-ink-2'}`}
              onClick={() =>
                setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, enabled: !x.enabled } : x)))
              }
            >
              {a.enabled ? t('automationExtra.on') : t('automationExtra.off')}
            </button>
          </PageSection>
        ))}
      </ul>
    </PageContent>
  )
}
