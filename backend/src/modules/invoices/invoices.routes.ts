import { validateId } from '../../middleware/validate-id.js'
import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { prisma, teamContext } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { Invoice, Prisma } from '@prisma/client'
import { lockProject } from '../projects/projects.service.js'

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
const listQuery = z.object({ projectId: z.string().uuid().optional() })
export const invoicesRouter = Router()
invoicesRouter.param('id', validateId)
invoicesRouter.use(authenticate)
invoicesRouter.get('/', authorize('invoices:read'), validate({ query: listQuery }), async (req, res) => {
  const { projectId } = req.validatedQuery as z.infer<typeof listQuery>
  const items = await prisma.invoice.findMany({
    where: { projectId },
    include,
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ success: true, data: { items } })
})
async function checkProject(tx: Prisma.TransactionClient, clientId: string, projectId?: string | null) {
  if (projectId && (await lockProject(tx, projectId))?.clientId !== clientId)
    throw new ApiError(400, 'Project must belong to the selected client')
}
invoicesRouter.post('/', authorize('invoices:write'), validate({ body }), async (req, res) => {
  const data = req.body as z.infer<typeof body>
  const item = await prisma.$transaction(async (tx) => {
    await checkProject(tx, data.clientId, data.projectId)
    return tx.invoice.create({
      data: { ...data, issuedAt: new Date(), paidAt: data.status === 'PAID' ? new Date() : null },
      include,
    })
  })
  res.status(201).json({ success: true, data: { item } })
})
invoicesRouter.patch(
  '/:id',
  authorize('invoices:write'),
  validate({ body: body.partial() }),
  async (req, res) => {
    const id = req.params.id as string
    const data = req.validatedBody as Partial<z.infer<typeof body>>
    const item = await prisma.$transaction(async (tx) => {
      const [existing] = await tx.$queryRaw<Pick<Invoice, 'clientId' | 'projectId' | 'paidAt'>[]>`
        SELECT "clientId", "projectId", "paidAt" FROM "Invoice"
        WHERE "id" = ${id}::uuid AND "teamId" = ${teamContext.getStore()}::uuid
        FOR UPDATE
      `
      if (!existing) throw new ApiError(404, 'Invoice not found')
      await checkProject(
        tx,
        data.clientId ?? existing.clientId,
        data.projectId === undefined ? existing.projectId : data.projectId,
      )
      return tx.invoice.update({
        where: { id },
        data: {
          ...data,
          ...(data.status ? { paidAt: data.status === 'PAID' ? (existing.paidAt ?? new Date()) : null } : {}),
        },
        include,
      })
    })
    res.json({ success: true, data: { item } })
  },
)
invoicesRouter.delete('/:id', authorize('invoices:write'), async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

export { body as invoiceBodySchema, listQuery as invoiceListQuerySchema }
