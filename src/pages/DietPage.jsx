import { useEffect, useState } from 'react'
import { fetchMeals } from '../api/diet'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function DietPage() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeals()
      .then((res) => setMeals(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Diet Tracker</h2>
          <p className="text-slate-400">Log meals fast and monitor macros at a glance.</p>
        </div>
        <button className="inline-flex rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400">
          Add Meal
        </button>
      </div>

      <div className="space-y-4">
        {meals.length ? (
          meals.map((meal) => (
            <div key={meal.id} className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{meal.meal_type}</h3>
                  <p className="text-slate-400">{meal.date}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">{meal.items.length} items</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No meals logged yet. Capture breakfast, lunch, dinner, or snacks effortlessly.
          </div>
        )}
      </div>
    </div>
  )
}

export default DietPage
