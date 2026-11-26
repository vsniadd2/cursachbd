import { validateId } from '../../middleware/validate-id.js'
import { authorize } from '../../middleware/authorize.js'
import { prisma } from '../../lib/prisma.js'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from './tasks.schema.js'
import * as controller from './tasks.controller.js'

export const tasksRouter = Router()
tasksRouter.param('id', validateId)

tasksRouter.use(authenticate)
tasksRouter.get('/', authorize('tasks:read'), validate({ query: listTasksQuerySchema }), controller.list)
tasksRouter.post('/', authorize('tasks:write'), validate({ body: createTaskSchema }), controller.create)
tasksRouter.patch('/:id', authorize('tasks:write'), validate({ body: updateTaskSchema }), controller.update)

tasksRouter.delete('/:id', authorize('tasks:write'), async (req, res) => {
  const id = req.params.id as string

  await prisma.task.delete({ where: { id } })
  res.status(204).send()
})
