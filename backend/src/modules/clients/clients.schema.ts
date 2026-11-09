import { z } from 'zod'

export const clientStatusSchema = z.enum(['LEAD', 'ACTIVE', 'INACTIVE', 'CHURNED'])

export const createClientSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  status: clientStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
})

export const updateClientSchema = createClientSchema.partial()

export const listClientsQuerySchema = z.object({
  status: clientStatusSchema.optional(),
})
