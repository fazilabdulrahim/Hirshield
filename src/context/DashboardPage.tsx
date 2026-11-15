import { useEffect, useState } from 'react';
import {
  ShieldCheck, ShieldAlert, ShieldX, SearchCheck, TrendingUp,
  History as HistoryIcon, ArrowRight, ScanLine, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import { Logo } from '@/components/Logo';
import type { JobSubmission } from '@/types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onViewReport: (id: string) => void;
}

export function DashboardPage({ onNavigate, onViewReport }: DashboardPageProps) {
  const { user, fullName } = useAuth();
  const [stats, setStats] = useState({ total: 0, passed: 0, suspicious: 0, highRisk: 0, unverified: 0 });
  const [recent, setRecent] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(5);
      const submissions = (data || []) as JobSubmission[];
      setRecent(submissions);
      const total = submissions.length;
      const passed = submissions.filter((s) => s.overall_status === 'PASSED_INITIAL_CHECKS').length;
      const suspicious = submissions.filter((s) => s.overall_status === 'WARNING_POTENTIALLY_SUSPICIOUS').length;
      const highRisk = submissions.filter((s) => s.overall_status === 'HIGH_RISK_WARNING').length;
      const unverified = submissions.filter((s) => s.unverified_count > 0 && s.overall_status !== 'HIGH_RISK_WARNING').length;
      setStats({ total, passed, suspicious, highRisk, unverified });
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const cards = [
    { label: 'Total Analyzed', value: stats.total, icon: ScanLine, color: 'text-sky-600', bg: 'bg-sky-50', ring: 'ring-sky-100', delay: 'delay-1' },
    { label: 'Passed Checks', value: stats.passed, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100', delay: 'delay-2' },
    { label: 'Suspicious', value: stats.suspicious + stats.highRisk, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100', delay: 'delay-3' },
    { label: 'Unverified', value: stats.unverified, icon: ShieldX, color: 'text-slate-600', bg: 'bg-slate-100', ring: 'ring-slate-200', delay: 'delay-4' },
  ];

  // Donut chart calculations
  const total = stats.total || 1;
  const passedPct = (stats.passed / total) * 100;
  const suspiciousPct = (stats.suspicious / total) * 100;
  const highRiskPct = (stats.highRisk / total) * 100;
  const remainingPct = stats.total === 0 ? 100 : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your job fraud analysis activity"
      >
        <Button variant="primary" size="md" onClick={() => onNavigate('analyze')}>
          <SearchCheck size={16} />
          Quick Analysis
        </Button>
      </PageHeader>

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl mb-6 animate-fade-in-up">
        <div className="mesh-bg p-6 sm:p-8">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-sky-600/10 rounded-full blur-3xl" />

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sky-400 text-sm font-medium mb-1">{greeting},</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {fullName || 'Welcome back'}
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">
                {stats.total === 0
                  ? 'Run your first job analysis to get started'
                  : `You've analyzed ${stats.total} job posting${stats.total !== 1 ? 's' : ''} so far`}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-4">
              <Logo size={32} />
              <div className="text-white">
                <p className="text-2xl font-bold leading-none">10</p>
                <p className="text-xs text-slate-400 mt-0.5">Checks per scan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className={`p-5 card-hover animate-fade-in-up ${c.delay} ring-1 ${c.ring}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{c.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg}`}>
                  <Icon size={20} className={c.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk distribution donut */}
        <Card className="p-6 animate-fade-in-up delay-3">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-sky-600" />
            Risk Distribution
          </h3>
          {stats.total === 0 ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-slate-100 flex items-center justify-center mb-3">
                <TrendingUp size={28} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">
                No data yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Donut chart */}
              <div className="relative w-36 h-36 mb-5">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {passedPct > 0 && (
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="12"
                      strokeDasharray={`${(passedPct / 100) * 314.16} 314.16`}
                      strokeDashoffset={0} strokeLinecap="round"
                      className="transition-all duration-700" />
                  )}
                  {suspiciousPct > 0 && (
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                      strokeDasharray={`${(suspiciousPct / 100) * 314.16} 314.16`}
                      strokeDashoffset={-(passedPct / 100) * 314.16} strokeLinecap="round"
                      className="transition-all duration-700" />
                  )}
                  {highRiskPct > 0 && (
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="12"
                      strokeDasharray={`${(highRiskPct / 100) * 314.16} 314.16`}
                      strokeDashoffset={-((passedPct + suspiciousPct) / 100) * 314.16} strokeLinecap="round"
                      className="transition-all duration-700" />
                  )}
                  {remainingPct > 0 && (
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12"
                      strokeDasharray={`${(remainingPct / 100) * 314.16} 314.16`}
                      strokeDashoffset={0} strokeLinecap="round" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
                  <span className="text-xs text-slate-400">total</span>
                </div>
              </div>
              {/* Legend */}
              <div className="w-full space-y-2.5">
                <LegendRow label="Passed" count={stats.passed} color="bg-emerald-500" total={stats.total} />
                <LegendRow label="Suspicious" count={stats.suspicious} color="bg-amber-500" total={stats.total} />
                <LegendRow label="High Risk" count={stats.highRisk} color="bg-red-500" total={stats.total} />
              </div>
            </div>
          )}
        </Card>

        {/* Recent analyses */}
        <Card className="p-6 lg:col-span-2 animate-fade-in-up delay-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <HistoryIcon size={18} className="text-sky-600" />
              Recent Analyses
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-sm text-sky-600 font-medium hover:text-sky-700 transition-smooth"
            >
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SearchCheck size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">No analyses yet</p>
              <p className="text-sm text-slate-400 mb-5">Analyze a job posting to see results here</p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('analyze')}>
                <SearchCheck size={14} />
                Analyze your first job
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => onViewReport(s.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-smooth text-left border border-slate-100 hover:border-sky-200 group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <StatusIcon status={s.overall_status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {s.job_url}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">
                          {new Date(s.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                            <CheckCircle2 size={11} /> {s.passed_count}
                          </span>
                          {s.failed_count > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-red-600 font-medium">
                              <AlertTriangle size={11} /> {s.failed_count}
                            </span>
                          )}
                          {s.unverified_count > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                              <ShieldX size={11} /> {s.unverified_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LegendRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-slate-600 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{count}</span>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const config: Record<string, { icon: typeof ShieldCheck; bg: string; color: string }> = {
    PASSED_INITIAL_CHECKS: { icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    WARNING_POTENTIALLY_SUSPICIOUS: { icon: ShieldAlert, bg: 'bg-amber-50', color: 'text-amber-600' },
    HIGH_RISK_WARNING: { icon: ShieldX, bg: 'bg-red-50', color: 'text-red-600' },
  };
  const c = config[status] || { icon: ShieldCheck, bg: 'bg-slate-50', color: 'text-slate-500' };
  const Icon = c.icon;
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
      <Icon size={18} className={c.color} />
    </div>
  );
}
