export type TestStatus = 'PASS' | 'FAIL' | 'UNVERIFIED';

export interface TestCaseResult {
  test_case_number: number;
  test_name: string;
  status: TestStatus;
  details: string;
}

export interface AnalysisResult {
  submission_id: string;
  overall_status: string;
  passed_count: number;
  failed_count: number;
  unverified_count: number;
  results: TestCaseResult[];
  fetched_content_length: number;
}

export interface JobSubmission {
  id: string;
  user_id: string;
  job_url: string;
  overall_status: string;
  passed_count: number;
  failed_count: number;
  unverified_count: number;
  submitted_at: string;
  test_results?: TestCaseResultRow[];
}

export interface TestCaseResultRow {
  id: string;
  submission_id: string;
  test_case_number: number;
  test_name: string;
  status: TestStatus;
  details: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}
