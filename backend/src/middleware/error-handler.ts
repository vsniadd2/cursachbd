import type { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { ApiError } from '../utils/api-error.js'
import { env } from '../config/env.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten(),
    })
    return
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = { P2002: 409, P2003: 409, P2025: 404, P2023: 400 }[err.code]
    if (status) {
      res.status(status).json({
        success: false,
        error: {
          P2002: 'Record already exists',
          P2003: 'Linked record missing or still in use',
          P2025: 'Record not found',
          P2023: 'Invalid identifier',
        }[err.code],
      })
      return
    }
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, error: 'Invalid JSON' })
    return
  }
  console.error(err)
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
  })
}
