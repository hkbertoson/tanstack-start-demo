import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth.context'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const auth = useAuth()
  const router = useRouter()
  const search = Route.useSearch<{ redirect?: string }>()

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      const redirectTo = search.redirect || '/dashboard'
      router.navigate({ to: redirectTo })
    }
  }, [auth.isAuthenticated, router, search.redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await auth.login({ email, password })

      if (result.success) {
        const redirectTo = search.redirect || '/dashboard'
        router.navigate({ to: redirectTo })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
