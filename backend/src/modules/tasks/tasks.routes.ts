import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from './tasks.schema.js'
import * as controller from './tasks.controller.js'

export const tasksRouter = Router()

tasksRouter.use(authenticate)
tasksRouter.get('/', validate({ query: listTasksQuerySchema }), controller.list)
tasksRouter.post('/', validate({ body: createTaskSchema }), controller.create)
tasksRouter.patch('/:id', validate({ body: updateTaskSchema }), controller.update)
