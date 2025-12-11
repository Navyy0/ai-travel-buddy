import { createContext, useState, useEffect } from 'react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

export const AuthContext = createContext({ token: null, user: null, setToken: () => {}, clearToken: () => {} })

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null)
  const [user, setUser] = useState(null)

  // Fetch user profile using HttpOnly cookie (no Authorization header)
  const fetchUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include'
      })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data)
    } catch (e) {
      console.warn('AuthProvider: failed to fetch user', e)
      setUser(null)
    }
  }

  useEffect(() => {
    // On mount, try to fetch current user via cookie-based session
    fetchUser()
  }, [])

  const setToken = (t) => {
    // Token is managed by HttpOnly cookie set by backend. Trigger user refresh.
    setTokenState(t)
    fetchUser()
  }

  const clearToken = () => {
    // Clear local state; backend cookie invalidation can be added separately
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  )
}
