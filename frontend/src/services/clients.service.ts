import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Client } from '@/types/crm'

export async function fetchClients(status?: string) {
  const { data } = await apiClient.get<ApiSuccess<{ items: Client[] }>>('/clients', {
    params: status ? { status } : undefined,
  })
  return data.data.items
}

export async function createClient(payload: Partial<Client>) {
  const { data } = await apiClient.post<ApiSuccess<{ item: Client }>>('/clients', payload)
  return data.data.item
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const { data } = await apiClient.patch<ApiSuccess<{ item: Client }>>(`/clients/${id}`, payload)
  return data.data.item
}
