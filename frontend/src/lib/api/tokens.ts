const ACCESS_KEY = 'flexora_access_token'
const REFRESH_KEY = 'flexora_refresh_token'
const LEGACY_KEY = 'flexora_token'

export function migrateLegacyTokens() {
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy && !localStorage.getItem(ACCESS_KEY)) {
    localStorage.setItem(ACCESS_KEY, legacy)
  }
  localStorage.removeItem(LEGACY_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(LEGACY_KEY)
}

export { ACCESS_KEY, REFRESH_KEY }
