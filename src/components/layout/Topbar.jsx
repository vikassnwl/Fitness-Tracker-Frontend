function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-4 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Local fitness tracker</div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="inline-flex items-center gap-3 text-slate-300">
        <span className="rounded-full bg-slate-800 px-3 py-2 text-sm">Dark mode</span>
      </div>
    </header>
  )
}

export default Topbar
