declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string
        email: string
        role: string
        permissions: string[]
      }
      /** Parsed query (Express 5: req.query is read-only) */
      validatedQuery?: unknown
      /** Parsed JSON body when req.body cannot be reassigned */
      validatedBody?: unknown
    }
  }
}

export {}
