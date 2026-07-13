import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchWorkouts } from '../../api/workouts'

const SPLIT_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Leg',
  upper: 'Upper',
  lower: 'Lower',
  full: 'Full Body',
  custom: 'Custom',
}

const CALENDAR_MODAL_SPLITS = {
  push: {
    workoutName: 'Push Workout',
    exercises: [
      'Bench Press',
      'Inclined Chest Press',
      'Barbell Shoulder Press',
      'Chest Pec Dec Fly',
      'Shoulder Side Raises',
      'Tricep Rope Push Down',
      'Tricep Overhead Extension',
    ],
  },
}

const isCalendarModalWorkout = (workout) => {
  const config = CALENDAR_MODAL_SPLITS[workout.workout_type]
  if (!config) return false
  return workout.name === config.workoutName
}

function ExerciseProgressChart() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSplit, setSelectedSplit] = useState('push')
  const [selectedExercise, setSelectedExercise] = useState('')

  useEffect(() => {
    fetchWorkouts()
      .then((res) => {
        const list = res.data.results ?? res.data
        setWorkouts(list)
      })
      .catch((err) => console.error('Failed to load workouts for progress chart', err))
      .finally(() => setLoading(false))
  }, [])

  const modalWorkouts = useMemo(
    () => workouts.filter((workout) => isCalendarModalWorkout(workout)),
    [workouts]
  )

  const splitOptions = useMemo(() => {
    const foundSplits = Array.from(new Set(modalWorkouts.map((workout) => workout.workout_type).filter(Boolean)))
    return foundSplits.sort((left, right) => (SPLIT_LABELS[left] ?? left).localeCompare(SPLIT_LABELS[right] ?? right))
  }, [modalWorkouts])

  const exerciseOptions = useMemo(() => {
    const config = CALENDAR_MODAL_SPLITS[selectedSplit]
    if (!config) return []

    const availableNames = new Set()

    modalWorkouts
      .filter((workout) => workout.workout_type === selectedSplit)
      .forEach((workout) => {
        ;(workout.exercises || []).forEach((exercise) => {
          const name = (exercise.exercise_name || exercise.custom_name || '').trim()
          if (name) {
            availableNames.add(name)
          }
        })
      })

    return config.exercises.filter((exerciseName) => availableNames.has(exerciseName))
  }, [selectedSplit, modalWorkouts])

  useEffect(() => {
    if (!splitOptions.length) {
      setSelectedSplit('')
      return
    }

    if (!splitOptions.includes(selectedSplit)) {
      setSelectedSplit(splitOptions[0])
    }
  }, [selectedSplit, splitOptions])

  useEffect(() => {
    if (!exerciseOptions.length) {
      setSelectedExercise('')
      return
    }

    if (!exerciseOptions.includes(selectedExercise)) {
      setSelectedExercise(exerciseOptions[0])
    }
  }, [exerciseOptions, selectedExercise])

  const chartData = useMemo(() => {
    if (!selectedSplit || !selectedExercise) {
      return []
    }

    return workouts
      .filter(
        (workout) =>
          isCalendarModalWorkout(workout) &&
          workout.workout_type === selectedSplit &&
          workout.date
      )
      .map((workout) => {
        const matchingExercise = (workout.exercises || []).find((exercise) => {
          const name = (exercise.exercise_name || exercise.custom_name || '').trim()
          return name === selectedExercise
        })

        if (!matchingExercise || !matchingExercise.sets?.length) {
          return null
        }

        const orderedSets = [...matchingExercise.sets].sort((left, right) => left.set_number - right.set_number)
        const heaviestSet = orderedSets.find((s) => s.set_number === 3) ?? orderedSets[orderedSets.length - 1]

        const totalVolume = orderedSets.reduce(
          (sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0),
          0
        )

        const w = Number(heaviestSet?.weight) || 0
        const r = Number(heaviestSet?.reps) || 0
        return {
          date: workout.date,
          score: parseFloat((w * (1 + r / 100)).toFixed(3)),
          weight: w,
          reps: r,
          volume: totalVolume,
        }
      })
      .filter(Boolean)
      .sort((left, right) => left.date.localeCompare(right.date))
  }, [selectedExercise, selectedSplit, workouts])

  return (
    <section className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Exercise Progress</h2>
          <p className="text-slate-400">Score = weight × (1 + reps/100). e.g. 22.5kg × 2 reps ➜ 22.95 vs 20kg × 10 reps ➜ 22.0</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Split</span>
            <select
              value={selectedSplit}
              onChange={(e) => setSelectedSplit(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {splitOptions.length ? (
                splitOptions.map((split) => (
                  <option key={split} value={split}>
                    {SPLIT_LABELS[split] ?? split}
                  </option>
                ))
              ) : (
                <option value="">No splits found</option>
              )}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Exercise</span>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              disabled={!exerciseOptions.length}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {exerciseOptions.length ? (
                exerciseOptions.map((exercise) => (
                  <option key={exercise} value={exercise}>
                    {exercise}
                  </option>
                ))
              ) : (
                <option value="">No exercises found</option>
              )}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading progress…</div>
        ) : chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#818cf8" tickFormatter={(v) => v.toFixed(2)} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#e2e8f0',
                }}
                formatter={(value, _name, props) => [
                  `${props.payload.weight} kg × ${props.payload.reps} reps`,
                  'Best Set',
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Score"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-sm text-slate-500">
            Log more workouts for this exercise to see progress.
          </div>
        )}
      </div>
    </section>
  )
}

export default ExerciseProgressChart
