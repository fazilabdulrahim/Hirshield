import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Download,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import type { JobSubmission, TestCaseResultRow } from '@/types';

interface ReportPageProps {
  submissionId: string;
  onBack: () => void;
}

export function ReportPage({ submissionId, onBack }: ReportPageProps) {
  const [submission, setSubmission] = useState<JobSubmission | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sub } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('id', submissionId)
        .maybeSingle();

      if (sub) {
        setSubmission(sub as JobSubmission);
        const { data: results } = await supabase
          .from('test_results')
          .select('*')
          .eq('submission_id', submissionId)
          .order('test_case_number', { ascending: true });
        setTestResults((results || []) as TestCaseResultRow[]);
      }
      setLoading(false);
    })();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="animate-fade-in">
        <Card className="p-12 text-center">
          <p className="text-slate-500 mb-4">Report not found.</p>
          <Button variant="outline" onClick={onBack}>Go back</Button>
        </Card>
      </div>
    );
  }

  const isPassed = submission.overall_status === 'PASSED_INITIAL_CHECKS';
  const isWarning = submission.overall_status === 'WARNING_POTENTIALLY_SUSPICIOUS';
  const isHighRisk = submission.overall_status === 'HIGH_RISK_WARNING';

  const headerConfig = isPassed
    ? { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'PASSED INITIAL CHECKS' }
    : isWarning
      ? { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', title: 'WARNING — POTENTIALLY SUSPICIOUS JOB' }
      : { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', title: 'HIGH RISK WARNING' };

  const HeaderIcon = headerConfig.icon;
  const failedTests = testResults.filter((r) => r.status === 'FAIL');
  const unverifiedTests = testResults.filter((r) => r.status === 'UNVERIFIED');

  function handlePrint() {
    window.print();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Detailed Report" subtitle="Full analysis breakdown">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to History
          </Button>
          <Button variant="ghost" size="md" onClick={handlePrint}>
            <Download size={16} />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Submission info */}
      <Card className="p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Submitted URL</p>
            <p className="text-slate-900 font-medium break-all">{submission.job_url}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Analysis Date</p>
            <p className="text-slate-900 font-medium">{new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Overall status */}
      <Card className={`p-6 mb-6 border-2 ${headerConfig.border} ${headerConfig.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${headerConfig.bg} ${headerConfig.color}`}>
            <HeaderIcon size={30} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${headerConfig.color}`}>{headerConfig.title}</h3>
            <div className="flex items-center gap-4 mt-1.5 text-sm">
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> {submission.passed_count} passed
              </span>
              <span className="text-red-600 font-medium flex items-center gap-1">
                <XCircle size={14} /> {submission.failed_count} failed
              </span>
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <HelpCircle size={14} /> {submission.unverified_count} unverified
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Failed test warnings */}
      {failedTests.length > 0 && (
        <Card className="p-5 mb-6 border-l-4 border-l-red-400">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 text-sm">Detected Issues</h4>
              <div className="mt-3 space-y-3">
                {failedTests.map((t) => (
                  <div key={t.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-red-700">
                        TC{String(t.test_case_number).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">{t.test_name}</span>
                      <Badge status="FAIL" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{t.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Unverified tests */}
      {unverifiedTests.length > 0 && (
        <Card className="p-5 mb-6 border-l-4 border-l-amber-400">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 text-sm">Additional Verification Required</h4>
              <div className="mt-3 space-y-2">
                {unverifiedTests.map((t) => (
                  <div key={t.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-amber-700">
                        TC{String(t.test_case_number).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">{t.test_name}</span>
                      <Badge status="UNVERIFIED" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{t.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Full test results table */}
      <Card className="overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Complete Test Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Test</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {testResults.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-base">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      TC{String(t.test_case_number).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{t.test_name}</td>
                  <td className="px-5 py-3"><Badge status={t.status} /></td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell max-w-md">
                    <span className="text-xs leading-relaxed">{t.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-slate-100 border-t border-slate-100">
          {testResults.map((t) => (
            <div key={t.id} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-900 text-sm">
                  TC{String(t.test_case_number).padStart(2, '0')} — {t.test_name}
                </span>
                <Badge status={t.status} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.details}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-2.5">
          <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Disclaimer:</strong> Passing all 10 checks does not guarantee that the job is genuine.
            This system provides an initial automated assessment only. Always conduct independent
            verification before sharing personal information or accepting any job offer.
          </p>
        </div>
      </Card>
    </div>
  );
}
