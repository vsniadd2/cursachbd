import { serializeCsv } from './csv'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
export function useWords() {
  const { i18n } = useTranslation()
  return (ru: string, en: string) => (i18n.language.startsWith('ru') ? ru : en)
}
export function errorText(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Нет связи с сервером / Cannot reach server'
    const data = error.response.data
    if (data?.details) return `${data.error}: ${JSON.stringify(data.details.fieldErrors ?? data.details)}`
    return data?.error ?? error.message
  }
  return error instanceof Error ? error.message : String(error)
}
export function exportCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  download(name, serializeCsv(rows), 'text/csv;charset=utf-8')
}
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
