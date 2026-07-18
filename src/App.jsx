import { BrowserRouter, useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Topbar from './components/layout/Topbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function AppShell() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const isAuthPage = location.pathname === '/login'
  const showAppChrome = !isAuthPage && (loading || isAuthenticated)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {showAppChrome ? (
        <div className="min-h-screen overflow-hidden">
          <Topbar />
          <main className="p-4 md:p-6 lg:p-8">
            <AppRoutes />
          </main>
        </div>
      ) : (
        <AppRoutes />
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
