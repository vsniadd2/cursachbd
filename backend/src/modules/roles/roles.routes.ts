import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import { parsePermissionArray, SYSTEM_ROLE_NAMES } from '../../config/permissions.js'
import type { RequestHandler } from 'express'
import { ApiError } from '../../utils/api-error.js'

const roleBodySchema = z.object({
  name: z.string().min(2).max(64).regex(/^[A-Z][A-Z0-9_]*$/),
  description: z.string().max(240).nullable().optional(),
  permissions: z.array(z.string().min(1)),
})

const patchSchema = z.object({
  description: z.string().max(240).nullable().optional(),
  permissions: z.array(z.string().min(1)).optional(),
})

function mapRole(r: {
  id: string
  name: string
  description: string | null
  permissions: unknown
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: parsePermissionArray(r.permissions),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    isSystem: (SYSTEM_ROLE_NAMES as readonly string[]).includes(r.name),
  }
}

const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.role.findMany({ orderBy: { name: 'asc' } })
    res.json({ success: true, data: { items: items.map(mapRole) } })
  } catch (e) {
    next(e)
  }
}

const create: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof roleBodySchema>
    if ((SYSTEM_ROLE_NAMES as readonly string[]).includes(body.name)) {
      throw new ApiError(409, 'Role name reserved')
    }
    const item = await prisma.role.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        permissions: body.permissions,
      },
    })
    res.status(201).json({ success: true, data: mapRole(item) })
  } catch (e) {
    next(e)
  }
}

const patch: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.roleId as string
    const body = req.body as z.infer<typeof patchSchema>
    const existing = await prisma.role.findUnique({ where: { id } })
    if (!existing) throw new ApiError(404, 'Role not found')

  if (existing.name === 'ADMIN' && body.permissions && !body.permissions.includes('*')) {
      throw new ApiError(400, 'ADMIN must retain full access')
    }

    const item = await prisma.role.update({
      where: { id },
      data: {
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.permissions !== undefined ? { permissions: body.permissions } : {}),
      },
    })
    res.json({ success: true, data: mapRole(item) })
  } catch (e) {
    next(e)
  }
}

const remove: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.roleId as string
    const existing = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } })
    if (!existing) throw new ApiError(404, 'Role not found')
    if ((SYSTEM_ROLE_NAMES as readonly string[]).includes(existing.name)) {
      throw new ApiError(400, 'Cannot delete system role')
    }
    if (existing._count.users > 0) {
      throw new ApiError(409, 'Role still assigned to users')
    }
    await prisma.role.delete({ where: { id } })
    res.json({ success: true, data: { id } })
  } catch (e) {
    next(e)
  }
}

export const rolesRouter = Router()
rolesRouter.use(authenticate)
rolesRouter.get('/', authorize('roles:read', 'users:read', '*'), list)
rolesRouter.post('/', authorize('roles:write', '*'), validate({ body: roleBodySchema }), create)
rolesRouter.patch('/:roleId', authorize('roles:write', '*'), validate({ body: patchSchema }), patch)
rolesRouter.delete('/:roleId', authorize('roles:write', '*'), remove)
