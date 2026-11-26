import { Router } from 'express'
import { validateId } from '../../middleware/validate-id.js'
import { authenticate } from '../../middleware/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'

export const notificationsRouter = Router()
notificationsRouter.param('id', validateId)
notificationsRouter.use(authenticate)

notificationsRouter.get('/', async (req, res) => {
  const { sub: userId, permissions } = req.user!
  const [items, unreadCount] = await prisma.$transaction(
    [
      prisma.notification.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 50,
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ],
    { isolationLevel: 'RepeatableRead' },
  )
  const taskIds = items.flatMap((item) =>
    item.entityType === 'Task' && item.entityId ? [item.entityId] : [],
  )
  const tasks =
    taskIds.length && (permissions.includes('*') || permissions.includes('tasks:read'))
      ? await prisma.task.findMany({
          where: { id: { in: taskIds } },
          select: { id: true, project: { select: { id: true, name: true } } },
        })
      : []
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  res.set('Cache-Control', 'private, no-store')
  res.json({
    success: true,
    data: {
      items: items.map((item) => ({ ...item, task: tasksById.get(item.entityId ?? '') ?? null })),
      unreadCount,
    },
  })
})

notificationsRouter.patch('/read-all', async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.sub, readAt: null },
    data: { readAt: new Date() },
  })
  res.json({ success: true })
})

notificationsRouter.patch('/:id/read', async (req, res) => {
  const where = { id: req.params.id as string, userId: req.user!.sub }
  const result = await prisma.notification.updateMany({
    where: { ...where, readAt: null },
    data: { readAt: new Date() },
  })
  if (!result.count && !(await prisma.notification.findFirst({ where, select: { id: true } }))) {
    throw new ApiError(404, 'Notification not found')
  }
  res.json({ success: true })
})
