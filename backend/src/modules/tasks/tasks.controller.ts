import type { RequestHandler } from 'express'
import * as service from './tasks.service.js'

function paramId(req: { params: { id?: string | string[] } }) {
  const id = req.params.id
  return typeof id === 'string' ? id : id?.[0]
}

export const list: RequestHandler = async (req, res, next) => {
  try {
    const q = (req.validatedQuery ?? req.query) as {
      status?: import('@prisma/client').TaskStatus
      projectId?: string
    }
    const items = await service.listTasks(q)
    res.json({ success: true, data: { items } })
  } catch (e) {
    next(e)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const item = await service.createTask(
      req.validatedBody as Parameters<typeof service.createTask>[0],
      req.user!.sub,
    )
    res.status(201).json({ success: true, data: { item } })
  } catch (e) {
    next(e)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const item = await service.updateTask(
      paramId(req)!,
      req.validatedBody as Parameters<typeof service.updateTask>[1],
      req.user!.sub,
    )
    res.json({ success: true, data: { item } })
  } catch (e) {
    next(e)
  }
}
