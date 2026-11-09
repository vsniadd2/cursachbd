import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { RoleRow } from '@/types/crm'

export async function fetchRoles() {
  const { data } = await apiClient.get<ApiSuccess<{ items: RoleRow[] }>>('/roles')
  return data.data.items
}
