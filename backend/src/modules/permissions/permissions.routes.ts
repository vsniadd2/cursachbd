import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import { BUILTIN_PERMISSIONS } from '../../config/permissions.js'
import type { RequestHandler } from 'express'
import { ApiError } from '../../utils/api-error.js'

const createSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z][a-z0-9]*(?::[a-z0-9]+)+$/),
  label: z.string().min(2).max(120),
  description: z.string().max(240).nullable().optional(),
})

const catalog: RequestHandler = async (_req, res, next) => {
  try {
    const custom = await prisma.customPermission.findMany({ orderBy: { slug: 'asc' } })
    res.json({
      success: true,
      data: {
        builtin: [...BUILTIN_PERMISSIONS],
        custom,
      },
    })
  } catch (e) {
    next(e)
  }
}

const create: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>
    if ((BUILTIN_PERMISSIONS as readonly string[]).includes(body.slug as never)) {
      throw new ApiError(409, 'Permission already exists in catalog')
    }
    const item = await prisma.customPermission.create({
      data: {
        slug: body.slug,
        label: body.label,
        description: body.description ?? null,
      },
    })
    res.status(201).json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
}

const remove: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.permissionId as string
    await prisma.customPermission.delete({ where: { id } })
    res.json({ success: true, data: { id } })
  } catch (e) {
    next(e)
  }
}

export const permissionsRouter = Router()
permissionsRouter.use(authenticate)
permissionsRouter.get('/catalog', authorize('roles:read', 'users:read', '*'), catalog)
permissionsRouter.post('/custom', authorize('roles:write', '*'), validate({ body: createSchema }), create)
permissionsRouter.delete('/custom/:permissionId', authorize('roles:write', '*'), remove)
