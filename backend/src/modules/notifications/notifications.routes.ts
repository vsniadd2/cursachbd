import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { RequestHandler } from 'express'

const list: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.sub) throw new ApiError(401, 'Unauthorized')
    const items = await prisma.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ success: true, data: { items } })
  } catch (e) {
    next(e)
  }
}

const markRead: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.sub) throw new ApiError(401, 'Unauthorized')
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0]
    if (!id) throw new ApiError(400, 'Invalid id')
    await prisma.notification.updateMany({
      where: { id, userId: req.user.sub },
      data: { readAt: new Date() },
    })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export const notificationsRouter = Router()
notificationsRouter.use(authenticate)
notificationsRouter.get('/', list)
notificationsRouter.patch('/:id/read', markRead)
