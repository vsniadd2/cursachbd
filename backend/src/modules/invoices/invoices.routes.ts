import { validateId } from '../../middleware/validate-id.js'
import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'

const body = z.object({
  invoiceNumber: z.string().trim().min(1).max(80),
  clientId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  amount: z.coerce
    .number()
    .positive()
    .max(999999999999.99)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.01, 'Use at most two decimal places'),
  currency: z.enum(['USD', 'EUR', 'BYN']),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().max(2000).optional(),
  dueDate: z.string().datetime().nullable().optional(),
})
const include = { client: { select: { companyName: true } }, project: { select: { name: true } } }
export const invoicesRouter = Router()
invoicesRouter.param('id', validateId)
invoicesRouter.use(authenticate)
invoicesRouter.get('/', authorize('invoices:read'), async (_req, res) => {
  const items = await prisma.invoice.findMany({ include, orderBy: { updatedAt: 'desc' } })
  res.json({ success: true, data: { items } })
})
async function checkProject(clientId: string, projectId?: string | null) {
  if (projectId && !(await prisma.project.findFirst({ where: { id: projectId, clientId } })))
    throw new ApiError(400, 'Project must belong to the selected client')
}
invoicesRouter.post('/', authorize('invoices:write'), validate({ body }), async (req, res) => {
  const data = req.body as z.infer<typeof body>
  await checkProject(data.clientId, data.projectId)
  const item = await prisma.invoice.create({
    data: { ...data, issuedAt: new Date(), paidAt: data.status === 'PAID' ? new Date() : null },
    include,
  })
  res.status(201).json({ success: true, data: { item } })
})
invoicesRouter.patch(
  '/:id',
  authorize('invoices:write'),
  validate({ body: body.partial() }),
  async (req, res) => {
    const id = req.params.id as string
    const existing = await prisma.invoice.findUnique({ where: { id } })
    if (!existing) throw new ApiError(404, 'Invoice not found')
    const data = req.body as Partial<z.infer<typeof body>>
    await checkProject(
      data.clientId ?? existing.clientId,
      data.projectId === undefined ? existing.projectId : data.projectId,
    )
    const item = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        ...(data.status ? { paidAt: data.status === 'PAID' ? (existing.paidAt ?? new Date()) : null } : {}),
      },
      include,
    })
    res.json({ success: true, data: { item } })
  },
)
invoicesRouter.delete('/:id', authorize('invoices:write'), async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

export { body as invoiceBodySchema }
