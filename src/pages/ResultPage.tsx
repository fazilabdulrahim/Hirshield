import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Download,
  Info,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import type { AnalysisResult } from '@/types';

interface ResultPageProps {
  result: AnalysisResult;
  onBack: () => void;
  onNavigateHistory: () => void;
}

export function ResultPage({ result, onBack, onNavigateHistory }: ResultPageProps) {
  const isPassed = result.overall_status === 'PASSED_INITIAL_CHECKS';
  const isWarning = result.overall_status === 'WARNING_POTENTIALLY_SUSPICIOUS';
  const isHighRisk = result.overall_status === 'HIGH_RISK_WARNING';

  const headerConfig = isPassed
    ? { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'PASSED INITIAL CHECKS' }
    : isWarning
      ? { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', title: 'WARNING — POTENTIALLY SUSPICIOUS JOB' }
      : { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', title: 'HIGH RISK WARNING' };

  const HeaderIcon = headerConfig.icon;

  const failedTests = result.results.filter((r) => r.status === 'FAIL');
  const unverifiedTests = result.results.filter((r) => r.status === 'UNVERIFIED');

  function handlePrint() {
    window.print();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Analysis Results" subtitle="Detailed fraud detection report">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button variant="ghost" size="md" onClick={handlePrint}>
            <Download size={16} />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Overall status banner */}
      <Card className={`p-6 mb-6 border-2 ${headerConfig.border} ${headerConfig.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${headerConfig.bg} ${headerConfig.color}`}>
            <HeaderIcon size={30} />
          </div>
          <div className="min-w-0">
            <h3 className={`text-lg font-bold ${headerConfig.color}`}>{headerConfig.title}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {isPassed && 'All 10 security checks passed. However, this does not guarantee the job is genuine — always verify independently.'}
              {isWarning && `${failedTests.length} test(s) failed. This job posting shows suspicious indicators that require caution.`}
              {isHighRisk && `${failedTests.length} test(s) failed including critical scam indicators. This job posting is very likely fraudulent.`}
            </p>
          </div>
        </div>
      </Card>

      {/* Warning notifications */}
      {failedTests.length > 0 && (
        <Card className="p-5 mb-6 border-l-4 border-l-red-400">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Failed Test Warnings</h4>
              <ul className="mt-2 space-y-1.5">
                {failedTests.map((t) => (
                  <li key={t.test_case_number} className="text-sm text-slate-600 flex items-start gap-2">
                    <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <span><strong>{t.test_name}:</strong> {t.details}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {unverifiedTests.length > 0 && (
        <Card className="p-5 mb-6 border-l-4 border-l-amber-400">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Additional Verification Required</h4>
              <p className="mt-1 text-sm text-slate-600">
                {unverifiedTests.length} test(s) returned UNVERIFIED. These tests could not
                be completed due to insufficient data or unavailable external verification.
              </p>
              <ul className="mt-2 space-y-1.5">
                {unverifiedTests.map((t) => (
                  <li key={t.test_case_number} className="text-sm text-slate-600 flex items-start gap-2">
                    <HelpCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>{t.test_name}</strong></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tests" value={10} icon={ShieldCheck} color="text-sky-600 bg-sky-50" />
        <StatCard label="Passed" value={result.passed_count} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
        <StatCard label="Failed" value={result.failed_count} icon={XCircle} color="text-red-600 bg-red-50" />
        <StatCard label="Unverified" value={result.unverified_count} icon={HelpCircle} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Test results table */}
      <Card className="overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Individual Test Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Test</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.results.map((t) => (
                <tr key={t.test_case_number} className="hover:bg-slate-50 transition-base">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      TC{String(t.test_case_number).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{t.test_name}</td>
                  <td className="px-5 py-3">
                    <Badge status={t.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell max-w-md">
                    <span className="text-xs leading-relaxed">{t.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile details */}
        <div className="md:hidden divide-y divide-slate-100 border-t border-slate-100">
          {result.results.map((t) => (
            <div key={t.test_case_number} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-900 text-sm">TC{String(t.test_case_number).padStart(2, '0')} — {t.test_name}</span>
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

      <div className="mt-6 flex justify-center">
        <Button variant="outline" size="md" onClick={onNavigateHistory}>
          View All Analysis History
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof ShieldCheck; color: string }) {
  return (
    <Card className="p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </Card>
  );
}
