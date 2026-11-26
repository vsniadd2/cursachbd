import { z } from 'zod'

const status = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
const budget = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number),
  ])
  .pipe(z.number().nonnegative().max(999999999999.99))
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.01, 'Use at most two decimal places')

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  status: status.optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  budget: budget.nullable().optional(),
  startDate: z.iso.date().nullable().optional(),
  endDate: z.iso.date().nullable().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const listProjectsQuerySchema = z.object({
  status: status.optional(),
  clientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  q: z.string().trim().max(200).optional(),
  overdue: z.enum(['true']).optional(),
  sort: z.enum(['updated', 'deadline', 'priority', 'budget', 'name']).optional(),
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export const projectSummaryQuerySchema = listProjectsQuerySchema.pick({ clientId: true })

export const projectMemberSchema = z.object({
  role: z.enum(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER']),
})
