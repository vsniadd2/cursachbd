import { z } from 'zod'

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  budget: z.coerce.number().nonnegative().max(999999999999.99).nullable().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const listProjectsQuerySchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  clientId: z.string().uuid().optional(),
})
