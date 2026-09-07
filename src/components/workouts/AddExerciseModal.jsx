import { useState } from 'react'
import { createExercise } from '../../api/exercises'

function AddExerciseModal({ isOpen, onClose, onExerciseSelected }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const resetState = () => {
    setName('')
    setCreating(false)
    setError(null)
  }

  const handleCreateExercise = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Enter an exercise name to create it.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const res = await createExercise({
        name: trimmedName,
        muscle_group: '',
        equipment: '',
        notes: '',
      })
      onExerciseSelected(res.data)
      resetState()
      onClose()
    } catch (err) {
      console.error('Failed to create exercise', err)
      const detail = err.response?.data
      const msg =
        typeof detail === 'object' && detail !== null
          ? detail.name?.[0] || detail.detail || JSON.stringify(detail)
          : err.message
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    resetState()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Add Exercise</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          Enter a name to create a new exercise.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !creating) handleCreateExercise()
            }}
            placeholder="Exercise name..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            disabled={creating}
            autoFocus
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/60 dark:text-red-100">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateExercise}
            disabled={creating || !name.trim()}
            className="w-full rounded-lg border border-indigo-500 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/20 disabled:opacity-60 dark:text-indigo-400"
          >
            {creating ? 'Creating…' : 'Create Exercise'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={creating}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddExerciseModal
