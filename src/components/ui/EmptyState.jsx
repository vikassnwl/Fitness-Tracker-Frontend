function EmptyState({ message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {message}
    </div>
  )
}

export default EmptyState
