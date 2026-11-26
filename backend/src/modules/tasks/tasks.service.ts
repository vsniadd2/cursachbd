import type { Prisma, TaskStatus } from '@prisma/client'
import { prisma, teamContext } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { createTaskSchema, updateTaskSchema } from './tasks.schema.js'
import type { z } from 'zod'

const taskRelations = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, firstName: true, lastName: true } },
} as const

export async function listTasks(filters: { status?: TaskStatus; projectId?: string }) {
  return prisma.task.findMany({
    where: { status: filters.status, projectId: filters.projectId },
    include: taskRelations,
    orderBy: { updatedAt: 'desc' },
  })
}

async function validateAssignee(tx: Prisma.TransactionClient, assigneeId?: string | null) {
  if (!assigneeId) return
  const assignee = await tx.user.findFirst({
    where: { id: assigneeId, isActive: true },
    select: { id: true },
  })
  if (!assignee) throw new ApiError(400, 'Assignee must be an active member of your team')
}

async function notifyAssignee(
  tx: Prisma.TransactionClient,
  task: { id: string; title: string; assigneeId: string | null },
  actorId: string,
) {
  if (!task.assigneeId || task.assigneeId === actorId) return
  await tx.notification.create({
    data: {
      userId: task.assigneeId,
      type: 'TASK_ASSIGNED',
      title: 'Task assigned',
      body: task.title,
      entityType: 'Task',
      entityId: task.id,
    },
  })
}

export async function createTask(data: z.infer<typeof createTaskSchema>, actorId: string) {
  return prisma.$transaction(async (tx) => {
    await validateAssignee(tx, data.assigneeId)
    const item = await tx.task.create({ data, include: taskRelations })
    await notifyAssignee(tx, item, actorId)
    const rules = await tx.workspaceItem.findMany({ where: { kind: 'AUTOMATION', status: 'ACTIVE' } })
    for (const rule of rules) {
      await tx.notification.create({
        data: {
          userId: rule.ownerId,
          type: 'TASK',
          title: rule.title,
          body: item.title,
          entityType: 'Task',
          entityId: item.id,
        },
      })
      await tx.workspaceItem.update({ where: { id: rule.id }, data: { runs: { increment: 1 } } })
    }
    return item
  })
}

export async function updateTask(id: string, data: z.infer<typeof updateTaskSchema>, actorId: string) {
  return prisma.$transaction(async (tx) => {
    // Compare against the latest assignment even when two requests update the same task.
    const [existing] = await tx.$queryRaw<{ assigneeId: string | null }[]>`
      SELECT "assigneeId" FROM "Task"
      WHERE "id" = ${id}::uuid AND "teamId" = ${teamContext.getStore()}::uuid
      FOR UPDATE
    `
    if (!existing) throw new ApiError(404, 'Task not found')
    const assignmentChanged = data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId
    if (assignmentChanged) await validateAssignee(tx, data.assigneeId)
    const item = await tx.task.update({ where: { id }, data, include: taskRelations })
    if (assignmentChanged) await notifyAssignee(tx, item, actorId)
    return item
  })
}
