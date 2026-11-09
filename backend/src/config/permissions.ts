export const BUILTIN_PERMISSIONS = [
  'clients:read',
  'clients:write',
  'projects:read',
  'projects:write',
  'tasks:read',
  'tasks:write',
  'invoices:read',
  'invoices:write',
  'users:read',
  'users:write',
  'roles:read',
  'roles:write',
] as const

export const SYSTEM_ROLE_NAMES = ['ADMIN', 'MANAGER', 'EMPLOYEE'] as const

export type BuiltinPermission = (typeof BUILTIN_PERMISSIONS)[number]

export function parsePermissionArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((p): p is string => typeof p === 'string')
}

export function mergeEffectivePermissions(rolePerms: string[], extra: string[]): string[] {
  if (rolePerms.includes('*')) return ['*']
  return [...new Set([...rolePerms, ...extra])]
}
