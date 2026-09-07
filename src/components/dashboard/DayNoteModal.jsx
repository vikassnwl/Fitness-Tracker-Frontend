import { useEffect, useState } from 'react'
import { createDayNote, updateDayNote, deleteDayNote, DAY_NOTE_REASONS } from '../../api/dayNotes'

function DayNoteModal({ isOpen, date, note, onClose, onSaved, onDeleted }) {
  const [reason, setReason] = useState('other')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setReason(note?.reason || 'other')
    setText(note?.note || '')
    setError(null)
  }, [isOpen, note])

  if (!isOpen) return null

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('default', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = { date, reason, note: text.trim() }
      const res = note?.id
        ? await updateDayNote(note.id, payload)
        : await createDayNote(payload)
      onSaved?.(res.data)
      onClose()
    } catch (err) {
      console.error('Failed to save day note', err)
      const detail = err.response?.data
      setError(
        typeof detail === 'object' && detail !== null
          ? detail.date?.[0] || detail.detail || JSON.stringify(detail)
          : err.message
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note?.id) return
    if (!confirm('Delete this skip note?')) return
    setSaving(true)
    try {
      await deleteDayNote(note.id)
      onDeleted?.(note)
      onClose()
    } catch (err) {
      console.error('Failed to delete day note', err)
      setError('Failed to delete note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">
          {note ? 'Edit skip note' : 'Add skip note'}
        </h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>

        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500">
              Reason
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_NOTE_REASONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  disabled={saving}
                  onClick={() => setReason(item.value)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                    reason === item.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-500">
              Note
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={saving}
              rows={4}
              placeholder="Optional context for why you skipped…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/60 dark:text-red-100">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save note'}
          </button>

          {note?.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete note
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-60 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayNoteModal
