import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getAccessToken, getRefreshToken } from '@/lib/api/tokens'
import * as authService from '@/services/auth.service'
import type { RegisterPayload, LoginPayload, UpdateProfilePayload } from '@/services/auth.service'
import type { User } from '@/types/user'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const access = getAccessToken()
      const refresh = getRefreshToken()
      if (!access && !refresh) {
        if (active) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }
      try {
        if (!access && refresh) {
          await authService.refreshSession()
        }
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

  const logout = useCallback(async () => {
    await authService.logoutRemote()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await authService.updateProfile(payload)
    setUser(updated)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
