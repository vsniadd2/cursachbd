import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Task } from '@/types/crm'

export async function fetchTasks(params?: { status?: string; projectId?: string }, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiSuccess<{ items: Task[] }>>('/tasks', { params, signal })
  return data.data.items
}

export async function createTask(payload: Pick<Task, 'projectId' | 'title'> & Partial<Task>) {
  const { data } = await apiClient.post<ApiSuccess<{ item: Task }>>('/tasks', payload)
  return data.data.item
}

export async function updateTask(id: string, payload: Partial<Task>) {
  const { data } = await apiClient.patch<ApiSuccess<{ item: Task }>>(`/tasks/${id}`, payload)
  return data.data.item
}
