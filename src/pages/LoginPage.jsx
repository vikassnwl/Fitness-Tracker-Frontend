import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function LoginPage() {
  const { login, register, isAuthenticated, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(username.trim(), password)
      } else {
        await register(username.trim(), password, email.trim())
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(15,23,42,0.06),_transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(2,6,23,0.9),_transparent_50%)]"
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:right-6 md:top-6"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Fitness Tracker
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Sign in to continue' : 'Create an account to get started'}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/30"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/30"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 6 : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/30"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting
                ? mode === 'login'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
