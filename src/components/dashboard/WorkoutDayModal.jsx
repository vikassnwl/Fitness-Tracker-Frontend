import { useEffect, useState } from 'react'
import { createWorkout, fetchWorkout, fetchWorkouts, deleteWorkout } from '../../api/workouts'
import { createExerciseSet, createWorkoutExercise, updateExerciseSet } from '../../api/exercises'

const WEEKDAY_SPLIT = {
  1: 'Push',
  2: 'Pull',
  3: 'Leg',
  4: 'Push',
  5: 'Pull',
  6: 'Leg',
}

const PUSH_SPLIT_EXERCISES = [
  'Bench Press',
  'Inclined Chest Press',
  'Barbell Shoulder Press',
  'Chest Pec Dec Fly',
  'Shoulder Side Raises',
  'Tricep Rope Push Down',
  'Tricep Overhead Extension',
]

const PULL_SPLIT_EXERCISES = [
  'Wide grip lat pull down',
  'seated cable rows',
  'single arm dumbbell rows',
  'T bar rows',
  'Rear delts',
  'barbell curls',
  'hammer curls',
]

const LEG_SPLIT_EXERCISES = [
  'barbell squats',
  'leg press',
  'walking db lunges',
  'leg curl',
  'leg extension',
  'calf raises',
]

const SPLIT_EXERCISES = {
  Push: PUSH_SPLIT_EXERCISES,
  Pull: PULL_SPLIT_EXERCISES,
  Leg: LEG_SPLIT_EXERCISES,
}

const SPLIT_WORKOUT_TYPES = {
  Push: 'push',
  Pull: 'pull',
  Leg: 'legs',
}

const buildDefaultPlan = (exerciseNames) =>
  exerciseNames.map((exercise) => ({
    exercise,
    sets: [
      { set_number: 1, weight: '', reps: '' },
      { set_number: 2, weight: '', reps: '' },
      { set_number: 3, weight: '', reps: '' },
    ],
  }))

const buildPlanFromWorkout = (workoutDetail, exerciseNames) => {
  const exercisesByName = new Map(
    (workoutDetail?.exercises || []).map((exercise) => [
      (exercise.exercise_name || exercise.custom_name || '').trim().toLowerCase(),
      exercise,
    ])
  )

  return exerciseNames.map((exerciseName) => {
    const matchedExercise = exercisesByName.get(exerciseName.toLowerCase())
    const matchedSets = (matchedExercise?.sets || []).slice().sort((a, b) => a.set_number - b.set_number)

    return {
      exercise: exerciseName,
      sets: [1, 2, 3].map((setNumber, index) => ({
        set_number: setNumber,
        weight: matchedSets[index]?.weight ?? '',
        reps: matchedSets[index]?.reps ?? '',
      })),
    }
  })
}

