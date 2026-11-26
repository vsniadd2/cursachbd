import { validateId } from '../../middleware/validate-id.js'
import { ApiError } from '../../utils/api-error.js'
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
departmentsRouter.param('id', validateId)
departmentsRouter.use(authenticate)
departmentsRouter.get('/', authorize('users:read', '*'), list)
departmentsRouter.post('/', authorize('users:write', '*'), validate({ body: createSchema }), create)
departmentsRouter.patch(
  '/users/:userId',
  authorize('users:write', '*'),
  validate({ body: assignUserSchema }),
  assignUser,
)

departmentsRouter.patch(
  '/:id',
  authorize('users:write'),
  validate({ body: createSchema.partial() }),
  async (req, res) => {
    const id = req.params.id as string
    const { name, parentId } = req.body as { name?: string; parentId?: string | null }
    if (parentId) {
      let cursor: string | null = parentId
      const seen = new Set<string>()
      while (cursor) {
        if (cursor === id || seen.has(cursor)) throw new ApiError(400, 'Department hierarchy cycle')
        seen.add(cursor)
        const row: { parentId: string | null } | null = await prisma.department.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        })
        if (!row) throw new ApiError(404, 'Parent department not found')
        cursor = row.parentId
      }
    }
    const item = await prisma.department.update({ where: { id }, data: { name, parentId } })
    res.json({ success: true, data: item })
  },
)
departmentsRouter.delete('/:id', authorize('users:write'), async (req, res) => {
  const id = req.params.id as string
  if (
    (await prisma.user.count({ where: { departmentId: id } })) ||
    (await prisma.department.count({ where: { parentId: id } })) ||
    (await prisma.teamInvite.count({ where: { departmentId: id, status: 'PENDING' } }))
  )
    throw new ApiError(409, 'Department has members, children or pending invites')
  await prisma.department.delete({ where: { id } })
  res.status(204).send()
})
