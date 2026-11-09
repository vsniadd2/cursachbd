import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Project } from '@/types/crm'

export async function fetchProjects(params?: { status?: string; clientId?: string }) {
  const { data } = await apiClient.get<ApiSuccess<{ items: Project[] }>>('/projects', { params })
  return data.data.items
}

export async function updateProject(id: string, payload: Partial<Project>) {
  const { data } = await apiClient.patch<ApiSuccess<{ item: Project }>>(`/projects/${id}`, payload)
  return data.data.item
}
