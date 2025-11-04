import type { User } from './auth.types'

// Simple in-memory user store (in production, use a real database)
const users = new Map<string, { email: string; password: string; name: string; id: string }>()

// Simple session store (in production, use Redis or similar)
const sessions = new Map<string, { userId: string; expiresAt: number }>()

export function createUser(email: string, password: string, name: string): User {
  const id = crypto.randomUUID()

  // In production, hash the password with bcrypt or similar
  users.set(id, { id, email, password, name })

  return { id, email, name }
}

export function findUserByEmail(email: string): (User & { password: string }) | null {
  for (const user of users.values()) {
    if (user.email === email) {
      return user
    }
  }
  return null
}

export function findUserById(id: string): User | null {
  const user = users.get(id)
  if (!user) return null

  return { id: user.id, email: user.email, name: user.name }
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  // In production, use bcrypt.compare or similar
  return password === hashedPassword
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID()
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days

  sessions.set(sessionId, { userId, expiresAt })

  return sessionId
}

export function getSessionUser(sessionId: string): User | null {
  const session = sessions.get(sessionId)

  if (!session) return null

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return null
  }

  return findUserById(session.userId)
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId)
}
