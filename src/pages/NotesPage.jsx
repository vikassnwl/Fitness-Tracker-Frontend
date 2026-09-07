import { useEffect, useState } from 'react'
import { fetchDayNotes, DAY_NOTE_REASONS } from '../api/dayNotes'
import DayNoteModal from '../components/dashboard/DayNoteModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const reasonLabel = (value) =>
  DAY_NOTE_REASONS.find((item) => item.value === value)?.label || value

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchDayNotes()
      .then((res) => {
        const list = res.data.results ?? res.data
        setNotes(Array.isArray(list) ? list : [])
      })
      .catch((err) => console.error('Failed to load day notes', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Skip Notes</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Context for days you skipped the gym — injury, illness, events, and more.
        </p>
      </div>

      <div className="space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => {
                setSelectedNote(note)
                setModalOpen(true)
              }}
              className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {new Date(note.date + 'T00:00:00').toLocaleDateString('default', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {reasonLabel(note.reason)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {note.note?.trim() || 'No extra details.'}
              </p>
            </button>
          ))
        ) : (
          <EmptyState message="No skip notes yet. When you skip a day, add a note from the calendar so you remember why." />
        )}
      </div>

      <DayNoteModal
        isOpen={modalOpen}
        date={selectedNote?.date}
        note={selectedNote}
        onClose={() => {
          setModalOpen(false)
          setSelectedNote(null)
        }}
        onSaved={(saved) => {
          setNotes((prev) => {
            const without = prev.filter((item) => item.id !== saved.id && item.date !== saved.date)
            return [saved, ...without].sort((a, b) => b.date.localeCompare(a.date))
          })
        }}
        onDeleted={(deleted) => {
          setNotes((prev) => prev.filter((item) => item.id !== deleted.id))
        }}
      />
    </div>
  )
}

export default NotesPage
