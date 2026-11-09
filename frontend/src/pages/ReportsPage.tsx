import { useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { REPORT_TEMPLATES } from '@/mocks/marketing'

export function ReportsPage() {
  const [message, setMessage] = useState<string | null>(null)

  return (
    <PageContent>
      <PageHeader title="Reports" description="Export business snapshots" />
      <div className="grid gap-3">
        {REPORT_TEMPLATES.map((r) => (
          <PageSection key={r.id} className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13px] font-medium">{r.name}</p>
              <p className="text-[11px] text-ink-2">{r.period}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMessage(`Report "${r.name}" queued for export.`)}
            >
              Export
            </Button>
          </PageSection>
        ))}
      </div>
      {message && <p className="mt-4 text-[12px] text-pos">{message}</p>}
    </PageContent>
  )
}
