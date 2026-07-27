import { useState, useCallback } from 'react'
import { searchExercises, createExercise } from '../../api/exercises'

function AddExerciseModal({ isOpen, onClose, onExerciseSelected }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const resetState = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearching(false)
    setCreating(false)
    setError(null)
  }

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
    resetState()
    onClose()
  }

  const handleCreateExercise = async () => {
    const name = searchQuery.trim()
    if (!name) {
      setError('Type an exercise name to create it.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const res = await createExercise({
        name,
        muscle_group: '',
        equipment: '',
        notes: '',
      })
      handleSelectExercise(res.data)
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

  const trimmedQuery = searchQuery.trim()
  const exactMatch = searchResults.some(
    (exercise) => exercise.name.trim().toLowerCase() === trimmedQuery.toLowerCase()
  )
  const canCreate = Boolean(trimmedQuery) && !searching && !exactMatch

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Add Exercise</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          Search your library, or type a new name and create it.
        </p>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search or type a new exercise name..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              disabled={creating}
              autoFocus
            />
          </div>

          {searching && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">Searching...</div>
          )}

          {searchResults.length > 0 && !searching && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {searchResults.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleSelectExercise(exercise)}
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <h4 className="font-medium text-slate-900 dark:text-white">{exercise.name}</h4>
                  {exercise.muscle_group && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.muscle_group}</p>
                  )}
                  {exercise.equipment && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">{exercise.equipment}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {!searching && trimmedQuery && searchResults.length === 0 && (
            <div className="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No matching exercises in your library.
              </p>
            </div>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={handleCreateExercise}
              disabled={creating}
              className="w-full rounded-lg border border-indigo-500 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/20 disabled:opacity-60 dark:text-indigo-400"
            >
              {creating ? 'Creating…' : `Create “${trimmedQuery}”`}
            </button>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/60 dark:text-red-100">
              {error}
            </div>
          )}

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
