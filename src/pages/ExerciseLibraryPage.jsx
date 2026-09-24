import { useEffect, useId, useState } from 'react'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import {
  createSplitDayExercise,
  deleteSplitDayExercise,
  fetchSplitDayExercises,
  reorderSplitDayExercises,
} from '../api/exercises'
import AddExerciseModal from '../components/workouts/AddExerciseModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const SPLIT_TABS = [
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'legs', label: 'Legs' },
]

function SortableRow({ id, disabled, children, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        className="cursor-grab touch-none text-slate-400 transition hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-slate-300"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        title="Remove from this day"
        aria-label="Remove from this day"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function ExerciseLibraryPage() {
  const dndId = useId()
  const [activeSplit, setActiveSplit] = useState('push')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const loadSplit = async (split) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchSplitDayExercises(split)
      const list = res.data.results ?? res.data
      setItems(Array.isArray(list) ? [...list].sort((a, b) => a.order - b.order) : [])
    } catch (err) {
      console.error('Failed to load split exercises', err)
      setError('Failed to load exercises for this day.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSplit(activeSplit)
  }, [activeSplit])

  const handleExerciseSelected = async (exercise) => {
    setBusy(true)
    setError('')
    try {
      const res = await createSplitDayExercise({
        split: activeSplit,
        exercise: exercise.id,
      })
      setItems((prev) => [...prev, res.data])
    } catch (err) {
      console.error('Failed to add split exercise', err)
      const detail = err.response?.data
      const message =
        detail?.non_field_errors?.[0] ||
        detail?.exercise?.[0] ||
        detail?.detail ||
        'Could not add that exercise. It may already be on this day.'
      setError(typeof message === 'string' ? message : 'Could not add that exercise.')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (entry) => {
    const name = entry.exercise_name || 'this exercise'
    if (!window.confirm(`Remove “${name}” from this day?`)) return

    setBusy(true)
    setError('')
    const previous = items
    setItems((prev) => prev.filter((item) => item.id !== entry.id))
    try {
      await deleteSplitDayExercise(entry.id)
    } catch (err) {
      console.error('Failed to remove split exercise', err)
      setItems(previous)
      setError('Failed to remove exercise.')
    } finally {
      setBusy(false)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((entry) => entry.id === active.id)
    const newIndex = items.findIndex((entry) => entry.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const previous = items
    const reordered = arrayMove(items, oldIndex, newIndex).map((entry, index) => ({
      ...entry,
      order: index,
    }))
    setItems(reordered)

    try {
      await reorderSplitDayExercises(reordered.map((entry, index) => ({ id: entry.id, order: index })))
    } catch (err) {
      console.error('Failed to reorder split exercises', err)
      setItems(previous)
      setError('Failed to save order.')
    }
  }

  const activeLabel = SPLIT_TABS.find((tab) => tab.key === activeSplit)?.label ?? 'Push'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Exercises</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Set the lifts for each training day. These show up automatically when you log sets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          disabled={busy || loading}
          className="inline-flex rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          + Add Exercise
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
        {SPLIT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSplit(tab.key)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              activeSplit === tab.key
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            No exercises on {activeLabel} day yet.
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Add your first {activeLabel} exercise
          </button>
        </div>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((entry) => (
                <SortableRow
                  key={entry.id}
                  id={entry.id}
                  disabled={busy}
                  onRemove={() => handleRemove(entry)}
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {entry.exercise_name}
                    </p>
                    {(entry.muscle_group || entry.equipment) && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[entry.muscle_group, entry.equipment].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddExerciseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onExerciseSelected={handleExerciseSelected}
      />
    </div>
  )
}

export default ExerciseLibraryPage
