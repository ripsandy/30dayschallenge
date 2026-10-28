import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Local storage fallback when Supabase is not configured
const STORAGE_KEYS = {
  logs: 'fitness_workout_logs',
  photos: 'fitness_photos',
  settings: 'fitness_settings',
}

export const isSupabaseConfigured = () => !!supabase

// ──────────────────────────────────────────────
// Workout Logs
// ──────────────────────────────────────────────

export async function getWorkoutLog(dayNumber) {
  if (supabase) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('day_number', dayNumber)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs) || '{}')
  return logs[dayNumber] || null
}

export async function getAllWorkoutLogs() {
  if (supabase) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .order('day_number')
    if (error) throw error
    return data || []
  }
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs) || '{}')
  return Object.values(logs).sort((a, b) => a.day_number - b.day_number)
}

export async function saveWorkoutLog(log) {
  if (supabase) {
    const { data, error } = await supabase
      .from('workout_logs')
      .upsert(
        {
          day_number: log.day_number,
          date: log.date,
          completed: log.completed,
          exercises: log.exercises,
          notes: log.notes,
          weight_kg: log.weight_kg,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'day_number' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  }
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs) || '{}')
  logs[log.day_number] = { ...log, updated_at: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs))
  return logs[log.day_number]
}

// ──────────────────────────────────────────────
// Photos
// ──────────────────────────────────────────────

export async function getAllPhotos() {
  if (supabase) {
    const { data, error } = await supabase
      .from('daily_photos')
      .select('*')
      .order('day_number')
    if (error) throw error
    return data || []
  }
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.photos) || '[]')
}

export async function uploadPhoto(dayNumber, file) {
  const date = new Date().toISOString().split('T')[0]

  if (supabase) {
    const fileName = `day-${dayNumber}-${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, file)
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('daily_photos')
      .upsert(
        { day_number: dayNumber, date, photo_url: publicUrl },
        { onConflict: 'day_number' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  }

  // LocalStorage fallback: store as base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.photos) || '[]')
      const existing = photos.findIndex((p) => p.day_number === dayNumber)
      const record = { day_number: dayNumber, date, photo_url: e.target.result }
      if (existing >= 0) photos[existing] = record
      else photos.push(record)
      photos.sort((a, b) => a.day_number - b.day_number)
      localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(photos))
      resolve(record)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ──────────────────────────────────────────────
// Settings (challenge start date)
// ──────────────────────────────────────────────

export function getSettings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}')
}

export function saveSettings(settings) {
  const current = getSettings()
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...current, ...settings }))
}
