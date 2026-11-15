import { useState } from 'react';
import { SearchCheck, AlertCircle, Link2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import { EDGE_FUNCTION_URL, supabase } from '@/lib/supabase';
import type { AnalysisResult } from '@/types';

interface AnalyzePageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export function AnalyzePage({ onAnalysisComplete }: AnalyzePageProps) {
  const { session } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateUrl(u: string): string | null {
    if (!u.trim()) return 'Please enter a job posting URL';
    try {
      const parsed = new URL(u);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
      if (!parsed.hostname || parsed.hostname.length < 3) {
        return 'URL does not have a valid domain name';
      }
      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com/job-posting)';
    }
  }

  async function handleAnalyze() {
    setError('');
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ job_url: url.trim() }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json() as AnalysisResult;
      onAnalysisComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analyze Job Posting"
        subtitle="Submit a job URL to run all 10 fraud detection checks"
      />

      <div className="max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <SearchCheck size={26} className="text-sky-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Job URL Submission</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              Paste the full URL of the job posting you want to verify. Our engine will
              fetch the page and run 10 security tests.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Posting URL
              </label>
              <div className="relative">
                <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/careers/job-posting"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-base disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) handleAnalyze();
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Only HTTP and HTTPS URLs are accepted. Internal/private network addresses are blocked.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={loading}
              onClick={handleAnalyze}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing... Running 10 tests
                </>
              ) : (
                <>
                  <SearchCheck size={18} />
                  Analyze Job
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Info card */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testList.map((t) => (
            <div key={t.num} className="flex items-start gap-2.5 text-sm">
              <span className="shrink-0 w-7 h-7 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center">
                {t.num}
              </span>
              <div>
                <p className="font-medium text-slate-700">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const testList = [
  { num: '01', name: 'URL Validation', desc: 'Valid HTTP/HTTPS format' },
  { num: '02', name: 'HTTPS Security', desc: 'TLS certificate check' },
  { num: '03', name: 'Company Information', desc: 'Company details present' },
  { num: '04', name: 'Contact Information', desc: 'Recruiter credibility' },
  { num: '05', name: 'Payment Detection', desc: 'Fee requests flagged' },
  { num: '06', name: 'Salary Detection', desc: 'Unrealistic claims' },
  { num: '07', name: 'Job Description', desc: 'Role details present' },
  { num: '08', name: 'Scam Indicators', desc: 'Known fraud patterns' },
  { num: '09', name: 'Sensitive Info', desc: 'Password/bank requests' },
  { num: '10', name: 'Recruitment Verification', desc: 'Official channel check' },
];
