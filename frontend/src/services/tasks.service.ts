import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Task } from '@/types/crm'

export async function fetchTasks(params?: { status?: string }) {
  const { data } = await apiClient.get<ApiSuccess<{ items: Task[] }>>('/tasks', { params })
  return data.data.items
}

export async function updateTask(id: string, payload: Partial<Task>) {
  const { data } = await apiClient.patch<ApiSuccess<{ item: Task }>>(`/tasks/${id}`, payload)
  return data.data.item
}
