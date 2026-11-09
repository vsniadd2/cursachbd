import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from './projects.schema.js'
import * as controller from './projects.controller.js'

export const projectsRouter = Router()

projectsRouter.use(authenticate)
projectsRouter.get('/', validate({ query: listProjectsQuerySchema }), controller.list)
projectsRouter.post('/', validate({ body: createProjectSchema }), controller.create)
projectsRouter.patch('/:id', validate({ body: updateProjectSchema }), controller.update)
