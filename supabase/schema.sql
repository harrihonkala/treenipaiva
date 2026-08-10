-- Treenipäivä / Supabase database schema
--
-- This schema replaces the browser-local data model with a multi-user
-- PostgreSQL model. Authentication is handled by Supabase Auth.
--
-- Run this file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Exercises
--
-- user_id NULL = shared/system exercise.
-- user_id set = exercise owned by that user.
-- ---------------------------------------------------------------------------

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create unique index exercises_system_name_idx
  on public.exercises (lower(name))
  where user_id is null;

create unique index exercises_user_name_idx
  on public.exercises (user_id, lower(name))
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Workouts
-- ---------------------------------------------------------------------------

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null default now(),
  type text not null check (type in ('gym', 'home', 'run', 'bike', 'mob')),
  name text not null,
  duration_seconds integer check (
    duration_seconds is null or duration_seconds >= 0
  ),
  notes text,
  distance_km numeric(7,2) check (
    distance_km is null or distance_km >= 0
  ),
  activity_minutes integer check (
    activity_minutes is null or activity_minutes >= 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Exercises performed in a workout
-- ---------------------------------------------------------------------------

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (workout_id, position)
);

-- ---------------------------------------------------------------------------
-- Individual sets
-- ---------------------------------------------------------------------------

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null
    references public.workout_exercises(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  weight_kg numeric(7,2) check (
    weight_kg is null or weight_kg >= 0
  ),
  reps integer check (
    reps is null or reps >= 0
  ),
  rpe numeric(3,1) check (
    rpe is null or (rpe >= 0 and rpe <= 10)
  ),
  failed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workout_exercise_id, set_number)
);

-- ---------------------------------------------------------------------------
-- Routines
-- ---------------------------------------------------------------------------

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Exercises in routines
-- ---------------------------------------------------------------------------

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  unique (routine_id, position)
);

-- ---------------------------------------------------------------------------
-- Body measurements
-- ---------------------------------------------------------------------------

create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(5,2) check (
    weight_kg is null or weight_kg > 0
  ),
  body_fat_percent numeric(5,2) check (
    body_fat_percent is null
    or (body_fat_percent >= 0 and body_fat_percent <= 100)
  ),
  muscle_percent numeric(5,2) check (
    muscle_percent is null
    or (muscle_percent >= 0 and muscle_percent <= 100)
  ),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes used by normal queries and RLS checks
-- ---------------------------------------------------------------------------

create index exercises_user_id_idx
  on public.exercises(user_id);

create index workouts_user_id_idx
  on public.workouts(user_id);

create index workouts_user_date_idx
  on public.workouts(user_id, date desc);

create index workout_exercises_workout_id_idx
  on public.workout_exercises(workout_id);

create index workout_exercises_exercise_id_idx
  on public.workout_exercises(exercise_id);

create index sets_workout_exercise_id_idx
  on public.sets(workout_exercise_id);

create index routines_user_id_idx
  on public.routines(user_id);

create index routine_exercises_routine_id_idx
  on public.routine_exercises(routine_id);

create index routine_exercises_exercise_id_idx
  on public.routine_exercises(exercise_id);

create index body_measurements_user_date_idx
  on public.body_measurements(user_id, measured_at desc);

-- ---------------------------------------------------------------------------
-- Updated-at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

create trigger routines_set_updated_at
before update on public.routines
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Automatically create a profile for every new Auth user.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.body_measurements enable row level security;

-- Profiles

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

-- Exercises: users can read system exercises and their own exercises.

create policy "Users can view system and own exercises"
on public.exercises
for select
to authenticated
using (
  user_id is null
  or user_id = (select auth.uid())
);

create policy "Users can create own exercises"
on public.exercises
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own exercises"
on public.exercises
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own exercises"
on public.exercises
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Workouts

create policy "Users can view own workouts"
on public.workouts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own workouts"
on public.workouts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own workouts"
on public.workouts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own workouts"
on public.workouts
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Workout exercises: ownership is inherited through workouts.

create policy "Users can view own workout exercises"
on public.workout_exercises
for select
to authenticated
using (
  exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can create own workout exercises"
on public.workout_exercises
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can update own workout exercises"
on public.workout_exercises
for update
to authenticated
using (
  exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can delete own workout exercises"
on public.workout_exercises
for delete
to authenticated
using (
  exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = (select auth.uid())
  )
);

-- Sets: ownership is inherited through workout_exercises -> workouts.

create policy "Users can view own sets"
on public.sets
for select
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can create own sets"
on public.sets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can update own sets"
on public.sets
for update
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id
      and w.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id
      and w.user_id = (select auth.uid())
  )
);

