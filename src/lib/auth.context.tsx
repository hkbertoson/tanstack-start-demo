import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { AuthState, LoginCredentials, RegisterCredentials, User } from './auth.types'
import * as authServer from './auth.server'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refetchUser = async () => {
    try {
      const currentUser = await authServer.getUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refetchUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await authServer.login({ data: credentials })

      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      }

      return { success: false, error: result.error || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      const result = await authServer.register({ data: credentials })

      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      }

      return { success: false, error: result.error || 'Registration failed' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await authServer.logout()
      setUser(null)
      router.navigate({ to: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refetchUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// Hook to require authentication on a route
export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.navigate({ to: '/login', search: { redirect: window.location.pathname } })
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return auth
}
