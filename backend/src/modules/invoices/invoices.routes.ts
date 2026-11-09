import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { prisma } from '../../lib/prisma.js'
import type { RequestHandler } from 'express'

const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.invoice.findMany({
      include: { client: { select: { companyName: true } }, project: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    })
    res.json({ success: true, data: { items } })
  } catch (e) {
    next(e)
  }
}

export const invoicesRouter = Router()
invoicesRouter.use(authenticate)
invoicesRouter.get('/', list)
