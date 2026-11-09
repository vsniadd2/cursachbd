import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { TeamUser } from '@/types/crm'

export async function fetchUsers() {
  const { data } = await apiClient.get<ApiSuccess<{ items: TeamUser[] }>>('/users')
  return data.data.items
}
