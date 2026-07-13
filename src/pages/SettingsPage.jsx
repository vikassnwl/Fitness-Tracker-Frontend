function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-slate-400">Local settings for your tracker experience.</p>
      </div>
      <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
        <p className="text-slate-300">No authentication is required—this app is fully local and private.</p>
      </div>
    </div>
  )
}

export default SettingsPage
