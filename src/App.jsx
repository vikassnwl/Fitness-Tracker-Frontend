import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Topbar from './components/layout/Topbar'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="min-h-screen overflow-hidden">
            <Topbar />
            <main className="p-4 md:p-6 lg:p-8">
              <AppRoutes />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
