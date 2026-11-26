import { validateId } from '../../middleware/validate-id.js'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { ApiError } from '../../utils/api-error.js'

const kind = z.enum(['CAMPAIGN', 'EMAIL', 'AUTOMATION', 'FEEDBACK'])
const body = z.object({
  kind,
  title: z.string().trim().min(1).max(200),
  body: z.string().max(10000).default(''),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).default('DRAFT'),
})
export const workspaceRouter = Router()
workspaceRouter.param('id', validateId)
workspaceRouter.use(authenticate)
workspaceRouter.get('/', validate({ query: z.object({ kind }) }), async (req, res) => {
  const k = (req.validatedQuery as { kind: string }).kind
  const items = await prisma.workspaceItem.findMany({
    where: { kind: k, ...(k === 'FEEDBACK' ? { ownerId: req.user!.sub } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ success: true, data: { items } })
})
workspaceRouter.post('/', validate({ body }), async (req, res) => {
  const data = req.body as z.infer<typeof body>
  if (data.kind !== 'FEEDBACK' && !req.user!.permissions.some((p) => ['*', 'projects:write'].includes(p)))
    throw new ApiError(403, 'Permission denied')
  const item = await prisma.workspaceItem.create({ data: { ...data, ownerId: req.user!.sub } })
  res.status(201).json({ success: true, data: { item } })
})
workspaceRouter.patch(
  '/:id',
  authorize('projects:write'),
  validate({ body: body.omit({ kind: true }).partial() }),
  async (req, res) => {
    const item = await prisma.workspaceItem.update({ where: { id: req.params.id as string }, data: req.body })
    res.json({ success: true, data: { item } })
  },
)
workspaceRouter.delete('/:id', authorize('projects:write'), async (req, res) => {
  await prisma.workspaceItem.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

export { body as workspaceBodySchema }
