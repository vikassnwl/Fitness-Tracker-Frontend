import { useEffect, useState } from 'react'
import { fetchDayNotes, DAY_NOTE_REASONS } from '../api/dayNotes'
import DayNoteModal from '../components/dashboard/DayNoteModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const reasonLabel = (value) =>
  DAY_NOTE_REASONS.find((item) => item.value === value)?.label || value

const mergeNotes = (prev, incoming) => {
  const items = Array.isArray(incoming) ? incoming : [incoming]
  const byDate = new Map(prev.map((item) => [item.date, item]))
  items.forEach((item) => {
    if (item?.date) byDate.set(item.date, item)
  })
  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date))
}

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

  const openNote = (note) => {
    setSelectedNote(note)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedNote(null)
  }

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
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => openNote(note)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openNote(note)
                }
              }}
              className="w-full cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(note.date + 'T00:00:00').toLocaleDateString('default', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <span className="inline-flex rounded-full bg-amber-100 px-4 py-1.5 text-base font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {reasonLabel(note.reason)}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {note.note?.trim() || 'No extra details.'}
              </p>
            </div>
          ))
        ) : (
          <EmptyState message="No skip notes yet. Tap Skip note on the calendar to add a day or a date range." />
        )}
      </div>

      <DayNoteModal
        isOpen={modalOpen}
        enableRange={false}
        date={selectedNote?.date}
        note={selectedNote}
        initialMode="view"
        onClose={closeModal}
        onSaved={(saved) => {
          setNotes((prev) => mergeNotes(prev, saved))
        }}
        onDeleted={(deleted) => {
          setNotes((prev) => prev.filter((item) => item.id !== deleted.id))
        }}
      />
    </div>
  )
}

export default NotesPage
