import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { TeamInviteRow } from '@/types/crm'

export type CreateInviteBody =
  | {
      type: 'EMAIL'
      email: string
      roleId?: string
      departmentId?: string | null
      extraPermissions?: string[]
    }
  | {
      type: 'PUBLIC_CODE'
      publicCode: string
      roleId?: string
      departmentId?: string | null
      extraPermissions?: string[]
    }
  | {
      type: 'LINK'
      roleId?: string
      departmentId?: string | null
      extraPermissions?: string[]
    }
  | {
      type: 'TEMP_ACCOUNT'
      email: string
      password: string
      firstName: string
      lastName: string
      roleId?: string
      departmentId?: string | null
      extraPermissions?: string[]
    }

export async function fetchInvites() {
  const { data } = await apiClient.get<ApiSuccess<{ items: TeamInviteRow[] }>>('/invites')
  return data.data.items
}

export async function createInvite(body: CreateInviteBody) {
  const { data } = await apiClient.post<
    ApiSuccess<{
      invite: TeamInviteRow
      inviteToken?: string
      credentials?: { email: string; password: string; publicCode: string }
    }>
  >('/invites', body)
  return data.data
}

export async function cancelInvite(inviteId: string) {
  const { data } = await apiClient.delete<ApiSuccess<TeamInviteRow>>(`/invites/${inviteId}`)
  return data.data
}
