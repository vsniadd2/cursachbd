import { validateId } from '../../middleware/validate-id.js'
import { authorize } from '../../middleware/authorize.js'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from './projects.schema.js'
import * as controller from './projects.controller.js'

export const projectsRouter = Router()
projectsRouter.param('id', validateId)

projectsRouter.use(authenticate)
projectsRouter.get(
  '/',
  authorize('projects:read'),
  validate({ query: listProjectsQuerySchema }),
  controller.list,
)
projectsRouter.post(
  '/',
  authorize('projects:write'),
  validate({ body: createProjectSchema }),
  controller.create,
)
projectsRouter.patch(
  '/:id',
  authorize('projects:write'),
  validate({ body: updateProjectSchema }),
  controller.update,
)

projectsRouter.delete('/:id', authorize('projects:write'), async (req, res) => {
  const id = req.params.id as string
  if (
    (await prisma.task.count({ where: { projectId: id } })) ||
    (await prisma.invoice.count({ where: { projectId: id } }))
  )
    throw new ApiError(409, 'Remove linked tasks and invoices first')
  await prisma.project.delete({ where: { id } })
  res.status(204).send()
})
