import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import type { RequestHandler } from 'express'

const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { lastName: 'asc' },
    })
    res.json({ success: true, data: { items } })
  } catch (e) {
    next(e)
  }
}

export const usersRouter = Router()
usersRouter.use(authenticate)
usersRouter.get('/', list)
