import { validateId } from '../../middleware/validate-id.js'
import { authorize } from '../../middleware/authorize.js'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  projectSummaryQuerySchema,
  projectMemberSchema,
} from './projects.schema.js'
import * as service from './projects.service.js'
import type { z } from 'zod'

export const projectsRouter = Router()
projectsRouter.param('id', validateId)
projectsRouter.param('userId', validateId)

projectsRouter.use(authenticate)
projectsRouter.get(
  '/',
  authorize('projects:read'),
  validate({ query: listProjectsQuerySchema }),
  async (req, res) => {
    const query = req.validatedQuery as z.infer<typeof listProjectsQuerySchema>
    const permissions = req.user!.permissions
    const data = await service.listProjects(
      query,
      permissions.includes('*') || permissions.includes('tasks:read'),
    )
    res.json({ success: true, data })
  },
)
projectsRouter.get(
  '/summary',
  authorize('projects:read'),
  validate({ query: projectSummaryQuerySchema }),
  async (req, res) => {
    const { clientId } = req.validatedQuery as z.infer<typeof projectSummaryQuerySchema>
    res.json({ success: true, data: await service.summarizeProjects(clientId) })
  },
)
projectsRouter.get('/:id', authorize('projects:read'), async (req, res) => {
  const item = await service.getProject(req.params.id as string)
  res.json({ success: true, data: { item } })
})
projectsRouter.post(
  '/',
  authorize('projects:write'),
  validate({ body: createProjectSchema }),
  async (req, res) => {
    const item = await service.createProject(
      req.validatedBody as z.infer<typeof createProjectSchema>,
      req.user!.sub,
    )
    res.status(201).json({ success: true, data: { item } })
  },
)
projectsRouter.patch(
  '/:id',
  authorize('projects:write'),
  validate({ body: updateProjectSchema }),
  async (req, res) => {
    const item = await service.updateProject(
      req.params.id as string,
      req.validatedBody as z.infer<typeof updateProjectSchema>,
      req.user!.sub,
    )
    res.json({ success: true, data: { item } })
  },
)
projectsRouter.get('/:id/history', authorize('projects:read'), async (req, res) => {
  const items = await service.listProjectHistory(req.params.id as string)
  res.json({ success: true, data: { items } })
})
projectsRouter.put(
  '/:id/members/:userId',
  authorize('projects:write'),
  validate({ body: projectMemberSchema }),
  async (req, res) => {
    const { role } = req.validatedBody as z.infer<typeof projectMemberSchema>
    await service.setProjectMember(req.params.id as string, req.params.userId as string, role, req.user!.sub)
    res.status(204).send()
  },
)
projectsRouter.delete('/:id/members/:userId', authorize('projects:write'), async (req, res) => {
  await service.setProjectMember(req.params.id as string, req.params.userId as string, null, req.user!.sub)
  res.status(204).send()
})
projectsRouter.delete('/:id', authorize('projects:write'), async (req, res) => {
  await service.deleteProject(req.params.id as string, req.user!.sub)
  res.status(204).send()
})
