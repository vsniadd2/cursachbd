import { useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { INITIAL_INTEGRATIONS, type Integration } from '@/mocks/marketing'

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(INITIAL_INTEGRATIONS)

  return (
    <PageContent>
      <PageHeader title="Integrations" description="Connected tools" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <PageSection key={i.id} className="flex flex-col gap-3">
            <div>
              <p className="text-[14px] font-medium">{i.name}</p>
              <p className="text-[11px] text-ink-2">{i.category}</p>
            </div>
            <Button
              type="button"
              variant={i.connected ? 'outline' : 'brand'}
              onClick={() =>
                setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, connected: !x.connected } : x)))
              }
            >
              {i.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
