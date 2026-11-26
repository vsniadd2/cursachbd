import { apiClient } from '@/lib/api/client'
import { clearDemoSession, demoAuthResponse, isDemoMode, DEMO_USER } from '@/lib/auth/demoAuth'
import { clearTokens, getRefreshToken, setTokens } from '@/lib/api/tokens'
import type { ApiSuccess } from '@/types/api'
import type { AuthResponse, User } from '@/types/user'

export type RegisterPayload = {
  accountType?: 'BUSINESS' | 'PERSONAL'
  businessName?: string
  inviteToken?: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type UpdateProfilePayload = {
  currentPassword: string
  firstName?: string
  lastName?: string
  email?: string
  newPassword?: string
}

function persistAuth(data: AuthResponse) {
  setTokens(data.accessToken, data.refreshToken)
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload)
  clearDemoSession()
  persistAuth(data.data)
  return data.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload)
  persistAuth(data.data)
  return data.data
}

let pendingRefresh: Promise<AuthResponse | null> | null = null

export function refreshSession(): Promise<AuthResponse | null> {
  // StrictMode can mount the bootstrap effect twice; share the single-use token request.
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      if (isDemoMode()) return demoAuthResponse()
      const refreshToken = getRefreshToken()
      if (!refreshToken) return null
      const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/refresh', { refreshToken })
      persistAuth(data.data)
      return data.data
    })().finally(() => {
      pendingRefresh = null
    })
  }
  return pendingRefresh
}

export async function fetchMe(): Promise<User> {
  if (isDemoMode()) return DEMO_USER
  const { data } = await apiClient.get<ApiSuccess<{ user: User }>>('/auth/me')
  return data.data.user
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  if (isDemoMode()) throw new Error('Demo mode')
  const { data } = await apiClient.patch<ApiSuccess<{ user: User }>>('/auth/me', payload)
  return data.data.user
}

export async function logoutRemote() {
  if (isDemoMode()) {
    clearDemoSession()
    return
  }
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken })
    }
  } catch {
    /* ignore */
  }
  clearTokens()
}

export function logoutLocal() {
  clearTokens()
}
