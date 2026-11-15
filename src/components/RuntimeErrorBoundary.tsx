import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RuntimeErrorBoundaryProps {
  children: ReactNode;
}

interface RuntimeErrorBoundaryState {
  hasError: boolean;
}

export class RuntimeErrorBoundary extends Component<RuntimeErrorBoundaryProps, RuntimeErrorBoundaryState> {
  state: RuntimeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RuntimeErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('HIRESHIELD runtime error', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
        <section className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-xl font-bold">HIRESHIELD could not load</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            The page encountered a temporary loading problem. Refresh the page to try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            <RefreshCw size={16} />
            Refresh page
          </button>
        </section>
      </main>
    );
  }
}
