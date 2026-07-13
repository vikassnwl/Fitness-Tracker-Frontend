import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="md:flex">
          <Sidebar />
          <div className="flex-1 md:min-h-screen md:overflow-hidden">
            <Topbar />
            <main className="p-4 md:p-6">
              <AppRoutes />
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
