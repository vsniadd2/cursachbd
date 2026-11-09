import { parsePermissionArray, mergeEffectivePermissions } from '../config/permissions.js'

export function effectivePermissionsForUser(rolePermissions: unknown, extraPermissions: unknown): string[] {
  const role = parsePermissionArray(rolePermissions)
  const extra = parsePermissionArray(extraPermissions)
  return mergeEffectivePermissions(role, extra)
}
