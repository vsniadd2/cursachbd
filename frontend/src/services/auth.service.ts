import { apiClient, TOKEN_KEY } from '@/lib/api/client'
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

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload)
  localStorage.setItem(TOKEN_KEY, data.data.accessToken)
  return data.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload)
  localStorage.setItem(TOKEN_KEY, data.data.accessToken)
  return data.data
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<ApiSuccess<{ user: User }>>('/auth/me')
  return data.data.user
}

export function logoutLocal() {
  localStorage.removeItem(TOKEN_KEY)
}
