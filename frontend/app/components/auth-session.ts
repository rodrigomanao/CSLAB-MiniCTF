export type AuthSession = {
  id: number
  username: string
  email: string
  role: string
}

export const AUTH_SESSION_KEY = 'cslab-auth-session'

export function getAuthSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY)
}
