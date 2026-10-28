-- Run these in your Supabase SQL Editor
-- Go to: https://app.supabase.com → your project → SQL Editor

-- 1. Workout Logs table
create table if not exists workout_logs (
  id          uuid primary key default gen_random_uuid(),
  day_number  int not null unique,
  date        date not null,
  completed   boolean default false,
  exercises   jsonb,
  notes       text,
  weight_kg   numeric(5,2),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. Daily Photos table
create table if not exists daily_photos (
  id          uuid primary key default gen_random_uuid(),
  day_number  int not null unique,
  date        date not null,
  photo_url   text not null,
  created_at  timestamptz default now()
);

-- 3. Enable Row Level Security (make data readable/writable without auth)
alter table workout_logs enable row level security;
alter table daily_photos enable row level security;

-- 4. Public policies (single-user, no auth required)
create policy "Allow all" on workout_logs for all using (true) with check (true);
create policy "Allow all" on daily_photos for all using (true) with check (true);

-- 5. Storage bucket for photos
-- Go to Storage → New Bucket → Name: progress-photos → Public: YES
