import { z } from 'zod'

export const registerSchema = z.object({
  accountType: z.enum(['BUSINESS', 'PERSONAL']).default('PERSONAL'),
  businessName: z.string().trim().min(2).max(120).optional(),
  inviteToken: z.string().uuid().optional(),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes'),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
})

export const updateProfileSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    newPassword: z
      .string()
      .min(8)
      .max(72)
      .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes')
      .optional(),
  })
  .refine((data) => data.firstName ?? data.lastName ?? data.email ?? data.newPassword, {
    message: 'At least one field to update is required',
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
