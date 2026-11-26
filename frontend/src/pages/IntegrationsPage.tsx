import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { errorText, download, useWords } from '@/lib/product'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { PageContent } from '@/components/app/PageContent'
import { PageHeader } from '@/components/app/PageHeader'
import { PageSection } from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
export function IntegrationsPage() {
  const w = useWords(),
    { user } = useAuth(),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false)
  async function exportData() {
    setBusy(true)
    setError('')
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
    if (!file) return
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (file.size > 500000) throw new Error(w('Максимум 500 КБ', 'Maximum 500 KB'))
      const records = JSON.parse(await file.text())
      await apiClient.post('/clients/import', { items: records })
      setMessage(w(`Импортировано записей: ${records.length}`, `Imported records: ${records.length}`))
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
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 text-pos">
          {message}
        </p>
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
            <label className="text-sm">
              {w('Загрузить JSON', 'Upload JSON')}
              <input
                className="ml-2"
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
