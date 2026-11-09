import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { PermissionCatalog } from '@/types/crm'

export async function fetchPermissionCatalog() {
  const { data } = await apiClient.get<ApiSuccess<PermissionCatalog>>('/permissions/catalog')
  return data.data
}

export async function createCustomPermission(body: {
  slug: string
  label: string
  description?: string | null
}) {
  const { data } = await apiClient.post<
    ApiSuccess<{ id: string; slug: string; label: string; description: string | null }>
  >('/permissions/custom', body)
  return data.data
}

export async function deleteCustomPermission(permissionId: string) {
  await apiClient.delete(`/permissions/custom/${permissionId}`)
}
