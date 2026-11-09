import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createClientSchema, updateClientSchema, listClientsQuerySchema } from './clients.schema.js'
import * as controller from './clients.controller.js'

export const clientsRouter = Router()

clientsRouter.use(authenticate)
clientsRouter.get('/', validate({ query: listClientsQuerySchema }), controller.list)
clientsRouter.get('/:id', controller.getById)
clientsRouter.post('/', validate({ body: createClientSchema }), controller.create)
clientsRouter.patch('/:id', validate({ body: updateClientSchema }), controller.update)
clientsRouter.delete('/:id', controller.remove)
