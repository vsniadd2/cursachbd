import { z } from 'zod'

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  budget: z.coerce.number().nonnegative().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const listProjectsQuerySchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  clientId: z.string().uuid().optional(),
})
