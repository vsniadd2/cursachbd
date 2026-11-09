export type JwtPayload = {
  sub: string
  email: string
  role: string
  permissions: string[]
}

export type SafeUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  role: {
    id: string
    name: string
    permissions: string[]
  }
}
