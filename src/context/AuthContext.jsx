import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../api/auth'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)
const TOKEN_KEY = 'auth-token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    delete axiosClient.defaults.headers.common.Authorization
  }, [])

  const applySession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
    axiosClient.defaults.headers.common.Authorization = `Token ${nextToken}`
  }, [])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      if (!token) {
        delete axiosClient.defaults.headers.common.Authorization
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      axiosClient.defaults.headers.common.Authorization = `Token ${token}`
      try {
        const res = await fetchMe()
        if (!cancelled) setUser(res.data)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [token, clearSession])

  const login = useCallback(async (username, password) => {
    const res = await loginRequest(username, password)
    applySession(res.data.token, res.data.user)
    return res.data.user
  }, [applySession])

  const register = useCallback(async (username, password, email = '') => {
    const res = await registerRequest(username, password, email)
    applySession(res.data.token, res.data.user)
    return res.data.user
  }, [applySession])

  const logout = useCallback(async () => {
    try {
      if (token) await logoutRequest()
    } catch {
      // Clear local session even if the API call fails
    } finally {
      clearSession()
    }
  }, [token, clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
