const UPPER_PUSH = {
  type: 'targeted',
  label: 'Upper Body - Push',
  color: '#7c3aed',
  icon: '💪',
  duration: '45-55 min',
  exercises: [
    { name: 'Push-ups', sets: 4, reps: '12', category: 'chest' },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', category: 'shoulders' },
    { name: 'Lateral Raises', sets: 3, reps: '15', category: 'shoulders' },
    { name: 'Tricep Dips', sets: 3, reps: '12', category: 'triceps' },
    { name: 'Chest Flys', sets: 3, reps: '12', category: 'chest' },
  ],
}

const LOWER_BODY = {
  type: 'targeted',
  label: 'Lower Body',
  color: '#db2777',
  icon: '🦵',
  duration: '45-55 min',
  exercises: [
    { name: 'Squats', sets: 4, reps: '15', category: 'quads' },
    { name: 'Romanian Deadlifts', sets: 3, reps: '12', category: 'hamstrings' },
    { name: 'Lunges (each leg)', sets: 3, reps: '12', category: 'quads' },
    { name: 'Glute Bridges', sets: 4, reps: '15', category: 'glutes' },
    { name: 'Calf Raises', sets: 3, reps: '20', category: 'calves' },
  ],
}

const HYBRID_CARDIO_CORE = {
  type: 'hybrid',
  label: 'Cardio + Core',
  color: '#0891b2',
  icon: '🔥',
  duration: '40-50 min',
  exercises: [
    { name: 'Jump Rope / Jog', sets: 1, reps: '20 min', category: 'cardio' },
    { name: 'Crunches', sets: 3, reps: '20', category: 'core' },
    { name: 'Leg Raises', sets: 3, reps: '15', category: 'core' },
    { name: 'Plank', sets: 3, reps: '45 sec', category: 'core' },
    { name: 'Russian Twists', sets: 3, reps: '20', category: 'core' },
  ],
}

const HYBRID_FULL_BODY = {
  type: 'hybrid',
  label: 'Full Body Strength',
  color: '#059669',
  icon: '⚡',
  duration: '50-60 min',
  exercises: [
    { name: 'Burpees', sets: 3, reps: '10', category: 'full body' },
    { name: 'Dumbbell Rows', sets: 3, reps: '12', category: 'back' },
    { name: 'Goblet Squats', sets: 3, reps: '15', category: 'legs' },
    { name: 'Mountain Climbers', sets: 3, reps: '20', category: 'core' },
    { name: 'Push-ups', sets: 3, reps: '12', category: 'chest' },
  ],
}

const HYBRID_HIIT = {
  type: 'hybrid',
  label: 'HIIT + Mobility',
  color: '#d97706',
  icon: '🏃',
  duration: '35-45 min',
  exercises: [
    { name: 'Jumping Jacks (30s on/30s off x6)', sets: 6, reps: '30 sec', category: 'hiit' },
    { name: 'High Knees (30s on/30s off x6)', sets: 6, reps: '30 sec', category: 'hiit' },
    { name: 'Squat Jumps (30s on/30s off x6)', sets: 6, reps: '30 sec', category: 'hiit' },
    { name: 'Hip Flexor Stretch', sets: 1, reps: '60 sec each', category: 'mobility' },
    { name: 'Hamstring Stretch', sets: 1, reps: '60 sec each', category: 'mobility' },
    { name: 'Shoulder Mobility', sets: 1, reps: '2 min', category: 'mobility' },
  ],
}

const RUN_DAY = {
  type: 'run',
  label: 'Run Day',
  color: '#16a34a',
  icon: '🏃‍♀️',
  duration: '30-40 min',
  exercises: [
    { name: 'Warm-up Walk', sets: 1, reps: '5 min', category: 'warmup' },
    { name: 'Run (comfortable pace)', sets: 1, reps: '3-5 km', category: 'cardio' },
    { name: 'Cool-down Walk', sets: 1, reps: '5 min', category: 'cooldown' },
    { name: 'Full Body Stretch', sets: 1, reps: '5 min', category: 'stretch' },
  ],
}

const REST_DAY = {
  type: 'rest',
  label: 'Rest & Recovery',
  color: '#475569',
  icon: '😴',
  duration: 'Optional',
  exercises: [
    { name: 'Light Walk', sets: 1, reps: '20-30 min optional', category: 'active recovery' },
    { name: 'Full Body Stretch', sets: 1, reps: '10-15 min', category: 'stretch' },
  ],
}

const WEEKLY_PATTERN = [
  UPPER_PUSH,
  LOWER_BODY,
  HYBRID_CARDIO_CORE,
  HYBRID_FULL_BODY,
  HYBRID_HIIT,
  RUN_DAY,
  REST_DAY,
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const workoutPlan = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1
  const weekIdx = i % 7
  const workout = WEEKLY_PATTERN[weekIdx]
  return {
    dayNumber: dayNum,
    dayLabel: `Day ${dayNum}`,
    weekDay: DAY_NAMES[weekIdx],
    ...workout,
    exercises: workout.exercises.map((ex) => ({ ...ex, id: `${dayNum}-${ex.name}` })),
  }
})

export const getTodayDayNumber = (startDate) => {
  if (!startDate) return 1
  const start = new Date(startDate)
  const today = new Date()
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diff + 1, 1), 30)
}

export const getWorkoutForDay = (dayNumber) => workoutPlan[dayNumber - 1]
