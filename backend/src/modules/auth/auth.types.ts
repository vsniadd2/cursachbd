export type JwtPayload = {
  sub: string
  email: string
  role: string
  permissions: string[]
  type?: 'access'
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: SafeUser
}

export type SafeUser = {
  teamId: string | null
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  isActive: boolean
  extraPermissions: string[]
  role: {
    id: string
    name: string
    permissions: string[]
  }
  effectivePermissions: string[]
}
