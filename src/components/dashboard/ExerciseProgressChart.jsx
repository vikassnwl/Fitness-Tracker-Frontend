import { useEffect, useRef, useState } from 'react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { fetchExerciseProgress } from '../../api/workouts'
import { fetchSplitDayExercises } from '../../api/exercises'

const SPLIT_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Leg',
}

const SPLIT_OPTIONS = ['push', 'pull', 'legs']

function Dropdown({ label, value, options, onChange, disabled = false, labelMap = {} }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-500">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        {options.length ? (
          options.map((opt) => (
            <option key={opt} value={opt}>
              {labelMap[opt] || opt}
            </option>
          ))
        ) : (
          <option value="">No options found</option>
        )}
      </select>
    </div>
  )
}

function ExerciseProgressChart({ progressEpoch = 0 }) {
  const { isDark } = useTheme()
  const [selectedSplitKey, setSelectedSplitKey] = useState('push')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  )
  const cacheRef = useRef(new Map())

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const splitOptions = SPLIT_OPTIONS

  useEffect(() => {
    cacheRef.current.clear()
  }, [progressEpoch])

  useEffect(() => {
    if (!selectedSplitKey) {
      setExerciseOptions([])
      return undefined
    }

    let cancelled = false
    fetchSplitDayExercises(selectedSplitKey)
      .then((res) => {
        const list = res.data.results ?? res.data
        const names = (Array.isArray(list) ? [...list] : [])
          .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
          .map((entry) => (entry.exercise_name || entry.exercise_detail?.name || '').trim())
          .filter(Boolean)
        if (!cancelled) setExerciseOptions(names)
      })
      .catch((err) => {
        console.error('Failed to load split exercises', err)
        if (!cancelled) setExerciseOptions([])
      })

    return () => {
      cancelled = true
    }
  }, [selectedSplitKey])

  useEffect(() => {
    if (!splitOptions.length) {
      setSelectedSplitKey('')
      return
    }

    if (!splitOptions.includes(selectedSplitKey)) {
      setSelectedSplitKey(splitOptions[0])
    }
  }, [selectedSplitKey, splitOptions])

  useEffect(() => {
    if (!exerciseOptions.length) {
      setSelectedExercise('')
      return
    }

    if (!exerciseOptions.includes(selectedExercise)) {
      setSelectedExercise(exerciseOptions[0])
    }
  }, [exerciseOptions, selectedExercise])

  useEffect(() => {
    if (
      !selectedSplitKey ||
      !selectedExercise ||
      !exerciseOptions.includes(selectedExercise)
    ) {
      setChartData([])
      setChartLoading(false)
      return undefined
    }

    const cacheKey = `${selectedSplitKey}::${selectedExercise}`
    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      setChartData(cached)
      setChartLoading(false)
      return undefined
    }

    let cancelled = false
    setChartLoading(true)
    fetchExerciseProgress({ workoutType: selectedSplitKey, exercise: selectedExercise })
      .then((res) => {
        const points = Array.isArray(res.data.points) ? res.data.points : []
        cacheRef.current.set(cacheKey, points)
        if (!cancelled) setChartData(points)
      })
      .catch((err) => {
        console.error('Failed to load exercise progress', err)
        if (!cancelled) setChartData([])
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [exerciseOptions, selectedExercise, selectedSplitKey, progressEpoch])

  return (
    <section className="h-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exercise Progress</h2>
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              onClick={() => setShowInfo(!showInfo)}
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
              aria-label="Score formula info"
            >
              <Info size={20} />
            </button>
          </div>

          {showInfo && (
            <div className="absolute left-0 top-full z-10 mt-2 w-72 rounded-xl bg-slate-900 px-5 py-4 text-sm leading-relaxed text-white shadow-lg dark:bg-slate-950">
              Score = weight × (1 + reps/100).
              <br />
              e.g. 22.5kg × 2 reps → 22.95
              <br />
              vs 20kg × 10 reps → 22.0
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <Dropdown
            label="SPLIT"
            value={selectedSplitKey}
            options={splitOptions}
            onChange={(value) => {
              setSelectedSplitKey(value)
            }}
            labelMap={SPLIT_LABELS}
          />
          <Dropdown
            label="EXERCISE"
            value={selectedExercise}
            options={exerciseOptions}
            onChange={setSelectedExercise}
            disabled={!exerciseOptions.length}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 380 }}>
        {chartLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-500">
            Loading progress…
          </div>
        ) : chartData.length ? (
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid
                vertical={true}
                horizontal={true}
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#e2e8f0'}
              />
              <XAxis
                dataKey="date"
                type="category"
                tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 14 }}
                axisLine={{ stroke: isDark ? '#475569' : '#64748b' }}
                tickLine={false}
              />
              <YAxis
                dataKey="score"
                type="number"
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(v) => v.toFixed(2)}
                tick={{ fill: '#6366f1', fontSize: 14, fontWeight: 600 }}
                axisLine={{ stroke: '#6366f1' }}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div
                        className="rounded-lg px-3 py-2 shadow-lg"
                        style={{
                          backgroundColor: isDark ? '#020617' : '#ffffff',
                          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        }}
                      >
                        <p style={{ color: isDark ? '#e2e8f0' : '#1e293b', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                          Best Set: {data.weight} kg × {data.reps} reps
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter
                data={chartData}
                fill="#ffffff"
                line={{ stroke: '#6366f1', strokeWidth: 2 }}
                shape={(props) => {
                  const { cx, cy } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isMobile ? 3.5 : 7}
                      fill="white"
                      stroke="#6366f1"
                      strokeWidth={isMobile ? 1.75 : 3}
                    />
                  )
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500">
            Log more workouts for this exercise to see progress.
          </div>
        )}
      </div>
    </section>
  )
}

export default ExerciseProgressChart