function WorkoutDayModal({ isOpen, date, workout, onClose, onWorkoutCreated }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plannedWorkoutPlan, setPlannedWorkoutPlan] = useState(buildDefaultPlan(PUSH_SPLIT_EXERCISES))
  const [savingWorkoutLog, setSavingWorkoutLog] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 1600)
    return () => clearTimeout(timer)
  }, [toastMessage])

  useEffect(() => {
    let isCancelled = false

    if (!isOpen) {
      // Reset state when modal closes
      return
    }

    if (!workout) {
      setDetail(null)
      setLoading(false)
      const currentSplit = date ? WEEKDAY_SPLIT[new Date(date + 'T00:00:00').getDay()] : null
      if (currentSplit === 'Push' || currentSplit === 'Pull' || currentSplit === 'Leg') {
        const loadPreviousSplitValues = async () => {
          try {
            const workoutsRes = await fetchWorkouts()
            const workouts = workoutsRes.data.results ?? workoutsRes.data
            const splitWorkoutType = SPLIT_WORKOUT_TYPES[currentSplit]
            const previousSplitWorkout = workouts
              .filter(
                (entry) =>
                  entry.workout_type === splitWorkoutType && entry.date && entry.date < date
              )
              .sort((left, right) => right.date.localeCompare(left.date))[0]

            if (!previousSplitWorkout) {
              if (!isCancelled) {
                setPlannedWorkoutPlan(buildDefaultPlan(SPLIT_EXERCISES[currentSplit]))
              }
              return
            }

            const previousWorkoutRes = await fetchWorkout(previousSplitWorkout.id)
            if (!isCancelled) {
              setPlannedWorkoutPlan(
                buildPlanFromWorkout(previousWorkoutRes.data, SPLIT_EXERCISES[currentSplit])
              )
            }
          } catch (err) {
            console.error(`Failed to prefill previous ${currentSplit} workout values`, err)
            if (!isCancelled) {
              setPlannedWorkoutPlan(buildDefaultPlan(SPLIT_EXERCISES[currentSplit]))
            }
          }
        }

        loadPreviousSplitValues()
      }

      return () => {
        isCancelled = true
      }
    }

    setLoading(true)
    fetchWorkout(workout.id)
      .then((res) => setDetail(res.data))
      .catch((err) => console.error('Failed to load workout detail', err))
      .finally(() => setLoading(false))

    return () => {
      isCancelled = true
    }
  }, [isOpen, workout, date])

  if (!isOpen) return null

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('default', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''
  const dayIndex = date ? new Date(date + 'T00:00:00').getDay() : null
  const plannedSplit = dayIndex !== null ? (WEEKDAY_SPLIT[dayIndex] ?? 'Rest') : ''

  const handlePlannedWorkoutSetChange = (exerciseIdx, setIdx, field, value) => {
    setPlannedWorkoutPlan((prev) =>
      prev.map((entry, entryIndex) => {
        if (entryIndex !== exerciseIdx) return entry
        return {
          ...entry,
          sets: entry.sets.map((set, index) =>
            index === setIdx ? { ...set, [field]: value } : set
          ),
        }
      })
    )
  }

  const savePlannedWorkoutLog = async () => {
    if (!date || workout || (plannedSplit !== 'Push' && plannedSplit !== 'Pull' && plannedSplit !== 'Leg')) return

    setSavingWorkoutLog(true)
    try {
      const splitWorkoutType = SPLIT_WORKOUT_TYPES[plannedSplit]
      const createdWorkoutRes = await createWorkout({
        name: `${plannedSplit} Workout`,
        workout_type: splitWorkoutType,
        date,
      })
      const createdWorkout = createdWorkoutRes.data

      for (let exerciseIndex = 0; exerciseIndex < plannedWorkoutPlan.length; exerciseIndex += 1) {
        const exerciseEntry = plannedWorkoutPlan[exerciseIndex]
        const workoutExerciseRes = await createWorkoutExercise({
          workout: createdWorkout.id,
          exercise: null,
          custom_name: exerciseEntry.exercise,
          order: exerciseIndex,
        })
        const workoutExercise = workoutExerciseRes.data

        for (const setEntry of exerciseEntry.sets) {
          await createExerciseSet({
            workout_exercise: workoutExercise.id,
            set_number: setEntry.set_number,
            weight: parseFloat(setEntry.weight) || 0,
            reps: parseInt(setEntry.reps, 10) || 0,
            completed: false,
            notes: '',
          })
        }
      }

      if (onWorkoutCreated) {
        onWorkoutCreated(createdWorkout)
      }
      const fullWorkoutRes = await fetchWorkout(createdWorkout.id)
      setDetail(fullWorkoutRes.data)
      setToastMessage('Log saved')
    } catch (err) {
      console.error(`Failed to save performed ${plannedSplit} log`, err)
    } finally {
      setSavingWorkoutLog(false)
    }
  }

  const handleSetFieldChange = (workoutExerciseId, setId, field, value) => {
    setDetail((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== workoutExerciseId) return exercise
          return {
            ...exercise,
            sets: (exercise.sets || []).map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          }
        }),
      }
    })
  }

  const saveExistingWorkoutLog = async () => {
    if (!detail?.exercises?.length) return

    setSavingWorkoutLog(true)
    try {
      const updateRequests = detail.exercises.flatMap((exercise) =>
        (exercise.sets || []).map((set) =>
          updateExerciseSet(set.id, {
            workout_exercise: exercise.id,
            set_number: set.set_number,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps, 10) || 0,
            completed: Boolean(set.completed),
            notes: set.notes || '',
          })
        )
      )

      await Promise.all(updateRequests)

      const refreshedWorkoutRes = await fetchWorkout(detail.id)
      setDetail(refreshedWorkoutRes.data)
      setToastMessage('Log saved')
    } catch (err) {
      console.error('Failed to save existing workout log', err)
    } finally {
      setSavingWorkoutLog(false)
    }
  }

  const handleSaveWorkoutLog = async () => {
    if (workout) {
      await saveExistingWorkoutLog()
      return
    }

    await savePlannedWorkoutLog()
  }

  const handleDeleteWorkout = async () => {
    if (!detail?.id) return
    if (!confirm('Delete this workout log?')) return

    setSavingWorkoutLog(true)
    try {
      await deleteWorkout(detail.id)
      onWorkoutCreated?.(null)
      onClose()
    } catch (err) {
      console.error('Failed to delete workout', err)
    } finally {
      setSavingWorkoutLog(false)
    }
  }

  const isPlanningWorkout = !workout && (plannedSplit === 'Push' || plannedSplit === 'Pull' || plannedSplit === 'Leg')
  const modalTitle = workout
    ? (detail?.name ?? workout.name)
    : (isPlanningWorkout ? `${plannedSplit} Workout` : '')
  const loggedExercises = detail?.exercises ? [...detail.exercises].sort((a, b) => a.order - b.order) : []
  const displayedExercises = isPlanningWorkout
    ? plannedWorkoutPlan.map((entry, entryIndex) => ({
        id: `planned-${entryIndex}`,
        exercise_name: entry.exercise,
        sets: entry.sets,
        _mode: 'planned',
        _exerciseIndex: entryIndex,
      }))
    : loggedExercises.map((entry) => ({ ...entry, _mode: 'logged' }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg h-[85vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes modalToastSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {toastMessage && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
            <div
              className="rounded-lg border border-emerald-700/50 bg-emerald-900/85 px-3 py-1.5 text-xs font-medium text-emerald-100 shadow-lg"
              style={{ animation: 'modalToastSlideDown 180ms ease-out' }}
            >
              {toastMessage}
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-0 border-b border-slate-800">
          <div>
            {modalTitle && (
              <h2 className="text-xl font-semibold text-white">
                {modalTitle}
              </h2>
            )}
            <p className="mt-0.5 mb-1 text-sm text-slate-400">{formattedDate}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            ✕
          </button>
        </div>

        {(isPlanningWorkout || workout) && (
          <div className="px-6 py-6">
            <h3 className="text-sm font-semibold text-white">
              Log Performed Sets
            </h3>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 pt-0 space-y-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb:hover]:bg-slate-600">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading…</div>
          ) : !isPlanningWorkout && !workout ? null : !displayedExercises.length ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No exercises logged for this workout.
            </div>
          ) : (
            displayedExercises.map((exercise) => (
                <div key={exercise.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  {/* Exercise header */}
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="font-semibold text-white">{exercise.exercise_name ?? exercise.custom_name ?? 'Exercise'}</h3>
                    {exercise._mode === 'logged' && exercise.muscle_group && (
                      <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                        {exercise.muscle_group}
                      </span>
                    )}
                  </div>

                  {/* Sets table */}
                  {exercise.sets?.length ? (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-3 py-2">Set</th>
                            <th className="px-3 py-2">Weight</th>
                            <th className="px-3 py-2">Reps</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set, setIdx) => (
                            <tr
                              key={set.id ?? `${exercise.id}-${set.set_number}`}
                              className={[
                                'border-b border-slate-800/60 last:border-0',
                                exercise._mode === 'logged' && set.completed ? 'bg-emerald-950/20' : '',
                              ].join(' ')}
                            >
                              <td className="px-3 py-2 text-slate-400">{set.set_number}</td>
                              <td className="px-3 py-2 font-medium text-white">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={set.weight}
                                    onChange={(e) => {
                                      if (exercise._mode === 'planned') {
                                        handlePlannedWorkoutSetChange(exercise._exerciseIndex, setIdx, 'weight', e.target.value)
                                      } else {
                                        handleSetFieldChange(exercise.id, set.id, 'weight', e.target.value)
                                      }
                                    }}
                                    disabled={savingWorkoutLog}
                                    className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                  <span className="text-xs text-slate-500">kg</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 font-medium text-white">
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps}
                                  onChange={(e) => {
                                    if (exercise._mode === 'planned') {
                                      handlePlannedWorkoutSetChange(exercise._exerciseIndex, setIdx, 'reps', e.target.value)
                                    } else {
                                      handleSetFieldChange(exercise.id, set.id, 'reps', e.target.value)
                                    }
                                  }}
                                  disabled={savingWorkoutLog}
                                  className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">No sets recorded.</p>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-800 p-4">
          <button
            onClick={handleDeleteWorkout}
            disabled={savingWorkoutLog || !detail}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            Delete Log
          </button>
          <div className="ml-auto flex gap-3">
            {(isPlanningWorkout || workout) && (
              <button
                onClick={handleSaveWorkoutLog}
                disabled={savingWorkoutLog || loading}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingWorkoutLog ? 'Saving...' : 'Save Log'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkoutDayModal
