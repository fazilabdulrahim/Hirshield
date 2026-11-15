/*
# Fake Job Detection System — Core Tables

## Overview
Creates the data model for a Fake Job Detection System where authenticated users submit
job posting URLs for fraud analysis. Each submission generates 10 test-case results.

## New Tables

### 1. profiles
Stores extended user profile information (full name).
- id (uuid, PK, FK → auth.users)
- full_name (text)
- created_at (timestamptz)

### 2. job_submissions
Stores each job URL a user submits for analysis.
- id (uuid, PK)
- user_id (uuid, FK → auth.users, defaults to auth.uid())
- job_url (text, not null)
- overall_status (text, not null) — 'PASSED_INITIAL_CHECKS', 'WARNING_POTENTIALLY_SUSPICIOUS', 'HIGH_RISK_WARNING'
- passed_count (int), failed_count (int), unverified_count (int)
- submitted_at (timestamptz)

### 3. test_results
Stores the 10 individual test-case results for each submission.
- id (uuid, PK)
- submission_id (uuid, FK → job_submissions ON DELETE CASCADE)
- test_case_number (int, 1–10)
- test_name (text)
- status (text) — 'PASS', 'FAIL', 'UNVERIFIED'
- details (text)

## Security
- RLS enabled on all tables. Grants to authenticated (owner-scoped) and service_role (edge function).
- All policies use auth.uid() ownership checks.
- No anon access — app requires authentication.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS job_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_url text NOT NULL,
  overall_status text NOT NULL DEFAULT 'WARNING_POTENTIALLY_SUSPICIOUS',
  passed_count int NOT NULL DEFAULT 0,
  failed_count int NOT NULL DEFAULT 0,
  unverified_count int NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON job_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_submissions TO service_role;

DROP POLICY IF EXISTS "select_own_submissions" ON job_submissions;
CREATE POLICY "select_own_submissions" ON job_submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_submissions" ON job_submissions;
CREATE POLICY "insert_own_submissions" ON job_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_submissions" ON job_submissions;
CREATE POLICY "update_own_submissions" ON job_submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_submissions" ON job_submissions;
CREATE POLICY "delete_own_submissions" ON job_submissions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_submissions_user_id ON job_submissions(user_id);

CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES job_submissions(id) ON DELETE CASCADE,
  test_case_number int NOT NULL,
  test_name text NOT NULL,
  status text NOT NULL DEFAULT 'UNVERIFIED',
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON test_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON test_results TO service_role;

DROP POLICY IF EXISTS "select_own_test_results" ON test_results;
CREATE POLICY "select_own_test_results" ON test_results FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM job_submissions
      WHERE job_submissions.id = test_results.submission_id
        AND job_submissions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_test_results" ON test_results;
CREATE POLICY "insert_own_test_results" ON test_results FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_submissions
      WHERE job_submissions.id = test_results.submission_id
        AND job_submissions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_test_results" ON test_results;
CREATE POLICY "update_own_test_results" ON test_results FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM job_submissions
      WHERE job_submissions.id = test_results.submission_id
        AND job_submissions.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_submissions
      WHERE job_submissions.id = test_results.submission_id
        AND job_submissions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_test_results" ON test_results;
CREATE POLICY "delete_own_test_results" ON test_results FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM job_submissions
      WHERE job_submissions.id = test_results.submission_id
        AND job_submissions.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_test_results_submission_id ON test_results(submission_id);
