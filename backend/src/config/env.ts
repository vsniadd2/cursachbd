import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  /** @deprecated use JWT_ACCESS_EXPIRES_IN */
  JWT_EXPIRES_IN: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const data = parsed.data
export const env = {
  ...data,
  JWT_ACCESS_EXPIRES_IN: data.JWT_ACCESS_EXPIRES_IN || data.JWT_EXPIRES_IN || '15m',
}
