import { apiClient } from '@/lib/api/client'
import {
  clearDemoSession,
  demoAuthResponse,
  enableDemoSession,
  isDemoMode,
  matchesDemoCredentials,
  DEMO_USER,
} from '@/lib/auth/demoAuth'
import { clearTokens, getRefreshToken, setTokens } from '@/lib/api/tokens'
import type { ApiSuccess } from '@/types/api'
import type { AuthResponse, User } from '@/types/user'

export type RegisterPayload = {
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
  try {
    const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload)
    clearDemoSession()
    persistAuth(data.data)
    return data.data
  } catch (error) {
    if (matchesDemoCredentials(payload.email, payload.password)) {
      return enableDemoSession()
    }
    throw error
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload)
  persistAuth(data.data)
  return data.data
}

export async function refreshSession(): Promise<AuthResponse | null> {
  if (isDemoMode()) return demoAuthResponse()
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/refresh', { refreshToken })
  persistAuth(data.data)
  return data.data
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
