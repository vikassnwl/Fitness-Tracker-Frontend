import { useEffect, useState } from 'react'
import { createWorkout, fetchWorkout, fetchWorkouts, deleteWorkout } from '../../api/workouts'
import { createExerciseSet, createWorkoutExercise, updateExerciseSet } from '../../api/exercises'
import { fetchDietLog, saveDietLog, deleteDietLog } from '../../api/diet'

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

const buildDefaultPushPlan = () =>
  PUSH_SPLIT_EXERCISES.map((exercise) => ({
    exercise,
    sets: [
      { set_number: 1, weight: '', reps: '' },
      { set_number: 2, weight: '', reps: '' },
      { set_number: 3, weight: '', reps: '' },
    ],
  }))

const buildPushPlanFromWorkout = (workoutDetail) => {
  const exercisesByName = new Map(
    (workoutDetail?.exercises || []).map((exercise) => [
      (exercise.exercise_name || exercise.custom_name || '').trim().toLowerCase(),
      exercise,
    ])
  )

  return PUSH_SPLIT_EXERCISES.map((exerciseName) => {
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
  const [activeTab, setActiveTab] = useState('workout')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plannedPushPlan, setPlannedPushPlan] = useState(buildDefaultPushPlan())
  const [savingWorkoutLog, setSavingWorkoutLog] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [dietLog, setDietLog] = useState({
    meal1: false,
    meal2: false,
    meal3: false,
    meal4: false,
  })

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
      if (date && WEEKDAY_SPLIT[new Date(date + 'T00:00:00').getDay()] === 'Push') {
        const loadPreviousPushValues = async () => {
          try {
            const workoutsRes = await fetchWorkouts()
            const workouts = workoutsRes.data.results ?? workoutsRes.data
            const previousPushWorkout = workouts
              .filter((entry) => entry.workout_type === 'push' && entry.date && entry.date < date)
              .sort((left, right) => right.date.localeCompare(left.date))[0]

            if (!previousPushWorkout) {
              if (!isCancelled) {
                setPlannedPushPlan(buildDefaultPushPlan())
              }
              return
            }

            const previousWorkoutRes = await fetchWorkout(previousPushWorkout.id)
            if (!isCancelled) {
              setPlannedPushPlan(buildPushPlanFromWorkout(previousWorkoutRes.data))
            }
          } catch (err) {
            console.error('Failed to prefill previous Push workout values', err)
            if (!isCancelled) {
              setPlannedPushPlan(buildDefaultPushPlan())
            }
          }
        }

        loadPreviousPushValues()
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

  // Separate effect for loading diet log
  useEffect(() => {
    if (!isOpen || !date) return

    let isCancelled = false

    fetchDietLog(date)
      .then((res) => {
        if (!isCancelled && res.data) {
          setDietLog({
            meal1: res.data.meal1 || false,
            meal2: res.data.meal2 || false,
            meal3: res.data.meal3 || false,
            meal4: res.data.meal4 || false,
          })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setDietLog({ meal1: false, meal2: false, meal3: false, meal4: false })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, date])

  if (!isOpen) return null

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('default', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''
  const dayIndex = date ? new Date(date + 'T00:00:00').getDay() : null
  const plannedSplit = dayIndex !== null ? (WEEKDAY_SPLIT[dayIndex] ?? 'Rest') : ''

  const handlePlannedPushSetChange = (exerciseIdx, setIdx, field, value) => {
    setPlannedPushPlan((prev) =>
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

  const savePerformedPushLog = async () => {
    if (!date || plannedSplit !== 'Push' || workout) return

    setSavingWorkoutLog(true)
    try {
      const createdWorkoutRes = await createWorkout({
        name: 'Push Workout',
        workout_type: 'push',
        date,
      })
      const createdWorkout = createdWorkoutRes.data

      for (let exerciseIndex = 0; exerciseIndex < plannedPushPlan.length; exerciseIndex += 1) {
        const exerciseEntry = plannedPushPlan[exerciseIndex]
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
      console.error('Failed to save performed Push log', err)
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

    await savePerformedPushLog()
  }

  const handleSaveDietLog = async () => {
    if (!date) return

    setSavingWorkoutLog(true)
    try {
      await saveDietLog(date, dietLog)
      setToastMessage('Log saved')
    } catch (err) {
      console.error('Failed to save diet log', err)
    } finally {
      setSavingWorkoutLog(false)
    }
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

  const handleDeleteDietLog = async () => {
    if (!date) return
    if (!confirm('Delete this diet log?')) return

    setSavingWorkoutLog(true)
    try {
      await deleteDietLog(date)
      setDietLog({ meal1: false, meal2: false, meal3: false, meal4: false })
      onClose()
    } catch (err) {
      if (err?.response?.status === 404) {
        setDietLog({ meal1: false, meal2: false, meal3: false, meal4: false })
        onClose()
      } else {
        console.error('Failed to delete diet log', err)
      }
    } finally {
      setSavingWorkoutLog(false)
    }
  }

  const handleDeleteLog = async () => {
    if (activeTab === 'diet') {
      await handleDeleteDietLog()
      return
    }

    await handleDeleteWorkout()
  }

  const isPlanningPush = !workout && plannedSplit === 'Push'
  const loggedExercises = detail?.exercises ? [...detail.exercises].sort((a, b) => a.order - b.order) : []
  const displayedExercises = isPlanningPush
    ? plannedPushPlan.map((entry, entryIndex) => ({
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
        {/* Header with Tabs */}
        <div className="flex items-start justify-between gap-4 p-6 pb-0 border-b border-slate-800">
          <div>
            {workout && (
              <h2 className="text-xl font-semibold text-white">
                {detail?.name ?? workout.name}
              </h2>
            )}
            <p className="mt-0.5 mb-1 text-sm text-slate-400">{formattedDate}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 border-b border-slate-800 px-6 pt-4">
          <button
            onClick={() => setActiveTab('workout')}
            className={`pb-3 px-2 text-sm font-medium transition ${ 
              activeTab === 'workout'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Workout Log
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`pb-3 px-2 text-sm font-medium transition ${
              activeTab === 'diet'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Diet Log
          </button>
        </div>

        {(activeTab === 'diet' || (activeTab === 'workout' && (isPlanningPush || workout))) && (
          <div className="px-6 py-6">
            <h3 className="text-sm font-semibold text-white">
              {activeTab === 'diet' ? 'Daily Meals' : 'Log Performed Sets'}
            </h3>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 pt-0 space-y-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb:hover]:bg-slate-600">
          {activeTab === 'workout' && (
            <>
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Loading…</div>
              ) : !isPlanningPush && !workout ? null : !displayedExercises.length ? (
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
                                        handlePlannedPushSetChange(exercise._exerciseIndex, setIdx, 'weight', e.target.value)
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
                                      handlePlannedPushSetChange(exercise._exerciseIndex, setIdx, 'reps', e.target.value)
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
            </>
          )}

          {activeTab === 'diet' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {['meal1', 'meal2', 'meal3', 'meal4'].map((meal, idx) => (
                  <label key={meal} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietLog[meal]}
                      onChange={(e) => setDietLog({ ...dietLog, [meal]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">Meal {idx + 1}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-800 p-4">
          <button
            onClick={handleDeleteLog}
            disabled={savingWorkoutLog || (activeTab === 'workout' && !detail)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            Delete Log
          </button>
          <div className="ml-auto flex gap-3">
            {activeTab === 'diet' && (
              <button
                onClick={handleSaveDietLog}
                disabled={savingWorkoutLog}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingWorkoutLog ? 'Saving...' : 'Save Log'}
              </button>
            )}
            {activeTab === 'workout' && detail && (
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
