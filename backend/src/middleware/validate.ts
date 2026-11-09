import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

type ValidationSchemas = {
  body?: ZodType
  query?: ZodType
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body)
        req.validatedBody = parsed
        try {
          req.body = parsed
        } catch {
          /* Express 5 may expose read-only body */
        }
      }
      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query)
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
