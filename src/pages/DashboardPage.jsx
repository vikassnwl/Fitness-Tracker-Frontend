import { useEffect, useState } from 'react'
import { fetchWorkouts } from '../api/workouts'
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar'
import ExerciseProgressChart from '../components/dashboard/ExerciseProgressChart'

function DashboardPage() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
      .then((res) => {
        const list = res.data.results ?? res.data
        setWorkouts(Array.isArray(list) ? list : [])
      })
      .catch((err) => console.error('Failed to load workouts for dashboard', err))
      .finally(() => setLoading(false))
  }, [])

  const upsertWorkout = (workout) => {
    if (!workout) return
    setWorkouts((prev) => {
      const without = prev.filter(
        (item) => item.id !== workout.id && item.date !== workout.date
      )
      return [...without, workout]
    })
  }

  const removeWorkout = (workoutId, date) => {
    setWorkouts((prev) =>
      prev.filter((item) => item.id !== workoutId && item.date !== date)
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      <WorkoutCalendar
        workouts={workouts}
        loading={loading}
        onUpsertWorkout={upsertWorkout}
        onRemoveWorkout={removeWorkout}
      />
      <ExerciseProgressChart workouts={workouts} loading={loading} />
    </div>
  )
}

export default DashboardPage
