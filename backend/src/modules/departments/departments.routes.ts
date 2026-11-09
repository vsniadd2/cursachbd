import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import type { RequestHandler } from 'express'

const createSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().nullable().optional(),
})

const assignUserSchema = z.object({
  departmentId: z.string().uuid().nullable(),
})

const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true } },
        parent: { select: { id: true, name: true } },
      },
    })
    res.json({ success: true, data: { items } })
  } catch (e) {
    next(e)
  }
}

const create: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>
    const item = await prisma.department.create({
      data: {
        name: body.name,
        parentId: body.parentId ?? null,
      },
      include: {
        _count: { select: { users: true } },
        parent: { select: { id: true, name: true } },
      },
    })
    res.status(201).json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
}

const assignUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId as string
    const { departmentId } = req.body as z.infer<typeof assignUserSchema>
    const item = await prisma.user.update({
      where: { id: userId },
      data: { departmentId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        role: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })
    res.json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
}

export const departmentsRouter = Router()
departmentsRouter.use(authenticate)
departmentsRouter.get('/', authorize('users:read', '*'), list)
departmentsRouter.post('/', authorize('users:write', '*'), validate({ body: createSchema }), create)
departmentsRouter.patch(
  '/users/:userId',
  authorize('users:write', '*'),
  validate({ body: assignUserSchema }),
  assignUser,
)
