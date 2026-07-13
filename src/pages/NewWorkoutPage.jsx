import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWorkout } from '../api/workouts'

function NewWorkoutPage() {
  const [split, setSplit] = useState('full')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { split, date }
      const res = await createWorkout(payload)
      const created = res.data || res
      if (created && created.id) {
        navigate(`/workouts/${created.id}`)
      } else {
        navigate('/workouts')
      }
    } catch (err) {
      console.error('Failed to create workout', err)
      const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-white">New Workout</h2>
      <p className="text-slate-400 mb-6">Create a new workout to start logging exercises.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300">Split</label>
          <select
            value={split}
            onChange={(e) => setSplit(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white"
          >
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="legs">Legs</option>
            <option value="full">Full Body</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-900/60 p-3 text-sm text-red-100">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create Workout'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewWorkoutPage
