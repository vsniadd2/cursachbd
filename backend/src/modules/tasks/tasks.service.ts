import type { TaskStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { createTaskSchema, updateTaskSchema } from './tasks.schema.js'
import type { z } from 'zod'

export async function listTasks(filters: { status?: TaskStatus; projectId?: string }) {
  return prisma.task.findMany({
    where: { status: filters.status, projectId: filters.projectId },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createTask(data: z.infer<typeof createTaskSchema>) {
  return prisma.task.create({
    data,
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  })
}

export async function updateTask(id: string, data: z.infer<typeof updateTaskSchema>) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Task not found')
  return prisma.task.update({
    where: { id },
    data,
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  })
}
