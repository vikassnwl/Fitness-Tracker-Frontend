import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Account and local preferences.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-lg dark:shadow-slate-950/20">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Signed in as <span className="font-medium text-slate-900 dark:text-white">{user?.username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
