import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Department, TeamUser } from '@/types/crm'

export async function fetchDepartments() {
  const { data } = await apiClient.get<ApiSuccess<{ items: Department[] }>>('/departments')
  return data.data.items
}

export async function createDepartment(payload: { name: string; parentId?: string | null }) {
  const { data } = await apiClient.post<ApiSuccess<Department>>('/departments', payload)
  return data.data
}

export async function assignUserDepartment(userId: string, departmentId: string | null) {
  const { data } = await apiClient.patch<ApiSuccess<TeamUser>>(`/departments/users/${userId}`, {
    departmentId,
  })
  return data.data
}
