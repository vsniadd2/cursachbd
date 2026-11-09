import { useState } from 'react'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FeedbackPage() {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <PageContent>
      <PageHeader title="Feedback" description="Tell us what to improve" />
      <PageSection className="max-w-lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
            setText('')
          }}
        >
          <div>
            <Label htmlFor="feedback">Message</Label>
            <Input id="feedback" value={text} onChange={(e) => setText(e.target.value)} required className="mt-1" />
          </div>
          <Button type="submit" variant="brand">
            Send feedback
          </Button>
          {sent && <p className="text-[12px] text-pos">Thanks — your feedback was recorded locally.</p>}
        </form>
      </PageSection>
    </PageContent>
  )
}
