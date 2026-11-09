import type { RequestHandler } from 'express'
import { ApiError } from '../utils/api-error.js'

export function authorize(...required: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, 'Unauthorized'))
      return
    }

    const permissions = req.user.permissions ?? []
    if (permissions.includes('*')) {
      next()
      return
    }

    const allowed = required.some((p) => permissions.includes(p))
    if (!allowed) {
      next(new ApiError(403, 'Insufficient permissions'))
      return
    }

    next()
  }
}
