import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { RoleRow } from '@/types/crm'

export async function fetchRoles() {
  const { data } = await apiClient.get<ApiSuccess<{ items: RoleRow[] }>>('/roles')
  return data.data.items
}

export async function createRole(body: { name: string; description?: string | null; permissions: string[] }) {
  const { data } = await apiClient.post<ApiSuccess<RoleRow>>('/roles', body)
  return data.data
}

export async function updateRole(roleId: string, body: { description?: string | null; permissions?: string[] }) {
  const { data } = await apiClient.patch<ApiSuccess<RoleRow>>(`/roles/${roleId}`, body)
  return data.data
}

export async function deleteRole(roleId: string) {
  await apiClient.delete(`/roles/${roleId}`)
}
