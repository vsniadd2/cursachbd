import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import { parsePermissionArray } from '../../config/permissions.js'
import { isValidPublicCode } from '../../lib/public-code.js'
import type { RequestHandler } from 'express'
import { ApiError } from '../../utils/api-error.js'

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  publicCode: true,
  departmentId: true,
  managerId: true,
  extraPermissions: true,
  isActive: true,
  department: { select: { id: true, name: true } },
  manager: { select: { id: true, firstName: true, lastName: true } },
  role: { select: { id: true, name: true } },
} as const

function mapUser(row: {
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  departmentId: string | null
  managerId: string | null
  extraPermissions: unknown
  isActive: boolean
  department: { id: string; name: string } | null
  manager: { id: string; firstName: string; lastName: string } | null
  role: { id: string; name: string }
}) {
  return {
    ...row,
    extraPermissions: parsePermissionArray(row.extraPermissions),
  }
}

const patchSchema = z.object({
  roleId: z.string().uuid().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  extraPermissions: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
})

const list: RequestHandler = async (req, res, next) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : ''
    const kind = req.query.kind === 'publicCode' ? 'publicCode' : req.query.kind === 'email' ? 'email' : undefined

    const where: { isActive: boolean; OR?: object[]; email?: object; publicCode?: string } = {
      isActive: true,
    }

    if (query) {
      if (kind === 'publicCode' || isValidPublicCode(query)) {
        if (!isValidPublicCode(query)) {
          res.json({ success: true, data: { items: [] } })
          return
        }
        where.publicCode = query
      } else if (kind === 'email' || query.includes('@')) {
        where.email = { contains: query, mode: 'insensitive' }
      } else {
        where.OR = [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ]
      }
    }

    const items = await prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { lastName: 'asc' },
    })
    res.json({ success: true, data: { items: items.map(mapUser) } })
  } catch (e) {
    next(e)
  }
}

const patch: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId as string
    const body = (req.validatedBody ?? req.body) as z.infer<typeof patchSchema>

    const selfId = req.user?.sub
    if (body.isActive === false && userId === selfId) {
      throw new ApiError(400, 'Cannot deactivate yourself')
    }

    if (body.roleId) {
      const role = await prisma.role.findUnique({ where: { id: body.roleId } })
      if (!role) throw new ApiError(404, 'Role not found')
    }

    if (body.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: body.departmentId } })
      if (!dept) throw new ApiError(404, 'Department not found')
    }

    if (body.managerId !== undefined) {
      if (body.managerId === userId) {
        throw new ApiError(400, 'User cannot be their own manager')
      }
      if (body.managerId !== null) {
        const manager = await prisma.user.findUnique({ where: { id: body.managerId } })
        if (!manager) throw new ApiError(404, 'Manager not found')
        let cursorId: string | null = body.managerId
        const seen = new Set<string>()
        while (cursorId) {
          if (cursorId === userId) {
            throw new ApiError(400, 'Manager assignment would create a cycle in the hierarchy')
          }
          if (seen.has(cursorId)) break
          seen.add(cursorId)
          const cursor = await prisma.user.findUnique({
            where: { id: cursorId },
            select: { managerId: true },
          })
          cursorId = cursor?.managerId ?? null
        }
      }
    }

    const item = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.roleId !== undefined ? { roleId: body.roleId } : {}),
        ...(body.departmentId !== undefined ? { departmentId: body.departmentId } : {}),
        ...(body.managerId !== undefined ? { managerId: body.managerId } : {}),
        ...(body.extraPermissions !== undefined ? { extraPermissions: body.extraPermissions } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
      select: userSelect,
    })
    res.json({ success: true, data: mapUser(item) })
  } catch (e) {
    next(e)
  }
}

export const usersRouter = Router()
usersRouter.use(authenticate)
usersRouter.get('/', authorize('users:read', '*'), list)
usersRouter.patch('/:userId', authorize('users:write', '*'), validate({ body: patchSchema }), patch)
