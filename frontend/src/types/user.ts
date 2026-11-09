export type UserRole = {
  id: string
  name: string
  permissions: string[]
}

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  isActive: boolean
  extraPermissions: string[]
  effectivePermissions: string[]
  role: UserRole
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}
