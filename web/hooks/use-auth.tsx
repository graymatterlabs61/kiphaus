"use client"

import * as React from "react"
import {
  login as apiLogin,
  loginWithApple as apiLoginWithApple,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  register as apiRegister,
  restoreSession,
  type AuthUser,
} from "@/lib/auth"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  loginWithGoogle: (idToken: string) => Promise<AuthUser>
  loginWithApple: (idToken: string) => Promise<AuthUser>
  register: (input: Parameters<typeof apiRegister>[0]) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    restoreSession()
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const loginWithGoogle = React.useCallback(async (idToken: string) => {
    const loggedInUser = await apiLoginWithGoogle(idToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const loginWithApple = React.useCallback(async (idToken: string) => {
    const loggedInUser = await apiLoginWithApple(idToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = React.useCallback(async (input: Parameters<typeof apiRegister>[0]) => {
    const registeredUser = await apiRegister(input)
    setUser(registeredUser)
    return registeredUser
  }, [])

  const logout = React.useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, loginWithApple, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
