import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createExerciseSet, deleteWorkoutExercise } from '../../api/exercises'
import SetRow from './SetRow'

function ExerciseCard({ workoutExercise, onExerciseDeleted }) {
  const [sets, setSets] = useState(workoutExercise.sets || [])
  const [addingSet, setAddingSet] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workoutExercise.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const exerciseName = workoutExercise.exercise_name || workoutExercise.custom_name || 'Exercise'
  const muscleGroup = workoutExercise.muscle_group || ''
  const equipment = workoutExercise.equipment || ''

  const handleAddSet = async () => {
    setAddingSet(true)
    try {
      const nextSetNumber = (sets.length > 0 ? Math.max(...sets.map((s) => s.set_number)) : 0) + 1
      const payload = {
        workout_exercise: workoutExercise.id,
        set_number: nextSetNumber,
        weight: 0,
        reps: 0,
        completed: false,
        notes: '',
      }
      const res = await createExerciseSet(payload)
      setSets([...sets, res.data])
    } catch (err) {
      console.error('Failed to add set', err)
    } finally {
      setAddingSet(false)
    }
  }

  const handleSetDeleted = (setId) => {
    setSets(sets.filter((s) => s.id !== setId))
  }

  const handleSetUpdated = (updatedSet) => {
    setSets(sets.map((s) => (s.id === updatedSet.id ? updatedSet : s)))
  }

  const handleDeleteExercise = async () => {
    if (!window.confirm(`Delete ${exerciseName}?`)) return
    setDeleting(true)
    try {
      await deleteWorkoutExercise(workoutExercise.id)
      if (onExerciseDeleted) {
        onExerciseDeleted(workoutExercise.id)
      }
    } catch (err) {
      console.error('Failed to delete exercise', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none text-slate-600 hover:text-slate-400 active:cursor-grabbing"
          title="Drag to reorder"
        >
          ⠿
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{exerciseName}</h3>
          <div className="mt-0.5 flex flex-wrap gap-2">
            {muscleGroup && (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                {muscleGroup}
              </span>
            )}
            {equipment && (
              <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">
                {equipment}
              </span>
            )}
          </div>
          {workoutExercise.notes && (
            <p className="mt-1 text-sm text-slate-400">{workoutExercise.notes}</p>
          )}
        </div>
        <button
          onClick={handleDeleteExercise}
          disabled={deleting}
          className="rounded px-2 py-1 text-sm font-medium text-red-400 hover:bg-red-900/20 disabled:opacity-60"
        >
          Remove
        </button>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {sets.length > 0 ? (
          sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              onSetUpdated={handleSetUpdated}
              onSetDeleted={handleSetDeleted}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-center text-sm text-slate-500">
            No sets yet. Click "Add Set" to get started.
          </div>
        )}
      </div>

      {/* Add Set Button */}
      <button
        onClick={handleAddSet}
        disabled={addingSet}
        className="mt-4 w-full rounded-lg border border-indigo-500 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/20 disabled:opacity-60"
      >
        {addingSet ? 'Adding...' : '+ Add Set'}
      </button>
    </div>
  )
}

export default ExerciseCard