create policy "Users can delete own sets"
on public.sets
for delete
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_exercise_id
      and w.user_id = (select auth.uid())
  )
);

-- Routines

create policy "Users can view own routines"
on public.routines
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own routines"
on public.routines
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own routines"
on public.routines
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own routines"
on public.routines
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Routine exercises: ownership is inherited through routines.

create policy "Users can view own routine exercises"
on public.routine_exercises
for select
to authenticated
using (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (select auth.uid())
  )
);

create policy "Users can create own routine exercises"
on public.routine_exercises
for insert
to authenticated
with check (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (select auth.uid())
  )
);

create policy "Users can update own routine exercises"
on public.routine_exercises
for update
to authenticated
using (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (select auth.uid())
  )
);

create policy "Users can delete own routine exercises"
on public.routine_exercises
for delete
to authenticated
using (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (select auth.uid())
  )
);

-- Body measurements

create policy "Users can view own measurements"
on public.body_measurements
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own measurements"
on public.body_measurements
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own measurements"
on public.body_measurements
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own measurements"
on public.body_measurements
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Seed the current system exercise library.
-- These IDs intentionally remain stable so existing Treenipäivä routines can
-- be migrated to the database later.
-- ---------------------------------------------------------------------------

insert into public.exercises (id, user_id, name, category)
values
  ('e_rintapunnerrus'::uuid, null, 'Penkki', 'Rinta'),
  ('e_rintapunnerrus_kp'::uuid, null, 'Vinopenkki käsipainoilla', 'Rinta'),
  ('e_rintaprassi'::uuid, null, 'Rintaprässi', 'Rinta'),
  ('e_vinopenkki'::uuid, null, 'Vinopenkki', 'Rinta'),
  ('e_ristiveto'::uuid, null, 'Ristikkäistalja', 'Rinta'),
  ('e_punnerrus'::uuid, null, 'Punnerrus', 'Rinta'),
  ('e_ylatalja'::uuid, null, 'Ylätalja', 'Selkä'),
  ('e_alatalja'::uuid, null, 'Alatalja', 'Selkä'),
  ('e_soutulaite'::uuid, null, 'Soutulaite', 'Selkä'),
  ('e_kulmasoutu'::uuid, null, 'Kulmasoutu', 'Selkä'),
  ('e_leuanveto'::uuid, null, 'Leuanveto', 'Selkä'),
  ('e_facepull'::uuid, null, 'Face Pull', 'Olkapäät'),
  ('e_vipunosto'::uuid, null, 'Sivuvipunosto', 'Olkapäät'),
  ('e_olkaprassi'::uuid, null, 'Olkapääprässi', 'Olkapäät'),
  ('e_hauiskääntö'::uuid, null, 'Hauiskääntö', 'Hauis'),
  ('e_hauiskääntö_kp'::uuid, null, 'Hauiskääntö käsipainoilla', 'Hauis'),
  ('e_hammer'::uuid, null, 'Hammer-kääntö', 'Hauis'),
  ('e_ojentajapunnerrus'::uuid, null, 'Ojentajapunnerrus', 'Ojentajat'),
  ('e_ojentaja_kp'::uuid, null, 'Ojentaja käsipainolla', 'Ojentajat'),
  ('e_jalkaprässi'::uuid, null, 'Jalkaprässi', 'Etureidet'),
  ('e_kyykky'::uuid, null, 'Kyykky', 'Etureidet'),
  ('e_reidenojennus'::uuid, null, 'Reidenojennus', 'Etureidet'),
  ('e_reidenkoukistus'::uuid, null, 'Reidenkoukistus', 'Takareidet'),
  ('e_maastaveto'::uuid, null, 'Maastaveto', 'Takareidet'),
  ('e_hipthrust'::uuid, null, 'Hip Thrust', 'Pakarat'),
  ('e_pakarapotku'::uuid, null, 'Pakarapotku', 'Pakarat'),
  ('e_pohjenousu'::uuid, null, 'Pohjenousu', 'Pohkeet'),
  ('e_vatsarutistus'::uuid, null, 'Vatsarutistus', 'Keskivartalo'),
  ('e_lankku'::uuid, null, 'Lankku', 'Keskivartalo'),
  ('e_deadbug'::uuid, null, 'Dead Bug', 'Keskivartalo'),
  ('e_burpee'::uuid, null, 'Burpee', 'Koko keho')
on conflict (id) do nothing;
