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
  isActive: boolean
  role: UserRole
}

export type AuthResponse = {
  accessToken: string
  user: User
}
