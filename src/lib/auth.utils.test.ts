import { describe, it, expect, beforeEach } from 'vitest'
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  createSession,
  getSessionUser,
  destroySession,
} from './auth.utils'

describe('Auth Utils', () => {
  describe('User Management', () => {
    it('should create a new user', () => {
      const user = createUser('test@example.com', 'password123', 'Test User')

      expect(user).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.id).toBeDefined()
    })

    it('should find user by email', () => {
      const createdUser = createUser('find@example.com', 'password123', 'Find User')
      const foundUser = findUserByEmail('find@example.com')

      expect(foundUser).toBeDefined()
      expect(foundUser?.email).toBe('find@example.com')
      expect(foundUser?.name).toBe('Find User')
      expect(foundUser?.id).toBe(createdUser.id)
    })

    it('should return null for non-existent email', () => {
      const user = findUserByEmail('nonexistent@example.com')
      expect(user).toBeNull()
    })

    it('should find user by id', () => {
      const createdUser = createUser('id@example.com', 'password123', 'ID User')
      const foundUser = findUserById(createdUser.id)

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe(createdUser.id)
      expect(foundUser?.email).toBe('id@example.com')
    })

    it('should return null for non-existent id', () => {
      const user = findUserById('non-existent-id')
      expect(user).toBeNull()
    })
  })

  describe('Password Verification', () => {
    it('should verify correct password', () => {
      const isValid = verifyPassword('password123', 'password123')
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', () => {
      const isValid = verifyPassword('wrongpassword', 'password123')
      expect(isValid).toBe(false)
    })
  })

  describe('Session Management', () => {
    it('should create a session for a user', () => {
      const user = createUser('session@example.com', 'password123', 'Session User')
      const sessionId = createSession(user.id)

      expect(sessionId).toBeDefined()
      expect(typeof sessionId).toBe('string')
    })

    it('should retrieve user from session', () => {
      const user = createUser('retrieve@example.com', 'password123', 'Retrieve User')
      const sessionId = createSession(user.id)

      const sessionUser = getSessionUser(sessionId)

      expect(sessionUser).toBeDefined()
      expect(sessionUser?.id).toBe(user.id)
      expect(sessionUser?.email).toBe('retrieve@example.com')
    })

    it('should return null for invalid session', () => {
      const sessionUser = getSessionUser('invalid-session-id')
      expect(sessionUser).toBeNull()
    })

    it('should destroy a session', () => {
      const user = createUser('destroy@example.com', 'password123', 'Destroy User')
      const sessionId = createSession(user.id)

      // Session should exist
      let sessionUser = getSessionUser(sessionId)
      expect(sessionUser).toBeDefined()

      // Destroy session
      destroySession(sessionId)

      // Session should no longer exist
      sessionUser = getSessionUser(sessionId)
      expect(sessionUser).toBeNull()
    })
  })
})
