import { NavLink } from 'react-router-dom'

const sections = [
  { label: 'Dashboard', path: '/' },
  { label: 'Workouts', path: '/workouts' },
  { label: 'Exercises', path: '/exercises' },
  { label: 'Notes', path: '/notes' },
  { label: 'Diet', path: '/diet' },
  { label: 'Body Progress', path: '/body-progress' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
]

function Sidebar() {
  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 md:h-screen md:w-64 md:border-r md:border-b-0">
      <div className="p-4 text-center text-xl font-semibold tracking-tight text-white">Fitness Tracker</div>
      <nav className="space-y-1 p-4">
        {sections.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
