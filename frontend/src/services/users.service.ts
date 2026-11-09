import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { TeamUser } from '@/types/crm'

export async function fetchUsers(params?: { query?: string; kind?: 'email' | 'publicCode' }) {
  const { data } = await apiClient.get<ApiSuccess<{ items: TeamUser[] }>>('/users', { params })
  return data.data.items
}

export async function patchUser(
  userId: string,
  body: Partial<{
    roleId: string
    departmentId: string | null
    managerId: string | null
    extraPermissions: string[]
    isActive: boolean
  }>,
) {
  const { data } = await apiClient.patch<ApiSuccess<TeamUser>>(`/users/${userId}`, body)
  return data.data
}
