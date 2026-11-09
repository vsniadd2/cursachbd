import { createHash, randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Prisma } from '@prisma/client'
import { ActivityAction } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/api-error.js'
import type { AuthTokens, JwtPayload, SafeUser } from './auth.types.js'
import type { LoginInput, RegisterInput, UpdateProfileInput } from './auth.schema.js'
import { generateUniquePublicCode } from '../../lib/public-code.js'
import { parsePermissionArray } from '../../config/permissions.js'
import { effectivePermissionsForUser } from '../../lib/permissions-user.js'

const BCRYPT_ROUNDS = 12

function parsePermissions(raw: Prisma.JsonValue): string[] {
  return parsePermissionArray(raw)
}

function durationToMs(duration: string): number {
  const m = /^(\d+)([smhd])$/i.exec(duration.trim())
  if (!m) return 15 * 60 * 1000
  const n = Number(m[1])
  const unit = m[2].toLowerCase()
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit as 's'] ?? 60_000
  return n * mult
}

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function toSafeUser(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  isActive: boolean
  extraPermissions: Prisma.JsonValue
  role: { id: string; name: string; permissions: Prisma.JsonValue }
}): SafeUser {
  const rolePerms = parsePermissions(user.role.permissions)
  const extra = parsePermissions(user.extraPermissions)
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    publicCode: user.publicCode,
    isActive: user.isActive,
    extraPermissions: extra,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: rolePerms,
    },
    effectivePermissions: effectivePermissionsForUser(rolePerms, extra),
  }
}

function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' as const }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

async function issueRefreshToken(userId: string): Promise<string> {
  const plain = randomUUID()
  const tokenHash = hashRefreshToken(plain)
  const expiresAt = new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN))
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  })
  return plain
}

async function authBundle(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  isActive: boolean
  extraPermissions: Prisma.JsonValue
  role: { id: string; name: string; permissions: Prisma.JsonValue }
}): Promise<AuthTokens> {
  const safe = toSafeUser(user)
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role.name,
    permissions: safe.effectivePermissions,
  })
  const refreshToken = await issueRefreshToken(user.id)
  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(durationToMs(env.JWT_ACCESS_EXPIRES_IN) / 1000),
    user: safe,
  }
}

export async function register(input: RegisterInput): Promise<AuthTokens> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new ApiError(409, 'Email already registered')
  }

  const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } })
  if (!employeeRole) {
    throw new ApiError(500, 'Default role not configured. Run database seed.')
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const publicCode = await generateUniquePublicCode(prisma)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      publicCode,
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

  return authBundle(user)
}

export async function login(input: LoginInput): Promise<AuthTokens> {
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

  return authBundle(user)
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashRefreshToken(refreshToken)
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { role: true } } },
  })

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  if (!stored.user.isActive) {
    throw new ApiError(401, 'User inactive')
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  })

  return authBundle(stored.user)
}

export async function logoutSession(refreshToken: string | undefined) {
  if (!refreshToken) return
  const tokenHash = hashRefreshToken(refreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
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

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  })

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive')
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!valid) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  if (input.email && input.email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: input.email } })
    if (taken) {
      throw new ApiError(409, 'Email already in use')
    }
  }

  const data: Prisma.UserUpdateInput = {}
  if (input.firstName !== undefined) data.firstName = input.firstName
  if (input.lastName !== undefined) data.lastName = input.lastName
  if (input.email !== undefined) data.email = input.email
  if (input.newPassword) {
    data.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    include: { role: true },
  })

  await prisma.activityLog.create({
    data: {
      userId,
      action: ActivityAction.UPDATE,
      entityType: 'User',
      entityId: userId,
    },
  })

  return toSafeUser(updated)
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded)) {
      throw new ApiError(401, 'Invalid token')
    }
    const d = decoded as JwtPayload
    if (d.type && d.type !== 'access') {
      throw new ApiError(401, 'Invalid token type')
    }
    if (!d.sub || !d.email || !d.role || !Array.isArray(d.permissions)) {
      throw new ApiError(401, 'Invalid token payload')
    }
    return d
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(401, 'Invalid or expired token')
  }
}
