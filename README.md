# 🏋️‍♀️ 30-Day Fitness Challenge Dashboard

A mobile-friendly workout tracker with daily photo logging and progress charts.

## Features
- ✅ Full 30-day workout plan (Upper Push, Lower Body, Hybrid, Run Day, Rest)
- 📸 Daily progress photo upload
- 📊 Weight & completion charts
- 🪞 Before & After photo comparison
- 💾 Works offline (localStorage) or with Supabase cloud sync

---

## Quick Start (Local, No Setup)

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) — works immediately with local storage!

---

## Add Cloud Sync (Supabase — Free)

### 1. Create Supabase Project
- Go to supabase.com → New Project (free tier, no credit card)
- Wait ~2 min for it to spin up

### 2. Run SQL Schema
- Go to **SQL Editor** in Supabase dashboard
- Paste contents of `supabase-schema.sql` → click **Run**

### 3. Create Storage Bucket
- Go to **Storage** → **New Bucket**
- Name: `progress-photos`  |  Toggle: **Public bucket ✅**

### 4. Add Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in your keys from **Settings → API**

---

## Deploy Free on Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → Import Project → select repo
3. Add env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy — live in ~60 seconds!

---

## 30-Day Schedule

| Days | Type | Focus |
|------|------|-------|
| 1,8,15,22,29 | Targeted | Upper Body Push |
| 2,9,16,23,30 | Targeted | Lower Body |
| 3,10,17,24 | Hybrid | Cardio + Core |
| 4,11,18,25 | Hybrid | Full Body Strength |
| 5,12,19,26 | Hybrid | HIIT + Mobility |
| 6,13,20,27 | Run Day | 3-5 km Run |
| 7,14,21,28 | Rest | Active Recovery |

---

## Diet Reference
- **Breakfast**: Collagen coffee + 2 Nutrichoice
- **11am**: Protein shake
- **1pm**: 1 fulka, 2 eggs, vegetables, dal, small rice bowl, dahi
- **6pm**: Chicken rice / dahi rice / sandwich (small katori rice)
- **Post-workout**: Protein shake (1 scoop)
