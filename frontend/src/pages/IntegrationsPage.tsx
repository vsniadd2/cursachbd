import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { errorText, download, useWords } from '@/lib/product'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageFeedback } from '@/components/app/PageFeedback'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
export function IntegrationsPage() {
  const w = useWords(),
    { user } = useAuth(),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false)
  async function exportData() {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { data } = await apiClient.get('/clients')
      download(
        'clients.json',
        JSON.stringify(
          data.data.items.map((r: Record<string, unknown>) => ({
            companyName: r.companyName,
            contactName: r.contactName ?? '',
            email: r.email ?? '',
            phone: r.phone ?? '',
            status: r.status,
            notes: r.notes ?? '',
          })),
          null,
          2,
        ),
        'application/json',
      )
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function importData(file?: File) {
    if (!file || busy) return
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (file.size > 500000) throw new Error(w('Максимум 500 КБ', 'Maximum 500 KB'))
      let records: unknown
      try {
        records = JSON.parse(await file.text())
      } catch {
        throw new Error(w('Не удалось прочитать JSON-файл.', 'Could not read the JSON file.'))
      }
      if (!Array.isArray(records) || records.length === 0 || records.length > 500) {
        throw new Error(
          w(
            'Файл должен содержать массив из 1–500 записей.',
            'The file must contain an array of 1–500 records.',
          ),
        )
      }
      const { data } = await apiClient.post<{ data: { count: number } }>('/clients/import', {
        items: records,
      })
      setMessage(w(`Импортировано записей: ${data.data.count}`, `Imported records: ${data.data.count}`))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <PageContent>
      <PageHeader
        title={w('Интеграции и обмен данными', 'Integrations and data exchange')}
        description={w(
          'Импорт и экспорт клиентов через JSON. Повторный импорт создаёт новые записи.',
          'Import and export clients with JSON. Reimport creates new records.',
        )}
      />
      {error && (
        <PageFeedback state="error" className="mb-4">
          {error}
        </PageFeedback>
      )}
      {message && (
        <PageFeedback state="success" className="mb-4">
          {message}
        </PageFeedback>
      )}
      <PageSection>
        <h2 className="mb-3 text-lg">JSON</h2>
        <p className="mb-4 text-sm text-ink-2">
          {w(
            'Массив объектов: companyName (обязательно), contactName, email, phone, status, notes. Не более 500 записей. Весь файл проверяется до сохранения.',
            'Array of objects: companyName (required), contactName, email, phone, status, notes. Maximum 500 records. The entire file is validated before saving.',
          )}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button disabled={busy || !userCan(user, 'clients:read')} onClick={() => void exportData()}>
            {w('Скачать клиентов', 'Download clients')}
          </Button>
          {userCan(user, 'clients:write') && (
            <label className="grid min-w-0 gap-1.5 text-sm font-medium">
              {w('Загрузить JSON', 'Upload JSON')}
              <input
                className="w-full max-w-full text-xs file:mr-2 file:rounded-lg file:border file:border-line file:bg-shell file:px-3 file:py-2"
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={(e) => {
                  void importData(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          )}
        </div>
      </PageSection>
      <PageSection className="mt-4">
        <h2 className="mb-2 text-lg">Google · Slack · SMTP</h2>
        <p className="text-sm text-ink-2">
          {w(
            'Внешние провайдеры не подключены. Кампании и письма доступны как локальные записи и черновики.',
            'External providers are not connected. Campaigns and emails are available as local records and drafts.',
          )}
        </p>
      </PageSection>
    </PageContent>
  )
}
