import { useEffect, useState } from 'react'
import { fetchDashboard } from '../api/workouts'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar'
import ExerciseProgressChart from '../components/dashboard/ExerciseProgressChart'

function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <WorkoutCalendar />
      <ExerciseProgressChart />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Today’s Calories</div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.nutrition.calories}</div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Today’s Protein</div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.nutrition.protein}</div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Current Weight</div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.current_weight ?? '—'}</div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Workout Streak</div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.streak}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Today's Workout</h2>
          {data.today_workout ? (
            <div className="mt-4 space-y-3 text-slate-300">
              <div>{data.today_workout.date} • {data.today_workout.split}</div>
              <div>{data.today_workout.notes || 'No notes for today.'}</div>
            </div>
          ) : (
            <div className="mt-4 text-slate-400">No workout logged for today.</div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Upcoming Workout</h2>
          <div className="mt-4 text-slate-300">{data.upcoming_workout || 'Add a workout to begin tracking'}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
          <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500">Recent PRs</h3>
          <div className="mt-4 space-y-3">
            {data.recent_prs.length ? (
              data.recent_prs.map((pr, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-950 p-4">
                  <div className="text-sm text-slate-400">{pr.workout_exercise__exercise__name || 'Exercise'}</div>
                  <div className="mt-1 text-lg font-semibold text-white">{pr.max_weight} kg</div>
                </div>
              ))
            ) : (
              <div className="text-slate-400">No PRs yet. Log workout sets to track progress.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
