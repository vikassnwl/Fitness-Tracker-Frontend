import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWorkouts } from '../api/workouts'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import NewWorkoutModal from '../components/workouts/NewWorkoutModal'

const WORKOUT_TYPE_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  upper: 'Upper',
  lower: 'Lower',
  full: 'Full Body',
  custom: 'Custom',
}

function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadWorkouts = async () => {
    setLoading(true)
    try {
      const res = await fetchWorkouts()
      // Handle paginated response
      const data = res.data.results ? res.data.results : res.data
      setWorkouts(data)
    } catch (err) {
      console.error('Failed to load workouts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const handleWorkoutCreated = (newWorkout) => {
    // Add new workout to the list at the top
    setWorkouts((prev) => [newWorkout, ...prev])
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Workouts</h2>
          <p className="text-slate-400">Create workout splits and manage your training program.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400"
        >
          New Workout
        </button>
      </div>

      <div className="space-y-4">
        {workouts.length ? (
          workouts.map((workout) => (
            <Link
              key={workout.id}
              to={`/workouts/${workout.id}`}
              className="block rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.1em] text-slate-400">
                      {WORKOUT_TYPE_LABELS[workout.workout_type] || workout.workout_type}
                    </span>
                    {workout.date && <span className="text-slate-500">•</span>}
                    {workout.date && <span className="text-xs text-slate-500">{workout.date}</span>}
                  </div>
                  {workout.notes && (
                    <p className="mt-2 text-sm text-slate-400">{workout.notes}</p>
                  )}
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {workout.exercises.length} exercises
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No workouts found yet. Click "New Workout" to create your first workout split.
          </div>
        )}
      </div>

      <NewWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />
    </div>
  )
}

export default WorkoutsPage
