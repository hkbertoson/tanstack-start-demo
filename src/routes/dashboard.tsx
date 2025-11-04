import { createFileRoute } from '@tanstack/react-router'
import { useRequireAuth } from '../lib/auth.context'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useRequireAuth()

  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-xl text-gray-300 mb-8">
              Welcome back, <span className="text-cyan-400">{auth.user?.name}</span>!
            </p>

            <div className="space-y-6">
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">User Information</h2>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">Name:</span> {auth.user?.name}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">Email:</span> {auth.user?.email}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">ID:</span> {auth.user?.id}
                  </p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Protected Content</h2>
                <p className="text-gray-300 mb-4">
                  This is a protected route. Only authenticated users can see this content.
                </p>
                <p className="text-gray-400 text-sm">
                  Try logging out and accessing this page again - you'll be redirected to the
                  login page automatically.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => auth.logout()}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
