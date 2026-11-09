import type { User } from '@/types/user'

export type PlanId = 'starter' | 'advanced' | 'enterprise'

export function getCurrentPlan(user: User | null): PlanId {
  if (user?.role.name === 'ADMIN') return 'enterprise'
  return 'starter'
}
