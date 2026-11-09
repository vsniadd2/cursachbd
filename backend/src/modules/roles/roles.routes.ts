import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import type { RequestHandler } from 'express'
const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.role.findMany({ orderBy: { name: 'asc' } })
    const mapped = items.map((r) => ({
      ...r,
      permissions: Array.isArray(r.permissions)
        ? (r.permissions as string[])
        : [],
    }))
    res.json({ success: true, data: { items: mapped } })
  } catch (e) {
    next(e)
  }
}

export const rolesRouter = Router()
rolesRouter.use(authenticate)
rolesRouter.get('/', list)
