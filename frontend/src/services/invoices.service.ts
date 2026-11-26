import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Invoice } from '@/types/crm'

export async function fetchInvoices(params?: { projectId?: string }, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiSuccess<{ items: Invoice[] }>>('/invoices', { params, signal })
  return data.data.items
}
