import { useEffect, useState } from 'react';
import { History as HistoryIcon, ArrowRight, SearchCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import type { JobSubmission } from '@/types';

interface HistoryPageProps {
  onViewReport: (id: string) => void;
  onAnalyze: () => void;
}

export function HistoryPage({ onViewReport, onAnalyze }: HistoryPageProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
      setSubmissions((data || []) as JobSubmission[]);
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analysis History"
        subtitle="All job postings you have analyzed"
      >
        <Button variant="primary" size="md" onClick={onAnalyze}>
          <SearchCheck size={16} />
          New Analysis
        </Button>
      </PageHeader>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <HistoryIcon size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">No analyses yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Once you analyze job postings, they will appear here with full results.
          </p>
          <Button variant="outline" size="md" onClick={onAnalyze}>
            <SearchCheck size={16} />
            Analyze a Job
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card
              key={s.id}
              className="p-5 hover:shadow-md transition-base cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge status={s.overall_status} />
                    <span className="text-xs text-slate-400">
                      {new Date(s.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {s.job_url}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">{s.passed_count} passed</span>
                    </span>
                    {s.failed_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-600">{s.failed_count} failed</span>
                      </span>
                    )}
                    {s.unverified_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-600">{s.unverified_count} unverified</span>
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport(s.id)}
                  className="shrink-0"
                >
                  View Details
                  <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
