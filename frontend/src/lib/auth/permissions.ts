import type { User } from '@/types/user'

export function userCan(user: User | null, ...perms: string[]): boolean {
  if (!user) return false
  const effective = user.effectivePermissions ?? user.role.permissions
  if (effective.includes('*')) return true
  return perms.some((p) => effective.includes(p))
}

export const PUBLIC_CODE_PATTERN = /^[1-9]\d{8}$/

export function detectSearchKind(query: string): 'email' | 'publicCode' | 'text' {
  const q = query.trim()
  if (PUBLIC_CODE_PATTERN.test(q)) return 'publicCode'
  if (q.includes('@')) return 'email'
  return 'text'
}
