import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Project, ProjectDetails, ProjectHistoryEntry, ProjectListItem, ProjectRole } from '@/types/crm'

export type ProjectInput = Pick<
  Project,
  'clientId' | 'name' | 'description' | 'status' | 'priority' | 'budget' | 'startDate' | 'endDate'
>
export type ProjectSort = 'updated' | 'deadline' | 'priority' | 'budget' | 'name'
export type ProjectFilters = {
  status?: Project['status']
  clientId?: string
  leadId?: string
  q?: string
  overdue?: true
  sort?: ProjectSort
}
export type ProjectsPageData = { items: ProjectListItem[]; total: number; page: number; limit: number }
export type ProjectSummary = { total: number; active: number; overdue: number; completed: number }

export async function fetchProjectPage(
  params: ProjectFilters & { page: number; limit: number },
  signal: AbortSignal,
) {
  const { data } = await apiClient.get<ApiSuccess<ProjectsPageData>>('/projects', { params, signal })
  return data.data
}

export async function fetchProjectSummary(clientId: string | undefined, signal: AbortSignal) {
  const { data } = await apiClient.get<ApiSuccess<ProjectSummary>>('/projects/summary', {
    params: { clientId },
    signal,
  })
  return data.data
}

export async function fetchProject(id: string, signal: AbortSignal) {
  const { data } = await apiClient.get<ApiSuccess<{ item: ProjectDetails }>>(`/projects/${id}`, { signal })
  return data.data.item
}

export async function createProject(payload: ProjectInput) {
  const { data } = await apiClient.post<ApiSuccess<{ item: ProjectDetails }>>('/projects', payload)
  return data.data.item
}

export async function updateProject(id: string, payload: Partial<ProjectInput>) {
  const { data } = await apiClient.patch<ApiSuccess<{ item: ProjectDetails }>>(`/projects/${id}`, payload)
  return data.data.item
}

export function deleteProject(id: string) {
  return apiClient.delete(`/projects/${id}`)
}

export async function fetchProjectHistory(id: string, signal: AbortSignal) {
  const { data } = await apiClient.get<ApiSuccess<{ items: ProjectHistoryEntry[] }>>(
    `/projects/${id}/history`,
    { signal },
  )
  return data.data.items
}

export function saveProjectMember(id: string, userId: string, role: ProjectRole) {
  return apiClient.put(`/projects/${id}/members/${userId}`, { role })
}

export function removeProjectMember(id: string, userId: string) {
  return apiClient.delete(`/projects/${id}/members/${userId}`)
}
