function DayActionChooser({ isOpen, date, onClose, onLogWorkout, onAddSkipNote }) {
  if (!isOpen) return null

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('default', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">What for this day?</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onLogWorkout}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Log workout
          </button>
          <button
            type="button"
            onClick={onAddSkipNote}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Add skip note
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayActionChooser
