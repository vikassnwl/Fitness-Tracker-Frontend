import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import WorkoutsPage from '../pages/WorkoutsPage'
import WorkoutDetailPage from '../pages/WorkoutDetailPage'
import NewWorkoutPage from '../pages/NewWorkoutPage'
import ExerciseLibraryPage from '../pages/ExerciseLibraryPage'
import DietPage from '../pages/DietPage'
import BodyProgressPage from '../pages/BodyProgressPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import SettingsPage from '../pages/SettingsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/workouts/new" element={<NewWorkoutPage />} />
      <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
      <Route path="/exercises" element={<ExerciseLibraryPage />} />
      <Route path="/diet" element={<DietPage />} />
      <Route path="/body-progress" element={<BodyProgressPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default AppRoutes
