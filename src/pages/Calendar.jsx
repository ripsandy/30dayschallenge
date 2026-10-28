import { useState, useEffect } from 'react'
import { workoutPlan, getTodayDayNumber } from '../data/workoutPlan'
import { getAllWorkoutLogs } from '../lib/supabase'
import WorkoutLogModal from '../components/WorkoutLogModal'

export default function Calendar({ startDate }) {
  const [logs, setLogs] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const todayDayNum = getTodayDayNumber(startDate)

  useEffect(() => {
    getAllWorkoutLogs().then(setLogs).catch(console.error)
  }, [])

  const weeks = []
  for (let i = 0; i < 30; i += 7) {
    weeks.push(workoutPlan.slice(i, Math.min(i + 7, 30)))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-white">30-Day Calendar</h1>
        <p className="text-slate-400 text-sm mt-1">Tap any day to log your workout</p>
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="bg-[#1a1a2e] rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Week {wi + 1}</p>
          <div className="space-y-2">
            {week.map((day) => {
              const log = logs.find((l) => l.day_number === day.dayNumber)
              const isToday = day.dayNumber === todayDayNum
              const isDone = log?.completed
              const isFuture = day.dayNumber > todayDayNum

              return (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                    isToday ? 'ring-2 ring-violet-500 bg-slate-800' :
                    isDone ? 'bg-emerald-900/30 border border-emerald-800/50' :
                    isFuture ? 'bg-slate-800/30 opacity-60' :
                    'bg-red-900/20 border border-red-900/30'
                  }`}
                >
                  {/* Day number badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isDone ? 'bg-emerald-600 text-white' :
                    isToday ? 'bg-violet-600 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {isDone ? '✓' : day.dayNumber}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{day.icon}</span>
                      <span className="font-medium text-sm text-slate-200 truncate">{day.label}</span>
                      {isToday && <span className="text-xs bg-violet-600/40 text-violet-300 px-2 py-0.5 rounded-full">Today</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{day.weekDay} · {day.duration} · {day.exercises.length} exercises</p>
                  </div>

                  {/* Weight logged */}
                  {log?.weight_kg && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-violet-300">{log.weight_kg} kg</p>
                      <p className="text-xs text-slate-500">weight</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedDay && (
        <WorkoutLogModal
          dayNumber={selectedDay}
          onClose={() => setSelectedDay(null)}
          onSaved={() => getAllWorkoutLogs().then(setLogs)}
        />
      )}
    </div>
  )
}
