import { useState } from 'react'
import { createWorkout } from '../../api/workouts'

const WORKOUT_TYPES = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'upper', label: 'Upper' },
  { value: 'lower', label: 'Lower' },
  { value: 'full', label: 'Full Body' },
  { value: 'custom', label: 'Custom' },
]

function NewWorkoutModal({ isOpen, onClose, onWorkoutCreated }) {
  const [workoutName, setWorkoutName] = useState('')
  const [workoutType, setWorkoutType] = useState('full')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const validateForm = () => {
    if (!workoutName.trim()) {
      setError('Workout Name is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: workoutName.trim(),
        workout_type: workoutType,
        notes: notes.trim(),
      }
      const res = await createWorkout(payload)
      const created = res.data || res

      // Reset form
      setWorkoutName('')
      setWorkoutType('full')
      setNotes('')

      // Close modal and notify parent
      onClose()
      if (onWorkoutCreated) {
        onWorkoutCreated(created)
      }
    } catch (err) {
      console.error('Failed to create workout', err)
      const msg =
        err.response && err.response.data
          ? JSON.stringify(err.response.data)
          : err.message
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setWorkoutName('')
    setWorkoutType('full')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-semibold text-white">New Workout Split</h2>
        <p className="mb-6 text-slate-400">Create a new workout split to organize your training.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workout Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Workout Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Push A, Leg Day, etc."
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          {/* Workout Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300">Workout Type</label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={saving}
            >
              {WORKOUT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this workout split..."
              rows="3"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-900/60 p-3 text-sm text-red-100">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewWorkoutModal
