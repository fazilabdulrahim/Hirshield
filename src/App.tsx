import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { Sidebar } from '@/components/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { ResultPage } from '@/pages/ResultPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ReportPage } from '@/pages/ReportPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoadingPage } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { AnalysisResult } from '@/types';

type AppView =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'analyze'
  | 'result'
  | 'history'
  | 'report'
  | 'profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [reportId, setReportId] = useState<string>('');

  // Show loading while auth state initializes
  if (loading) {
    return <LoadingPage message="Loading..." />;
  }

  // ---- Unauthenticated views ----
  if (!user) {
    if (view === 'login' || view === 'register') {
      return (
        <AuthPage
          mode={authMode}
          onBack={() => setView('home')}
          onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      );
    }
    return (
      <HomePage
        onGetStarted={() => {
          setAuthMode('register');
          setView('register');
        }}
        onLogin={() => {
          setAuthMode('login');
          setView('login');
        }}
        onLearnMore={() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    );
  }

  // ---- Authenticated views ----
  function navigate(page: string) {
    setView(page as AppView);
  }

  function handleAnalysisComplete(result: AnalysisResult) {
    setAnalysisResult(result);
    setView('result');
  }

  function handleViewReport(id: string) {
    setReportId(id);
    setView('report');
  }

  const authenticatedPages: AppView[] = ['dashboard', 'analyze', 'result', 'history', 'report', 'profile'];

  // If user is signed in but view is a home/auth page, redirect to dashboard
  if (!authenticatedPages.includes(view)) {
    setView('dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentPage={view === 'result' ? 'analyze' : view} onNavigate={navigate} />
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {view === 'dashboard' && (
            <DashboardPage onNavigate={navigate} onViewReport={handleViewReport} />
          )}
          {view === 'analyze' && (
            <AnalyzePage onAnalysisComplete={handleAnalysisComplete} />
          )}
          {view === 'result' && analysisResult && (
            <ResultPage
              result={analysisResult}
              onBack={() => setView('analyze')}
              onNavigateHistory={() => setView('history')}
            />
          )}
          {view === 'result' && !analysisResult && (
            <DashboardPage onNavigate={navigate} onViewReport={handleViewReport} />
          )}
          {view === 'history' && (
            <HistoryPage onViewReport={handleViewReport} onAnalyze={() => setView('analyze')} />
          )}
          {view === 'report' && reportId && (
            <ReportPage submissionId={reportId} onBack={() => setView('history')} />
          )}
          {view === 'report' && !reportId && (
            <HistoryPage onViewReport={handleViewReport} onAnalyze={() => setView('analyze')} />
          )}
          {view === 'profile' && <ProfilePage />}
        </div>
      </main>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationNotice />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function ConfigurationNotice() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <section className="max-w-lg w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight">HIRESHIELD is almost ready</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The deployment is missing its database connection settings. Add the public Supabase
          settings to the Vercel project, then redeploy to load the full application.
        </p>
      </section>
    </main>
  );
}

export default App;
