import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'

const FAQ = [
  { q: 'How do I add a lead?', a: 'Open Leads, enter a company name and click Add lead.' },
  { q: 'How does the pipeline work?', a: 'Click a deal card to advance it to the next stage.' },
  { q: 'Where are invoices?', a: 'Revenue lists all invoices synced from the API.' },
]

export function HelpPage() {
  return (
    <PageContent>
      <PageHeader title="Help center" description="Quick answers" />
      <div className="space-y-3">
        {FAQ.map((f) => (
          <PageSection key={f.q}>
            <p className="text-[13px] font-medium">{f.q}</p>
            <p className="mt-1 text-[12px] text-ink-2">{f.a}</p>
          </PageSection>
        ))}
      </div>
    </PageContent>
  )
}
