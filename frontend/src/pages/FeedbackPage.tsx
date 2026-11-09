import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FeedbackPage() {
  const { t } = useTranslation('pages')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <PageContent>
      <PageHeader title={t('feedback.title')} description={t('feedback.description')} />
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
            <Label htmlFor="feedback">{t('feedback.message')}</Label>
            <Input id="feedback" value={text} onChange={(e) => setText(e.target.value)} required className="mt-1" />
          </div>
          <Button type="submit" variant="brand">
            {t('feedback.send')}
          </Button>
          {sent && <p className="text-[12px] text-pos">{t('feedback.thanks')}</p>}
        </form>
      </PageSection>
    </PageContent>
  )
}
