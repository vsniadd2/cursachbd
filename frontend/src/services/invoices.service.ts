import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Invoice } from '@/types/crm'

export async function fetchInvoices() {
  const { data } = await apiClient.get<ApiSuccess<{ items: Invoice[] }>>('/invoices')
  return data.data.items
}
