import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/api-error.js'
import type { JwtPayload, SafeUser } from './auth.types.js'
import type { LoginInput, RegisterInput } from './auth.schema.js'
import { ActivityAction } from '@prisma/client'

const BCRYPT_ROUNDS = 12

function parsePermissions(raw: Prisma.JsonValue): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((p): p is string => typeof p === 'string')
  }
  return []
}

function toSafeUser(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  role: { id: string; name: string; permissions: Prisma.JsonValue }
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: parsePermissions(user.role.permissions),
    },
  }
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new ApiError(409, 'Email already registered')
  }

  const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } })
  if (!employeeRole) {
    throw new ApiError(500, 'Default role not configured. Run database seed.')
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      roleId: employeeRole.id,
    },
    include: { role: true },
  })

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.CREATE,
      entityType: 'User',
      entityId: user.id,
    },
  })

  const safe = toSafeUser(user)
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role.name,
    permissions: safe.role.permissions,
  })

  return { accessToken: token, user: safe }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { role: true },
  })

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
    },
  })

  const safe = toSafeUser(user)
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role.name,
    permissions: safe.role.permissions,
  })

  return { accessToken: token, user: safe }
}

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive')
  }

  return toSafeUser(user)
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded)) {
      throw new ApiError(401, 'Invalid token')
    }
    const d = decoded as JwtPayload
    if (!d.sub || !d.email || !d.role || !Array.isArray(d.permissions)) {
      throw new ApiError(401, 'Invalid token payload')
    }
    return d
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }
}
