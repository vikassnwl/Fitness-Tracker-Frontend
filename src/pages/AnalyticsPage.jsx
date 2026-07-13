import { useEffect, useState } from 'react'
import { fetchAnalytics } from '../api/workouts'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Analytics</h2>
        <p className="text-slate-400">Visualize your progress across weight, nutrition, and workouts.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weight}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#818cf8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-white">Calories</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.calories}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#34d399" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
