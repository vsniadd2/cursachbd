import type { RequestHandler } from 'express'
import { verifyToken } from '../modules/auth/auth.service.js'
import { ApiError } from '../utils/api-error.js'

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Missing or invalid authorization header'))
    return
  }

  const token = header.slice(7)
  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    next(err)
  }
}
