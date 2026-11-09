import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY } from '@/lib/api/client'
import * as authService from '@/services/auth.service'
import type { RegisterPayload, LoginPayload } from '@/services/auth.service'
import type { User } from '@/types/user'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        if (active) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }
      try {
        const me = await authService.fetchMe()
        if (active) setUser(me)
      } catch {
        authService.logoutLocal()
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload)
    setUser(result.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload)
    setUser(result.user)
  }, [])

  const logout = useCallback(() => {
    authService.logoutLocal()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
