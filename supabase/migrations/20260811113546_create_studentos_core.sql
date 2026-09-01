/*
# Create StudentOS core student data

1. New Tables
- `student_profiles`: One private profile per signed-in student, including academic summary and calculated score.
- `application_tracks`: Private university application records with status, deadline, and progress.
- `student_goals`: Private roadmap goals for SAT, Olympiads, research, and projects.
2. Security
- Row Level Security is enabled on all tables.
- Each table has separate authenticated SELECT, INSERT, UPDATE, and DELETE policies scoped to the signed-in owner.
3. Notes
- All owner IDs default to the current authenticated user so browser inserts remain safe and simple.
- No existing tables or user data are modified.
*/

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  grade text NOT NULL DEFAULT 'Grade 11',
  intended_major text NOT NULL DEFAULT 'Computer Science',
  sat_score integer NOT NULL DEFAULT 1280,
  profile_score integer NOT NULL DEFAULT 68,
  academics_score integer NOT NULL DEFAULT 76,
  olympiad_score integer NOT NULL DEFAULT 42,
  research_score integer NOT NULL DEFAULT 55,
  leadership_score integer NOT NULL DEFAULT 61,
  projects_score integer NOT NULL DEFAULT 73,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  university_name text NOT NULL,
  program text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Researching',
  deadline date,
  progress integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_own_profile" ON public.student_profiles;
CREATE POLICY "students_select_own_profile" ON public.student_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_insert_own_profile" ON public.student_profiles;
CREATE POLICY "students_insert_own_profile" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_update_own_profile" ON public.student_profiles;
CREATE POLICY "students_update_own_profile" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_delete_own_profile" ON public.student_profiles;
CREATE POLICY "students_delete_own_profile" ON public.student_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_select_own_applications" ON public.application_tracks;
CREATE POLICY "students_select_own_applications" ON public.application_tracks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_insert_own_applications" ON public.application_tracks;
CREATE POLICY "students_insert_own_applications" ON public.application_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_update_own_applications" ON public.application_tracks;
CREATE POLICY "students_update_own_applications" ON public.application_tracks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_delete_own_applications" ON public.application_tracks;
CREATE POLICY "students_delete_own_applications" ON public.application_tracks FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "students_select_own_goals" ON public.student_goals;
CREATE POLICY "students_select_own_goals" ON public.student_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_insert_own_goals" ON public.student_goals;
CREATE POLICY "students_insert_own_goals" ON public.student_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_update_own_goals" ON public.student_goals;
CREATE POLICY "students_update_own_goals" ON public.student_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "students_delete_own_goals" ON public.student_goals;
CREATE POLICY "students_delete_own_goals" ON public.student_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS application_tracks_user_id_idx ON public.application_tracks(user_id);
CREATE INDEX IF NOT EXISTS application_tracks_deadline_idx ON public.application_tracks(deadline);
CREATE INDEX IF NOT EXISTS student_goals_user_id_idx ON public.student_goals(user_id);