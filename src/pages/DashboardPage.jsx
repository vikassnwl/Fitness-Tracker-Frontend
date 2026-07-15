import WorkoutCalendar from '../components/dashboard/WorkoutCalendar'
import ExerciseProgressChart from '../components/dashboard/ExerciseProgressChart'

function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      <WorkoutCalendar />
      <ExerciseProgressChart />
    </div>
  )
}

export default DashboardPage
