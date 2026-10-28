import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts'
import { getAllWorkoutLogs, getAllPhotos } from '../lib/supabase'

export default function Progress() {
  const [logs, setLogs] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [beforeAfterOpen, setBeforeAfterOpen] = useState(false)

  useEffect(() => {
    Promise.all([getAllWorkoutLogs(), getAllPhotos()])
      .then(([l, p]) => { setLogs(l); setPhotos(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const weightData = logs
    .filter((l) => l.weight_kg)
    .map((l) => ({ day: `D${l.day_number}`, weight: Number(l.weight_kg) }))

  const weeklyData = Array.from({ length: 5 }, (_, wi) => {
    const weekDays = logs.filter((l) => l.day_number > wi * 6 && l.day_number <= (wi + 1) * 6)
    return {
      week: `W${wi + 1}`,
      completed: weekDays.filter((l) => l.completed).length,
    }
  }).filter((w) => w.completed > 0)

  const firstPhoto = photos[0]
  const lastPhoto = photos[photos.length - 1]
  const canBeforeAfter = photos.length >= 2

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading progress...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">{logs.filter(l => l.completed).length} of 30 workouts done</p>
      </div>

      {/* Before / After CTA */}
      {canBeforeAfter && (
        <button
          onClick={() => setBeforeAfterOpen(true)}
          className="w-full bg-gradient-to-r from-violet-700 to-pink-700 rounded-2xl p-5 flex items-center justify-between group"
        >
          <div className="text-left">
            <p className="font-bold text-white text-lg">Before & After</p>
            <p className="text-violet-200 text-sm">Day {firstPhoto.day_number} → Day {lastPhoto.day_number}</p>
          </div>
          <div className="text-4xl group-hover:scale-110 transition-transform">🪞</div>
        </button>
      )}

      {/* Weight Chart */}
      {weightData.length > 1 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-300 mb-1">Body Weight (kg)</p>
          {weightData.length >= 2 && (
            <WeightTrend data={weightData} />
          )}
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <EmptyCard icon="⚖️" text="Log your weight in the workout modal to see the chart" />
      )}

      {/* Weekly Completion */}
      {weeklyData.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Weekly Completions</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">All Progress Photos ({photos.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.day_number} className="relative aspect-square rounded-xl overflow-hidden bg-slate-800">
                <img src={p.photo_url} alt={`Day ${p.day_number}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-1.5">
                  <p className="text-xs text-white text-center font-medium">Day {p.day_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyCard icon="📸" text="Upload a photo when logging your workout to track visual progress" />
      )}

      {/* Before / After Modal */}
      {beforeAfterOpen && (
        <BeforeAfterModal first={firstPhoto} last={lastPhoto} onClose={() => setBeforeAfterOpen(false)} />
      )}
    </div>
  )
}

function WeightTrend({ data }) {
  const first = data[0]?.weight
  const last = data[data.length - 1]?.weight
  const diff = (last - first).toFixed(1)
  const isDown = diff < 0
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-lg font-bold ${isDown ? 'text-emerald-400' : 'text-amber-400'}`}>
        {isDown ? '↓' : '↑'} {Math.abs(diff)} kg
      </span>
      <span className="text-xs text-slate-500">from {first} kg → {last} kg</span>
    </div>
  )
}

function BeforeAfterModal({ first, last, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Before & After</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PhotoFrame photo={first} label={`Day ${first.day_number} — Before`} />
          <PhotoFrame photo={last} label={`Day ${last.day_number} — Now`} />
        </div>
        <p className="text-center text-slate-400 text-sm mt-4">Keep going! Every day counts. 💪</p>
      </div>
    </div>
  )
}

function PhotoFrame({ photo, label }) {
  return (
    <div className="space-y-2">
      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800">
        <img src={photo.photo_url} alt={label} className="w-full h-full object-cover" />
      </div>
      <p className="text-xs text-slate-400 text-center">{label}</p>
    </div>
  )
}

function EmptyCard({ icon, text }) {
  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
}
