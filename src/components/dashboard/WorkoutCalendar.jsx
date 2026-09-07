import { useEffect, useMemo, useState } from 'react'
import WorkoutDayModal from './WorkoutDayModal'
import DayActionChooser from './DayActionChooser'
import DayNoteModal from './DayNoteModal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WORKOUT_TYPE_COLORS = {
  push:   'bg-[#8B5CF6]',
  pull:   'bg-[#F97316]',
  legs:   'bg-[#06B6D4]',
  upper:  'bg-sky-500',
  lower:  'bg-orange-500',
  full:   'bg-pink-500',
  custom: 'bg-slate-400',
}

const LEGEND_TYPES = ['push', 'pull', 'legs']

function WorkoutCalendar({
  workouts = [],
  dayNotes = [],
  loading = false,
  onUpsertWorkout,
  onRemoveWorkout,
  onUpsertDayNote,
  onRemoveDayNote,
  onViewMonthChange,
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [panel, setPanel] = useState(null) // 'chooser' | 'workout' | 'note'

  useEffect(() => {
    onViewMonthChange?.(viewYear, viewMonth)
  }, [viewYear, viewMonth, onViewMonthChange])

  const workoutMap = useMemo(() => {
    const map = {}
    workouts.forEach((workout) => {
      if (workout.date) map[workout.date] = workout
    })
    return map
  }, [workouts])

  const noteMap = useMemo(() => {
    const map = {}
    dayNotes.forEach((note) => {
      if (note.date) map[note.date] = note
    })
    return map
  }, [dayNotes])

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const closePanels = () => {
    setSelectedDate(null)
    setSelectedWorkout(null)
    setSelectedNote(null)
    setPanel(null)
  }

  const handleDayClick = (dateStr) => {
    const workout = workoutMap[dateStr] || null
    const note = noteMap[dateStr] || null
    setSelectedDate(dateStr)
    setSelectedWorkout(workout)
    setSelectedNote(note)

    if (workout) {
      setPanel('workout')
    } else if (note) {
      setPanel('note')
    } else {
      setPanel('chooser')
    }
  }

  const handleWorkoutCreated = (createdWorkout) => {
    if (!createdWorkout) {
      if (selectedWorkout?.id || selectedDate) {
        onRemoveWorkout?.(selectedWorkout?.id, selectedDate)
      }
      setSelectedWorkout(null)
      return
    }
    onUpsertWorkout?.(createdWorkout)
    setSelectedWorkout(createdWorkout)
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Workout Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            ‹
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-slate-700 dark:text-slate-300">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-600 dark:text-slate-500">Loading…</div>
        ) : (
          <div className="grid flex-1 grid-cols-7 gap-1 [grid-auto-rows:1fr]">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1
              const isInMonth = dayNum >= 1 && dayNum <= daysInMonth
              const dateStr = isInMonth
                ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                : null
              const workout = dateStr ? workoutMap[dateStr] : null
              const note = dateStr ? noteMap[dateStr] : null
              const isToday = dateStr === todayStr

              return (
                <button
                  key={i}
                  disabled={!isInMonth}
                  onClick={() => {
                    if (!isInMonth) return
                    handleDayClick(dateStr)
                  }}
                  className={[
                    'relative flex h-full flex-col items-center justify-start rounded-xl p-1.5 pt-1 text-xs transition',
                    !isInMonth && 'opacity-0 pointer-events-none',
                    isInMonth && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                    isInMonth && !workout && !note && 'text-slate-600 dark:text-slate-500',
                    isToday && !workout && !note && 'ring-1 ring-inset ring-indigo-500/50',
                  ].filter(Boolean).join(' ')}
                >
                  <span
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday
                        ? 'bg-indigo-500 text-white'
                        : workout
                          ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                          : note
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'text-slate-500',
                    ].join(' ')}
                  >
                    {isInMonth ? dayNum : ''}
                  </span>
                  <div className="mt-0.5 flex items-center gap-0.5">
                    {workout && (
                      <span
                        className={[
                          'h-1.5 w-1.5 rounded-full',
                          WORKOUT_TYPE_COLORS[workout.workout_type] ?? 'bg-slate-400',
                        ].join(' ')}
                      />
                    )}
                    {note && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {LEGEND_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-500">
            <span className={`h-2 w-2 rounded-full ${WORKOUT_TYPE_COLORS[type]}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-500">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Skip note
        </div>
      </div>

      <DayActionChooser
        isOpen={panel === 'chooser'}
        date={selectedDate}
        onClose={closePanels}
        onLogWorkout={() => setPanel('workout')}
        onAddSkipNote={() => setPanel('note')}
      />

      <WorkoutDayModal
        isOpen={panel === 'workout'}
        date={selectedDate}
        workout={selectedWorkout}
        workouts={workouts}
        onWorkoutCreated={handleWorkoutCreated}
        onClose={closePanels}
      />

      <DayNoteModal
        isOpen={panel === 'note'}
        date={selectedDate}
        note={selectedNote}
        onClose={closePanels}
        onSaved={(saved) => {
          onUpsertDayNote?.(saved)
          setSelectedNote(saved)
        }}
        onDeleted={(deleted) => {
          onRemoveDayNote?.(deleted.id, deleted.date)
          setSelectedNote(null)
        }}
      />
    </div>
  )
}

export default WorkoutCalendar
