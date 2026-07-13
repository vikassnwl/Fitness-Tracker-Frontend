import { useEffect, useState } from 'react'
import { fetchBodyEntries } from '../api/bodyProgress'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function BodyProgressPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBodyEntries()
      .then((res) => setEntries(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Body Progress</h2>
          <p className="text-slate-400">Track weight, body fat, and measurements over time.</p>
        </div>
        <button className="inline-flex rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400">
          Add Entry
        </button>
      </div>

      <div className="space-y-4">
        {entries.length ? (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-3xl bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{entry.date}</h3>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">{entry.weight ?? '—'} kg</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-slate-300">Body Fat: {entry.body_fat ?? '—'}%</div>
                <div className="rounded-2xl bg-slate-950 p-3 text-slate-300">Chest: {entry.chest ?? '—'} cm</div>
                <div className="rounded-2xl bg-slate-950 p-3 text-slate-300">Waist: {entry.waist ?? '—'} cm</div>
                <div className="rounded-2xl bg-slate-950 p-3 text-slate-300">Arms: {entry.arms ?? '—'} cm</div>
                <div className="rounded-2xl bg-slate-950 p-3 text-slate-300">Legs: {entry.legs ?? '—'} cm</div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No body progress entries yet. Record your first measurement today.
          </div>
        )}
      </div>
    </div>
  )
}

export default BodyProgressPage
