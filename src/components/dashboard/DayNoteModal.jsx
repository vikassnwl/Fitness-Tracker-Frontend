import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { createDayNote, updateDayNote, deleteDayNote, DAY_NOTE_REASONS } from '../../api/dayNotes'

const reasonLabel = (value) =>
  DAY_NOTE_REASONS.find((item) => item.value === value)?.label || value

function DayNoteModal({ isOpen, date, note, initialMode, onClose, onSaved, onDeleted }) {
  const [mode, setMode] = useState('edit') // 'view' | 'edit'
  const [reason, setReason] = useState('other')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const reasonScrollRef = useRef(null)

  const updateReasonScrollState = () => {
    const el = reasonScrollRef.current
    if (!el) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(maxScroll - el.scrollLeft > 2)
  }

  useEffect(() => {
    if (!isOpen) return
    setReason(note?.reason || 'other')
    setText(note?.note || '')
    setError(null)
    if (initialMode === 'view' || initialMode === 'edit') {
      setMode(initialMode)
    } else {
      setMode(note?.id ? 'view' : 'edit')
    }
  }, [isOpen, note, initialMode])

  useEffect(() => {
    if (!isOpen || mode !== 'edit') return undefined
    const el = reasonScrollRef.current
    if (el) el.scrollLeft = 0

    const frame = requestAnimationFrame(updateReasonScrollState)
    if (!el) return () => cancelAnimationFrame(frame)

    el.addEventListener('scroll', updateReasonScrollState, { passive: true })
    window.addEventListener('resize', updateReasonScrollState)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', updateReasonScrollState)
      window.removeEventListener('resize', updateReasonScrollState)
    }
  }, [isOpen, mode, reason])

  const orderedReasons = [
    ...DAY_NOTE_REASONS.filter((item) => item.value === reason),
    ...DAY_NOTE_REASONS.filter((item) => item.value !== reason),
  ]

  if (!isOpen) return null

  const isEditing = mode === 'edit'
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

  const handleCancelEdit = () => {
    if (!note?.id) {
      onClose()
      return
    }
    setReason(note.reason || 'other')
    setText(note.note || '')
    setError(null)
    setMode('view')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="flex h-[min(85vh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Skip note</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>
          </div>

          {note?.id && (
            isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-xl border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                aria-label="Delete skip note"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Edit skip note"
              >
                <Pencil size={18} />
              </button>
            )
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Skip reason
            </p>
            {isEditing ? (
              <div className="relative">
                <div
                  ref={reasonScrollRef}
                  className="flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {orderedReasons.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={saving}
                      onClick={() => setReason(item.value)}
                      className={[
                        'inline-flex shrink-0 rounded-full px-4 py-1.5 text-base font-semibold transition',
                        reason === item.value
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-amber-100/40 text-amber-800/50 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:text-amber-200/50 dark:hover:bg-amber-950/70',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {canScrollLeft && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-900" />
                )}
                {canScrollRight && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-900" />
                )}
              </div>
            ) : (
              <span className="inline-flex rounded-full bg-amber-100 px-4 py-1.5 text-base font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {reasonLabel(reason)}
              </span>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <p className="mb-2 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Skip note text
            </p>
            {isEditing ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 transition-[box-shadow,border-color] focus-within:border-transparent focus-within:ring-2 focus-within:ring-slate-500 focus-within:shadow-[0_0_0_4px_rgba(100,116,139,0.22),0_0_20px_rgba(100,116,139,0.28)] dark:border-slate-600 dark:focus-within:border-transparent dark:focus-within:ring-slate-400 dark:focus-within:shadow-[0_0_0_4px_rgba(148,163,184,0.22),0_0_20px_rgba(148,163,184,0.28)]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={saving}
                  autoFocus
                  placeholder="Optional context for why you skipped…"
                  className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent px-3 py-2 text-base leading-relaxed text-slate-700 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-200 dark:placeholder-slate-500"
                />
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl">
                <p className="whitespace-pre-wrap text-lg font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                  {text.trim() || 'No extra details.'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/60 dark:text-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 shrink-0">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DayNoteModal
