import type { RequestHandler } from 'express'
import * as service from './clients.service.js'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const data = await service.listClients(req.query.status as import('@prisma/client').ClientStatus | undefined)
    res.json({ success: true, data: { items: data } })
  } catch (e) {
    next(e)
  }
}

function paramId(req: { params: { id?: string | string[] } }) {
  const id = req.params.id
  return typeof id === 'string' ? id : id?.[0]
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const data = await service.getClient(paramId(req)!)
    res.json({ success: true, data: { item: data } })
  } catch (e) {
    next(e)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await service.createClient(req.body)
    res.status(201).json({ success: true, data: { item: data } })
  } catch (e) {
    next(e)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await service.updateClient(paramId(req)!, req.body)
    res.json({ success: true, data: { item: data } })
  } catch (e) {
    next(e)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    await service.deleteClient(paramId(req)!)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
}
