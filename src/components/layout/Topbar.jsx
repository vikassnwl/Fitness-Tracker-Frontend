import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Topbar() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-semibold text-slate-900 dark:text-white">
          Fitness Tracker
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/exercises"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            Exercises
          </Link>
        </nav>
      </div>
      <div className="inline-flex items-center gap-3">
        {user && (
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
            {user.username}
          </span>
        )}
        <Link
          to="/exercises"
          className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:hidden"
        >
          Exercises
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
        {user && (
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
