import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { isDemoMode } from '@/lib/auth/demoAuth'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  migrateLegacyTokens,
  setTokens,
} from '@/lib/api/tokens'

migrateLegacyTokens()

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string | null> | null = null

function isAuthExemptUrl(url?: string) {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  )
}

async function refreshAccessToken(): Promise<string | null> {
  if (isDemoMode()) return getAccessToken()
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    const { data } = await axios.post<{
      success: boolean
      data: { accessToken: string; refreshToken: string }
    }>(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken })
    setTokens(data.data.accessToken, data.data.refreshToken)
    return data.data.accessToken
  } catch {
    clearTokens()
    return null
  }
}

function enqueueRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  if (isDemoMode()) return config
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status !== 401 || !config || config._retry || isAuthExemptUrl(config.url)) {
      if (status === 401 && !isAuthExemptUrl(config?.url) && !isDemoMode()) {
        clearTokens()
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }

    if (isDemoMode()) {
      return Promise.reject(error)
    }

    config._retry = true
    const newAccess = await enqueueRefresh()
    if (!newAccess) {
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    config.headers.Authorization = `Bearer ${newAccess}`
    return apiClient.request(config)
  },
)

export { migrateLegacyTokens }
