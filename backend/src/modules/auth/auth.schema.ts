import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
})

export const loginSchema = z.object({
  email: z.string().email(),
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
    currentPassword: z.string().min(1).max(128),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email().max(255).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine((data) => data.firstName ?? data.lastName ?? data.email ?? data.newPassword, {
    message: 'At least one field to update is required',
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
