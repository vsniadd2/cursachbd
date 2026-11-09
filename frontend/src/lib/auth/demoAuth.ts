import { clearTokens, setTokens } from '@/lib/api/tokens'
import type { AuthResponse, User } from '@/types/user'

export const DEMO_EMAIL = 'admin@flexora.local'
export const DEMO_PASSWORD = 'admin123'
const DEMO_MODE_KEY = 'flexora_demo_mode'

export const DEMO_ACCESS_TOKEN = 'flexora-demo-access'
export const DEMO_REFRESH_TOKEN = 'flexora-demo-refresh'

export const DEMO_USER: User = {
  id: 'demo-admin',
  email: DEMO_EMAIL,
  firstName: 'John',
  lastName: 'Doe',
  publicCode: '482917305',
  isActive: true,
  extraPermissions: [],
  effectivePermissions: ['*'],
  role: {
    id: 'demo-role-admin',
    name: 'ADMIN',
    permissions: ['*'],
  },
}

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === '1'
}

export function matchesDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
}

export function enableDemoSession(): AuthResponse {
  localStorage.setItem(DEMO_MODE_KEY, '1')
  setTokens(DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN)
  return demoAuthResponse()
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_MODE_KEY)
  clearTokens()
}

export function demoAuthResponse(): AuthResponse {
  return {
    accessToken: DEMO_ACCESS_TOKEN,
    refreshToken: DEMO_REFRESH_TOKEN,
    expiresIn: 60 * 60 * 24,
    user: DEMO_USER,
  }
}
