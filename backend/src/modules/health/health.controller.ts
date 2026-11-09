import type { RequestHandler } from 'express'
import { prisma } from '../../lib/prisma.js'

export const health: RequestHandler = async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: 'connected',
      },
    })
  } catch (err) {
    next(err)
  }
}
