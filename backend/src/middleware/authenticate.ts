import type { RequestHandler } from 'express'
import { verifyToken } from '../modules/auth/auth.service.js'
import { rawPrisma as prisma, teamContext } from '../lib/prisma.js'
import { parsePermissionArray, mergeEffectivePermissions } from '../config/permissions.js'
import { ApiError } from '../utils/api-error.js'

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Missing or invalid authorization header'))
    return
  }

  const token = header.slice(7)
  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } })
    if (!user?.isActive) throw new ApiError(401, 'User not found or inactive')
    req.user = {
      ...payload,
      email: user.email,
      role: user.role.name,
      permissions: mergeEffectivePermissions(
        parsePermissionArray(user.role.permissions),
        parsePermissionArray(user.extraPermissions),
      ),
    }
    if (!user.teamId) {
      const allowed =
        req.baseUrl.endsWith('/auth') ||
        req.baseUrl.endsWith('/teams') ||
        (req.baseUrl.endsWith('/invites') && req.path === '/accept')
      if (!allowed) throw new ApiError(403, 'Join a team to continue')
      next()
      return
    }
    teamContext.run(user.teamId, () => next())
  } catch (err) {
    next(err)
  }
}
