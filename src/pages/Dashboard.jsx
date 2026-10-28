import { useState, useEffect } from 'react'
import { workoutPlan, getTodayDayNumber } from '../data/workoutPlan'
import { getAllWorkoutLogs, getAllPhotos } from '../lib/supabase'
import WorkoutLogModal from '../components/WorkoutLogModal'

export default function Dashboard({ startDate }) {
  const [logs, setLogs] = useState([])
  const [photos, setPhotos] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(true)

  const todayDayNum = getTodayDayNumber(startDate)
  const todayWorkout = workoutPlan[todayDayNum - 1]

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [logsData, photosData] = await Promise.all([getAllWorkoutLogs(), getAllPhotos()])
      setLogs(logsData)
      setPhotos(photosData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const completedDays = logs.filter((l) => l.completed).length
  const streak = calcStreak(logs)
  const todayLog = logs.find((l) => l.day_number === todayDayNum)
  const lastPhotos = photos.slice(-3)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Your Journey</p>
        <h1 className="text-4xl font-bold text-white">Day {todayDayNum} <span className="text-slate-500">/ 30</span></h1>
        {streak > 1 && <p className="text-amber-400 font-medium mt-1">🔥 {streak} day streak!</p>}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="✅" value={completedDays} label="Done" color="text-emerald-400" />
        <StatCard icon="📸" value={photos.length} label="Photos" color="text-violet-400" />
        <StatCard icon="🎯" value={30 - completedDays} label="Left" color="text-amber-400" />
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Challenge Progress</span>
          <span>{Math.round((completedDays / 30) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-violet-600 to-violet-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((completedDays / 30) * 100)}%` }}
          />
        </div>
      </div>

      {/* Today's Workout */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Today's Workout</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{todayWorkout.label}</h2>
            <p className="text-sm text-slate-400">{todayWorkout.weekDay} · {todayWorkout.duration}</p>
          </div>
          <div className="text-4xl">{todayWorkout.icon}</div>
        </div>

        {/* Exercise preview */}
        <div className="space-y-2 mb-4">
          {todayWorkout.exercises.slice(0, 4).map((ex) => (
            <div key={ex.name} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2">
              <span className="text-sm text-slate-200">{ex.name}</span>
              <span className="text-xs text-slate-400">{ex.sets}x{ex.reps}</span>
            </div>
          ))}
          {todayWorkout.exercises.length > 4 && (
            <p className="text-xs text-slate-500 text-center">+{todayWorkout.exercises.length - 4} more exercises</p>
          )}
        </div>

        <button
          onClick={() => setSelectedDay(todayDayNum)}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${todayLog?.completed ? 'bg-emerald-700/50 text-emerald-300 border border-emerald-700' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
        >
          {todayLog?.completed ? '✅ Completed — Log Again' : '🏋️ Log Today\'s Workout'}
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">30-Day Overview</p>
        <div className="grid grid-cols-10 gap-1.5">
          {workoutPlan.map((day) => {
            const log = logs.find((l) => l.day_number === day.dayNumber)
            const isToday = day.dayNumber === todayDayNum
            const isDone = log?.completed
            const isFuture = day.dayNumber > todayDayNum
            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                title={`Day ${day.dayNumber}: ${day.label}`}
                className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                  isToday ? 'ring-2 ring-violet-400 bg-violet-700 text-white scale-110' :
                  isDone ? 'bg-emerald-700 text-emerald-200' :
                  isFuture ? 'bg-slate-800 text-slate-600' :
                  'bg-red-900/50 text-red-300'
                } ${day.type === 'rest' ? 'opacity-60' : ''}`}
              >
                {day.dayNumber}
              </button>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span><span className="inline-block w-3 h-3 rounded bg-emerald-700 mr-1"></span>Done</span>
          <span><span className="inline-block w-3 h-3 rounded bg-violet-700 mr-1"></span>Today</span>
          <span><span className="inline-block w-3 h-3 rounded bg-red-900/50 mr-1"></span>Missed</span>
        </div>
      </div>

      {/* Recent Photos */}
      {lastPhotos.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Recent Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {lastPhotos.map((p) => (
              <div key={p.day_number} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={p.photo_url} alt={`Day ${p.day_number}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-1">
                  <p className="text-xs text-white text-center">Day {p.day_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDay && (
        <WorkoutLogModal
          dayNumber={selectedDay}
          onClose={() => setSelectedDay(null)}
          onSaved={loadData}
        />
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function calcStreak(logs) {
  const done = logs.filter((l) => l.completed).map((l) => l.day_number).sort((a, b) => b - a)
  if (!done.length) return 0
  let streak = 1
  for (let i = 0; i < done.length - 1; i++) {
    if (done[i] - done[i + 1] === 1) streak++
    else break
  }
  return streak
}
