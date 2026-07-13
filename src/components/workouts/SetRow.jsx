import { useState } from 'react'
import { updateExerciseSet, deleteExerciseSet } from '../../api/exercises'

function SetRow({ set, onSetUpdated, onSetDeleted }) {
  const [weight, setWeight] = useState(set.weight)
  const [reps, setReps] = useState(set.reps)
  const [completed, setCompleted] = useState(set.completed)
  const [notes, setNotes] = useState(set.notes || '')
  const [showNotes, setShowNotes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        completed,
        notes,
        set_number: set.set_number,
        workout_exercise: set.workout_exercise,
      }
      const res = await updateExerciseSet(set.id, payload)
      if (onSetUpdated) {
        onSetUpdated(res.data)
      }
    } catch (err) {
      console.error('Failed to update set', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this set?')) return
    setDeleting(true)
    try {
      await deleteExerciseSet(set.id)
      if (onSetDeleted) {
        onSetDeleted(set.id)
      }
    } catch (err) {
      console.error('Failed to delete set', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          onBlur={handleSave}
          className="h-4 w-4 cursor-pointer rounded accent-indigo-500"
        />

        {/* Set Number Label */}
        <span className="min-w-fit text-sm font-medium text-slate-400">Set {set.set_number}</span>

        {/* Weight Input */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={handleSave}
            placeholder="0"
            className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-500">kg</span>
        </div>

        {/* Reps Input */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-600">×</span>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onBlur={handleSave}
            placeholder="0"
            className="w-14 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Notes Button */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex-1 rounded px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-300"
        >
          {showNotes ? '✓' : 'Notes'}
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-900/20 disabled:opacity-60"
        >
          ×
        </button>
      </div>

      {/* Notes Field */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add notes for this set..."
            rows="2"
            className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  )
}

export default SetRow
