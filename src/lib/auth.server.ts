import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from 'vinxi/http'
import type { LoginCredentials, RegisterCredentials, User } from './auth.types'
import {
  createSession,
  createUser,
  destroySession,
  findUserByEmail,
  getSessionUser,
  verifyPassword,
} from './auth.utils'

const SESSION_COOKIE_NAME = 'sessionId'

// Server function to get the current user from session
export const getUser = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as void)
  .handler(async (): Promise<User | null> => {
    const sessionId = getCookie(SESSION_COOKIE_NAME)

    if (!sessionId) {
      return null
    }

    const user = getSessionUser(sessionId)
    return user
  })

// Server function to login
export const login = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as LoginCredentials)
  .handler(async ({ data }): Promise<{ success: boolean; user?: User; error?: string }> => {
    const { email, password } = data

    // Find user by email
    const user = findUserByEmail(email)

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Verify password
    const isValid = verifyPassword(password, user.password)

    if (!isValid) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Create session
    const sessionId = createSession(user.id)

    // Set session cookie
    setCookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    }
  })

// Server function to register
export const register = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as RegisterCredentials)
  .handler(async ({ data }): Promise<{ success: boolean; user?: User; error?: string }> => {
    const { email, password, name } = data

    // Check if user already exists
    const existingUser = findUserByEmail(email)

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Create new user
    const user = createUser(email, password, name)

    // Create session
    const sessionId = createSession(user.id)

    // Set session cookie
    setCookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return { success: true, user }
  })

// Server function to logout
export const logout = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as void)
  .handler(async (): Promise<{ success: boolean }> => {
    const sessionId = getCookie(SESSION_COOKIE_NAME)

    if (sessionId) {
      destroySession(sessionId)
    }

    // Clear session cookie
    setCookie(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return { success: true }
  })
