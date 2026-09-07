import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Exercises', path: '/exercises' },
  { label: 'Notes', path: '/notes' },
]

function Topbar() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900 sm:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="text-xl font-semibold text-slate-900 dark:text-white">
            Fitness Tracker
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="inline-flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
              {user.username}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Log out
            </button>
          )}
        </div>
      </div>

      {/* Mobile side drawer (Android-style) */}
      <div className="sm:hidden" aria-hidden={!menuOpen}>
        <button
          type="button"
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label="Close menu overlay"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white transition-[transform,box-shadow] duration-300 ease-out dark:bg-slate-950 ${
            menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Fitness Tracker</p>
              {user && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user.username}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-base font-medium transition ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {user && (
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl px-4 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Log out
              </button>
            </div>
          )}
        </aside>
      </div>
    </header>
  )
}

export default Topbar
