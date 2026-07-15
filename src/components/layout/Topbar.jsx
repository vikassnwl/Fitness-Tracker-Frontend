import { useTheme } from '../../context/ThemeContext'

function Topbar() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Fitness Tracker</h1>
      </div>
      <div className="inline-flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  )
}

export default Topbar
