import { useState, useCallback } from 'react'
import { searchExercises, createExercise } from '../../api/exercises'

function AddExerciseModal({ isOpen, onClose, onExerciseSelected }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create form state
  const [exerciseName, setExerciseName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [equipment, setEquipment] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    setError(null)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await searchExercises(query)
      setSearchResults(res.data)
    } catch (err) {
      console.error('Search failed', err)
      setError('Failed to search exercises')
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSelectExercise = (exercise) => {
    onExerciseSelected(exercise)
    onClose()
  }

  const handleCreateExercise = async (e) => {
    e.preventDefault()
    setError(null)

    if (!exerciseName.trim()) {
      setError('Exercise name is required')
      return
    }

    setCreating(true)
    try {
      const payload = {
        name: exerciseName.trim(),
        muscle_group: muscleGroup.trim(),
        equipment: equipment.trim(),
        notes: notes.trim(),
      }
      const res = await createExercise(payload)
      const created = res.data

      // Select the newly created exercise
      handleSelectExercise(created)
    } catch (err) {
      console.error('Failed to create exercise', err)
      const msg =
        err.response && err.response.data
          ? JSON.stringify(err.response.data)
          : err.message
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowCreateForm(false)
    setExerciseName('')
    setMuscleGroup('')
    setEquipment('')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-semibold text-white">
          {showCreateForm ? 'Create Exercise' : 'Add Exercise'}
        </h2>
        <p className="mb-6 text-slate-400">
          {showCreateForm
            ? 'Create a new exercise to add to your workout.'
            : 'Search for an exercise or create a new one.'}
        </p>

        {!showCreateForm ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search exercises by name or muscle group..."
                className="w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Search Results */}
            {searching && <div className="text-center text-sm text-slate-400">Searching...</div>}

            {searchResults.length > 0 && !searching && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {searchResults.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelectExercise(exercise)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left transition hover:bg-slate-700"
                  >
                    <h4 className="font-medium text-white">{exercise.name}</h4>
                    {exercise.muscle_group && (
                      <p className="text-xs text-slate-400">{exercise.muscle_group}</p>
                    )}
                    {exercise.equipment && (
                      <p className="text-xs text-slate-500">{exercise.equipment}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searching && searchQuery && searchResults.length === 0 && (
              <div className="rounded-lg bg-slate-800 p-4 text-center">
                <p className="text-sm text-slate-400">No exercises found.</p>
              </div>
            )}

            {/* Create New Button */}
            {!searching && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-lg border border-indigo-500 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/20"
              >
                Create New Exercise
              </button>
            )}

            {/* Error */}
            {error && <div className="rounded-lg bg-red-900/60 p-3 text-sm text-red-100">{error}</div>}

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateExercise} className="space-y-4">
            {/* Exercise Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Exercise Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Bench Press"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={creating}
              />
            </div>

            {/* Muscle Group */}
            <div>
              <label className="block text-sm font-medium text-slate-300">Muscle Group</label>
              <input
                type="text"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                placeholder="e.g., Chest, Back, Legs"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={creating}
              />
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-slate-300">Equipment</label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g., Barbell, Dumbbell"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={creating}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows="2"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={creating}
              />
            </div>

            {/* Error */}
            {error && <div className="rounded-lg bg-red-900/60 p-3 text-sm text-red-100">{error}</div>}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddExerciseModal
