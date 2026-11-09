import { Router } from 'express'
import { createHash, randomUUID } from 'node:crypto'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { InviteStatus, InviteType } from '@prisma/client'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import { parsePermissionArray } from '../../config/permissions.js'
import { generateUniquePublicCode, isValidPublicCode } from '../../lib/public-code.js'
import type { RequestHandler } from 'express'
import { ApiError } from '../../utils/api-error.js'

const BCRYPT_ROUNDS = 12
const INVITE_TTL_MS = 7 * 86_400_000

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

const createSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('EMAIL'),
    email: z.string().email(),
    roleId: z.string().uuid().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    extraPermissions: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('LINK'),
    roleId: z.string().uuid().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    extraPermissions: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('PUBLIC_CODE'),
    publicCode: z.string().regex(/^[1-9]\d{8}$/),
    roleId: z.string().uuid().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    extraPermissions: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('TEMP_ACCOUNT'),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    roleId: z.string().uuid().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    extraPermissions: z.array(z.string()).optional(),
  }),
])

function mapInvite(row: {
  id: string
  type: InviteType
  status: InviteStatus
  email: string | null
  targetPublicCode: string | null
  expiresAt: Date
  createdAt: Date
  extraPermissions: unknown
  role: { id: string; name: string } | null
  department: { id: string; name: string } | null
  provisionedUser: { id: string; email: string; firstName: string; lastName: string } | null
}) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    email: row.email,
    targetPublicCode: row.targetPublicCode,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    extraPermissions: parsePermissionArray(row.extraPermissions),
    role: row.role,
    department: row.department,
    provisionedUser: row.provisionedUser,
  }
}

const inviteInclude = {
  role: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  provisionedUser: { select: { id: true, email: true, firstName: true, lastName: true } },
} as const

const list: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.teamInvite.findMany({
      orderBy: { createdAt: 'desc' },
      include: inviteInclude,
    })
    res.json({ success: true, data: { items: items.map(mapInvite) } })
  } catch (e) {
    next(e)
  }
}

const create: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>
    const createdById = req.user!.sub
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS)
    const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } })
    const defaultRoleId = employeeRole?.id

    if (body.type === 'LINK') {
      const plainToken = randomUUID()
      const invite = await prisma.teamInvite.create({
        data: {
          type: InviteType.LINK,
          status: InviteStatus.PENDING,
          tokenHash: hashToken(plainToken),
          roleId: body.roleId ?? defaultRoleId,
          departmentId: body.departmentId ?? null,
          extraPermissions: body.extraPermissions ?? [],
          expiresAt,
          createdById,
        },
        include: inviteInclude,
      })
      res.status(201).json({
        success: true,
        data: {
          invite: mapInvite(invite),
          inviteToken: plainToken,
        },
      })
      return
    }

    if (body.type === 'EMAIL') {
      const plainToken = randomUUID()
      const invite = await prisma.teamInvite.create({
        data: {
          type: InviteType.EMAIL,
          status: InviteStatus.PENDING,
          email: body.email.toLowerCase(),
          tokenHash: hashToken(plainToken),
          roleId: body.roleId ?? defaultRoleId,
          departmentId: body.departmentId ?? null,
          extraPermissions: body.extraPermissions ?? [],
          expiresAt,
          createdById,
        },
        include: inviteInclude,
      })
      res.status(201).json({
        success: true,
        data: {
          invite: mapInvite(invite),
          inviteToken: plainToken,
        },
      })
      return
    }

    if (body.type === 'PUBLIC_CODE') {
      if (!isValidPublicCode(body.publicCode)) {
        throw new ApiError(400, 'Invalid public code')
      }
      const target = await prisma.user.findUnique({ where: { publicCode: body.publicCode } })
      if (!target) throw new ApiError(404, 'User not found')

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: {
          ...(body.roleId ? { roleId: body.roleId } : {}),
          ...(body.departmentId !== undefined ? { departmentId: body.departmentId } : {}),
          ...(body.extraPermissions ? { extraPermissions: body.extraPermissions } : {}),
        },
      })

      const invite = await prisma.teamInvite.create({
        data: {
          type: InviteType.PUBLIC_CODE,
          status: InviteStatus.ACCEPTED,
          targetPublicCode: body.publicCode,
          email: updated.email,
          roleId: body.roleId ?? defaultRoleId,
          departmentId: body.departmentId ?? null,
          extraPermissions: body.extraPermissions ?? [],
          expiresAt,
          createdById,
          provisionedUserId: updated.id,
        },
        include: inviteInclude,
      })
      res.status(201).json({ success: true, data: { invite: mapInvite(invite) } })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existing) throw new ApiError(409, 'Email already registered')

    const roleId = body.roleId ?? defaultRoleId
    if (!roleId) throw new ApiError(500, 'Default role missing')

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS)
    const publicCode = await generateUniquePublicCode(prisma)

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        publicCode,
        roleId,
        departmentId: body.departmentId ?? null,
        extraPermissions: body.extraPermissions ?? [],
      },
    })

    const invite = await prisma.teamInvite.create({
      data: {
        type: InviteType.TEMP_ACCOUNT,
        status: InviteStatus.ACCEPTED,
        email: user.email,
        roleId,
        departmentId: body.departmentId ?? null,
        extraPermissions: body.extraPermissions ?? [],
        expiresAt,
        createdById,
        provisionedUserId: user.id,
      },
      include: inviteInclude,
    })

    res.status(201).json({
      success: true,
      data: {
        invite: mapInvite(invite),
        credentials: {
          email: user.email,
          password: body.password,
          publicCode: user.publicCode,
        },
      },
    })
  } catch (e) {
    next(e)
  }
}

const cancel: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.inviteId as string
    const invite = await prisma.teamInvite.findUnique({ where: { id } })
    if (!invite) throw new ApiError(404, 'Invite not found')
    if (invite.status !== InviteStatus.PENDING) {
      throw new ApiError(400, 'Only pending invites can be cancelled')
    }
    const updated = await prisma.teamInvite.update({
      where: { id },
      data: { status: InviteStatus.CANCELLED },
      include: inviteInclude,
    })
    res.json({ success: true, data: mapInvite(updated) })
  } catch (e) {
    next(e)
  }
}

export const invitesRouter = Router()
invitesRouter.use(authenticate)
invitesRouter.get('/', authorize('users:read', '*'), list)
invitesRouter.post('/', authorize('users:write', '*'), validate({ body: createSchema }), create)
invitesRouter.delete('/:inviteId', authorize('users:write', '*'), cancel)
