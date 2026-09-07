import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWorkouts } from '../api/workouts'
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar'
import ExerciseProgressChart from '../components/dashboard/ExerciseProgressChart'

const monthKey = (year, month) => `${year}-${month}`

const monthDateRange = (year, month) => {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
  return { date_after: start, date_before: end }
}

function DashboardPage() {
  const today = new Date()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchedMonthsRef = useRef(new Set())

  const mergeWorkouts = useCallback((incoming) => {
    setWorkouts((prev) => {
      const byId = new Map(prev.map((workout) => [workout.id, workout]))
      incoming.forEach((workout) => {
        byId.set(workout.id, workout)
      })
      return Array.from(byId.values())
    })
  }, [])

  const ensureMonthLoaded = useCallback(
    async (year, month, { isInitial = false } = {}) => {
      const key = monthKey(year, month)
      if (fetchedMonthsRef.current.has(key)) {
        if (isInitial) setLoading(false)
        return
      }
      fetchedMonthsRef.current.add(key)

      if (isInitial) setLoading(true)

      try {
        const res = await fetchWorkouts(monthDateRange(year, month))
        const list = res.data.results ?? res.data
        mergeWorkouts(Array.isArray(list) ? list : [])
      } catch (err) {
        fetchedMonthsRef.current.delete(key)
        console.error('Failed to load workouts for month', err)
      } finally {
        if (isInitial) setLoading(false)
      }
    },
    [mergeWorkouts]
  )

  useEffect(() => {
    ensureMonthLoaded(today.getFullYear(), today.getMonth(), { isInitial: true })
  }, [ensureMonthLoaded])

  const upsertWorkout = (workout) => {
    if (!workout) return
    setWorkouts((prev) => {
      const without = prev.filter(
        (item) => item.id !== workout.id && item.date !== workout.date
      )
      return [...without, workout]
    })
    if (workout.date) {
      const [y, m] = workout.date.split('-').map(Number)
      fetchedMonthsRef.current.add(monthKey(y, m - 1))
    }
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
        onViewMonthChange={ensureMonthLoaded}
      />
      <ExerciseProgressChart workouts={workouts} loading={loading} />
    </div>
  )
}

export default DashboardPage
