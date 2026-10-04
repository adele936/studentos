/*
# Application Intelligence Tables for ALGOTHON'26 ALG-AUTO-02

1. New Tables
- `ai_applications` — stores student application data (personal, academic, test, university fields) with health score and status
- `ai_application_documents` — stores uploaded document metadata and extracted text
- `ai_application_issues` — validation/verification issues with severity, status, and suggested fixes
- `ai_verification_checks` — individual field verification results (submitted vs document vs confidence)
- `ai_processing_logs` — audit trail of all processing events with timestamps

2. Security
- All tables use RLS with owner-scoped policies (user_id defaults to auth.uid())
- Users can only CRUD their own application data
- Service role bypasses RLS for internal operations

3. Notes
- user_id columns default to auth.uid() so frontend inserts work without explicitly passing user_id
- Status enum: DRAFT, PROCESSING, NEEDS_CORRECTION, READY_FOR_REVIEW
- Health score is deterministic, calculated client-side and stored
*/

CREATE TABLE IF NOT EXISTS ai_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  school text DEFAULT '',
  current_grade text DEFAULT '',
  class9_pct numeric DEFAULT NULL,
  class10_pct numeric DEFAULT NULL,
  class11_pct numeric DEFAULT NULL,
  class12_pct_predicted numeric DEFAULT NULL,
  sat_taken boolean DEFAULT false,
  sat_score integer DEFAULT NULL,
  ielts_taken boolean DEFAULT false,
  ielts_score numeric DEFAULT NULL,
  target_university text DEFAULT '',
  intended_major text DEFAULT '',
  health_score integer DEFAULT 0,
  status text DEFAULT 'DRAFT',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_apps" ON ai_applications;
CREATE POLICY "select_own_ai_apps" ON ai_applications FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_apps" ON ai_applications;
CREATE POLICY "insert_own_ai_apps" ON ai_applications FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_apps" ON ai_applications;
CREATE POLICY "update_own_ai_apps" ON ai_applications FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_apps" ON ai_applications;
CREATE POLICY "delete_own_ai_apps" ON ai_applications FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ai_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer DEFAULT 0,
  storage_path text DEFAULT '',
  extracted_text text DEFAULT '',
  extraction_status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_application_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_docs" ON ai_application_documents;
CREATE POLICY "select_own_ai_docs" ON ai_application_documents FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_docs" ON ai_application_documents;
CREATE POLICY "insert_own_ai_docs" ON ai_application_documents FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_docs" ON ai_application_documents;
CREATE POLICY "update_own_ai_docs" ON ai_application_documents FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_docs" ON ai_application_documents;
CREATE POLICY "delete_own_ai_docs" ON ai_application_documents FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_application_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ai_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  field text NOT NULL,
  severity text NOT NULL DEFAULT 'WARNING',
  title text NOT NULL,
  message text NOT NULL,
  suggested_fix text DEFAULT '',
  evidence text DEFAULT '',
  confidence text DEFAULT 'HIGH',
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_application_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_issues" ON ai_application_issues;
CREATE POLICY "select_own_ai_issues" ON ai_application_issues FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_issues" ON ai_application_issues;
CREATE POLICY "insert_own_ai_issues" ON ai_application_issues FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_issues" ON ai_application_issues;
CREATE POLICY "update_own_ai_issues" ON ai_application_issues FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_issues" ON ai_application_issues;
CREATE POLICY "delete_own_ai_issues" ON ai_application_issues FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_verification_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ai_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  field text NOT NULL,
  submitted_value text DEFAULT '',
  document_value text DEFAULT '',
  confidence text DEFAULT 'HIGH',
  result text DEFAULT 'NOT_VERIFIED',
  document_label text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_verification_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_checks" ON ai_verification_checks;
CREATE POLICY "select_own_ai_checks" ON ai_verification_checks FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_checks" ON ai_verification_checks;
CREATE POLICY "insert_own_ai_checks" ON ai_verification_checks FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_checks" ON ai_verification_checks;
CREATE POLICY "delete_own_ai_checks" ON ai_verification_checks FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ai_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  detail text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_logs" ON ai_processing_logs;
CREATE POLICY "select_own_ai_logs" ON ai_processing_logs FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_logs" ON ai_application_documents;
CREATE POLICY "insert_own_ai_logs" ON ai_processing_logs FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_logs" ON ai_processing_logs;
CREATE POLICY "delete_own_ai_logs" ON ai_processing_logs FOR DELETE
TO authenticated USING (auth.uid() = user_id);
