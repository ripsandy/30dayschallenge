import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Calendar from './pages/Calendar'
import { getSettings, saveSettings } from './lib/supabase'
import './index.css'

export default function App() {
  const [startDate, setStartDate] = useState(null)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const settings = getSettings()
    if (settings.startDate) {
      setStartDate(settings.startDate)
    } else {
      setShowSetup(true)
    }
  }, [])

  const handleStartChallenge = (date) => {
    saveSettings({ startDate: date })
    setStartDate(date)
    setShowSetup(false)
  }

  if (showSetup) {
    return <SetupScreen onStart={handleStartChallenge} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex flex-col">
        <TopNav />
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard startDate={startDate} />} />
            <Route path="/calendar" element={<Calendar startDate={startDate} />} />
            <Route path="/progress" element={<Progress startDate={startDate} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

function SetupScreen({ onStart }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-6">🏋️‍♀️</div>
        <h1 className="text-3xl font-bold text-white mb-2">30-Day Challenge</h1>
        <p className="text-slate-400 mb-8">Track workouts, log daily photos, see the transformation!</p>
        <div className="bg-[#1a1a2e] rounded-2xl p-6 text-left">
          <label className="block text-sm font-medium text-slate-400 mb-2">Challenge Start Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 text-base"
          />
          <button
            onClick={() => onStart(date)}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
          >
            Start My 30-Day Journey 🚀
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-4">Data saved locally. Add Supabase keys for cloud sync.</p>
      </div>
    </div>
  )
}

const NAV_LINKS = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/progress', label: 'Progress', icon: '📈' },
]

function TopNav() {
  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0a0a] sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏋️‍♀️</span>
        <span className="font-bold text-lg text-white">FitChallenge</span>
      </div>
      <div className="flex gap-1">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
            }>
            <span>{icon}</span>{label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-slate-800 flex z-50">
      {NAV_LINKS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500'}`
          }>
          <span className="text-xl">{icon}</span>{label}
        </NavLink>
      ))}
    </nav>
  )
}
