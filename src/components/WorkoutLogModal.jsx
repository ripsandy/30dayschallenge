import { useState, useEffect, useRef } from 'react'
import { getWorkoutForDay } from '../data/workoutPlan'
import { getWorkoutLog, saveWorkoutLog, uploadPhoto, getAllPhotos } from '../lib/supabase'

export default function WorkoutLogModal({ dayNumber, onClose, onSaved }) {
  const workout = getWorkoutForDay(dayNumber)
  const [log, setLog] = useState(null)
  const [exercises, setExercises] = useState([])
  const [notes, setNotes] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [existingPhoto, setExistingPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    loadExisting()
  }, [dayNumber])

  async function loadExisting() {
    try {
      const [existingLog, allPhotos] = await Promise.all([
        getWorkoutLog(dayNumber),
        getAllPhotos(),
      ])
      if (existingLog) {
        setLog(existingLog)
        setNotes(existingLog.notes || '')
        setWeightKg(existingLog.weight_kg || '')
        setExercises(
          workout.exercises.map((ex) => {
            const saved = existingLog.exercises?.find((e) => e.name === ex.name)
            return { ...ex, done: saved?.done ?? false, weight: saved?.weight ?? '' }
          })
        )
      } else {
        setExercises(workout.exercises.map((ex) => ({ ...ex, done: false, weight: '' })))
      }
      const dayPhoto = allPhotos.find((p) => p.day_number === dayNumber)
      if (dayPhoto) setExistingPhoto(dayPhoto.photo_url)
    } catch (e) {
      console.error(e)
      setExercises(workout.exercises.map((ex) => ({ ...ex, done: false, weight: '' })))
    }
  }

  const toggleExercise = (idx) => {
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, done: !ex.done } : ex)))
  }

  const setExWeight = (idx, val) => {
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, weight: val } : ex)))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const allDone = exercises.every((ex) => ex.done)
  const doneFraction = exercises.filter((ex) => ex.done).length

  async function handleSave() {
    setSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await saveWorkoutLog({
        day_number: dayNumber,
        date: today,
        completed: allDone || doneFraction >= Math.ceil(exercises.length * 0.7),
        exercises: exercises.map(({ name, sets, reps, done, weight }) => ({ name, sets, reps, done, weight })),
        notes,
        weight_kg: weightKg ? Number(weightKg) : null,
      })
      if (photo) {
        await uploadPhoto(dayNumber, photo)
      }
      setSaved(true)
      onSaved?.()
      setTimeout(onClose, 1200)
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#141428] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Day {dayNumber}</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{workout.label}</h2>
            <p className="text-sm text-slate-400">{workout.weekDay} · {workout.duration}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{workout.icon}</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all"
              style={{ width: `${(doneFraction / exercises.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{doneFraction}/{exercises.length}</span>
        </div>

        {/* Exercises */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Exercises</p>
          {exercises.map((ex, i) => (
            <div
              key={ex.name}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${ex.done ? 'bg-emerald-900/30 border border-emerald-800/40' : 'bg-slate-800/50'}`}
            >
              <button
                onClick={() => toggleExercise(i)}
                className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm border-2 transition-all ${ex.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 text-transparent'}`}
              >
                ✓
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${ex.done ? 'text-emerald-300 line-through opacity-70' : 'text-slate-200'}`}>{ex.name}</p>
                <p className="text-xs text-slate-500">{ex.sets} sets × {ex.reps}</p>
              </div>
              {ex.category !== 'cardio' && ex.category !== 'stretch' && ex.category !== 'cooldown' && ex.category !== 'warmup' && ex.category !== 'mobility' && (
                <input
                  type="number"
                  placeholder="kg"
                  value={ex.weight}
                  onChange={(e) => setExWeight(i, e.target.value)}
                  className="w-16 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 text-right"
                />
              )}
            </div>
          ))}
        </div>

        {/* Body Weight */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Body Weight</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Enter your weight"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              step="0.1"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
            />
            <span className="text-slate-400 text-sm">kg</span>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Today's Photo</p>
          <input type="file" accept="image/*" capture="user" ref={fileRef} onChange={handlePhotoChange} className="hidden" />
          {photoPreview || existingPhoto ? (
            <div className="relative">
              <img
                src={photoPreview || existingPhoto}
                alt="Progress"
                className="w-full h-40 object-cover rounded-xl"
              />
              <button
                onClick={() => { setPhoto(null); setPhotoPreview(null); fileRef.current.click() }}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed border-slate-700 rounded-xl p-5 text-center hover:border-violet-600 transition-colors"
            >
              <div className="text-3xl mb-1">📸</div>
              <p className="text-sm text-slate-400">Tap to upload today's progress photo</p>
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout feel? Any PRs? 💪"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            saved ? 'bg-emerald-600 text-white' :
            saving ? 'bg-violet-800 text-violet-300 cursor-not-allowed' :
            'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {saved ? '✅ Saved!' : saving ? 'Saving...' : '💾 Save Workout'}
        </button>
      </div>
    </div>
  )
}
