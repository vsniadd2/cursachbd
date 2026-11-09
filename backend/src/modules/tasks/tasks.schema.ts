import { z } from 'zod'

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const listTasksQuerySchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']).optional(),
  projectId: z.string().uuid().optional(),
})
