import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { fetchWorkout, deleteWorkout } from '../api/workouts'
import { createWorkoutExercise, createExerciseSet, reorderWorkoutExercises } from '../api/exercises'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AddExerciseModal from '../components/workouts/AddExerciseModal'
import ExerciseCard from '../components/workouts/ExerciseCard'

const WORKOUT_TYPE_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  upper: 'Upper',
  lower: 'Lower',
  full: 'Full Body',
  custom: 'Custom',
}

function WorkoutDetailPage() {
  const { id } = useParams()
  const [workout, setWorkout] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addingExercise, setAddingExercise] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDeleteWorkout = async () => {
    if (!window.confirm(`Delete "${workout?.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteWorkout(id)
      navigate('/workouts')
    } catch (err) {
      console.error('Failed to delete workout', err)
      setDeleting(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const loadWorkout = async () => {
    setLoading(true)
    try {
      const res = await fetchWorkout(id)
      const data = res.data
      setWorkout(data)
      const exercisesData = data.exercises
        ? [...data.exercises].sort((a, b) => a.order - b.order)
        : []
      setExercises(exercisesData)
    } catch (err) {
      console.error('Failed to load workout', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkout()
  }, [id])

  const handleExerciseSelected = async (exercise) => {
    setAddingExercise(true)
    try {
      const nextOrder = exercises.length
      const payload = {
        workout: parseInt(id),
        exercise: exercise.id,
        order: nextOrder,
      }
      const res = await createWorkoutExercise(payload)
      const newWorkoutExercise = res.data

      // Create 3 default empty sets
      const setPromises = [1, 2, 3].map((setNum) =>
        createExerciseSet({
          workout_exercise: newWorkoutExercise.id,
          set_number: setNum,
          weight: 0,
          reps: 0,
          completed: false,
          notes: '',
        })
      )
      const setResults = await Promise.all(setPromises)
      const newSets = setResults.map((r) => r.data)

      const enriched = {
        ...newWorkoutExercise,
        sets: newSets,
        muscle_group: exercise.muscle_group || '',
        equipment: exercise.equipment || '',
      }
      setExercises((prev) => [...prev, enriched])
    } catch (err) {
      console.error('Failed to add exercise', err)
    } finally {
      setAddingExercise(false)
    }
  }

  const handleExerciseDeleted = (exerciseId) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId))
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = exercises.findIndex((e) => e.id === active.id)
    const newIndex = exercises.findIndex((e) => e.id === over.id)
    const reordered = arrayMove(exercises, oldIndex, newIndex)

    setExercises(reordered)

    const orderPayload = reordered.map((e, i) => ({ id: e.id, order: i }))
    try {
      await reorderWorkoutExercises(orderPayload)
    } catch (err) {
      console.error('Failed to persist order', err)
      setExercises(exercises)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!workout) return <div className="text-slate-400">Workout not found.</div>

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white">{workout.name}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm uppercase tracking-[0.1em] text-slate-400">
                {WORKOUT_TYPE_LABELS[workout.workout_type] || workout.workout_type}
              </span>
              {workout.date && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-500">{workout.date}</span>
                </>
              )}
            </div>
            {workout.notes && <p className="mt-3 text-slate-400">{workout.notes}</p>}
          </div>
          <button
            onClick={handleDeleteWorkout}
            disabled={deleting}
            className="rounded-xl border border-red-800/50 bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-900/60 hover:text-red-300 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Workout'}
          </button>
        </div>
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={addingExercise}
        className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-60"
      >
        {addingExercise ? 'Adding...' : '+ Add Exercise'}
      </button>

      {/* Exercises List with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  workoutExercise={exercise}
                  onExerciseDeleted={handleExerciseDeleted}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
                No exercises added yet. Click &ldquo;+ Add Exercise&rdquo; to get started.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExerciseSelected={handleExerciseSelected}
      />
    </div>
  )
}

export default WorkoutDetailPage
