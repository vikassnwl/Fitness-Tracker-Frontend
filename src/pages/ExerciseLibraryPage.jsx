import { useEffect, useState } from 'react'
import { fetchExercises } from '../api/exercises'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExercises()
      .then((res) => setExercises(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Exercise Library</h2>
          <p className="text-slate-400">Track exercises by muscle group, equipment, and notes.</p>
        </div>
        <button className="inline-flex rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400">
          Add Exercise
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {exercises.length ? (
          exercises.map((exercise) => (
            <div key={exercise.id} className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
              <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
              <p className="mt-2 text-slate-400">{exercise.muscle_group || 'General'}</p>
              <p className="mt-1 text-sm text-slate-500">{exercise.equipment || 'Bodyweight / Misc'}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No exercises created yet. Add a custom exercise to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseLibraryPage
