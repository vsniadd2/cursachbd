import type { ErrorRequestHandler } from 'express'
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

  console.error(err)
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
  })
}
