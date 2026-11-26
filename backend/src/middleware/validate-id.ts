import type { RequestParamHandler } from 'express'
import { z } from 'zod'
import { ApiError } from '../utils/api-error.js'
export const validateId: RequestParamHandler = (_req, _res, next, value) => {
  next(z.string().uuid().safeParse(value).success ? undefined : new ApiError(400, 'Invalid identifier'))
}
