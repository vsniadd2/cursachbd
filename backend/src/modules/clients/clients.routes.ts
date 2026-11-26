import { validateId } from '../../middleware/validate-id.js'
import { authorize } from '../../middleware/authorize.js'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createClientSchema, updateClientSchema, listClientsQuerySchema } from './clients.schema.js'
import * as controller from './clients.controller.js'

export const clientsRouter = Router()
clientsRouter.param('id', validateId)

clientsRouter.use(authenticate)
clientsRouter.post(
  '/import',
  authorize('clients:write'),
  validate({ body: z.object({ items: z.array(createClientSchema).min(1).max(500) }) }),
  async (req, res) => {
    const result = await prisma.$transaction(
      req.body.items.map((data: z.infer<typeof createClientSchema>) =>
        prisma.client.create({ data: { ...data, email: data.email || null } }),
      ),
    )
    res.status(201).json({ success: true, data: { count: result.length } })
  },
)
clientsRouter.get(
  '/',
  authorize('clients:read'),
  validate({ query: listClientsQuerySchema }),
  controller.list,
)
clientsRouter.get('/:id', authorize('clients:read'), controller.getById)
clientsRouter.post('/', authorize('clients:write'), validate({ body: createClientSchema }), controller.create)
clientsRouter.patch(
  '/:id',
  authorize('clients:write'),
  validate({ body: updateClientSchema }),
  controller.update,
)
clientsRouter.delete('/:id', authorize('clients:write'), controller.remove)
