import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-sky-500" />;
}

export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen mesh-bg">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
      </div>
      <p className="mt-4 text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 shadow-sm shadow-sky-600/10',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-600 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm shadow-red-600/10',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-sky-300 bg-white',
  };
  const sizes: Record<string, string> = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  required,
  autoComplete,
}: {
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm border rounded-xl outline-none transition-smooth ${
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500'
              : 'border-slate-300 focus:ring-2 focus:ring-sky-200 focus:border-sky-500'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PASS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAIL: 'bg-red-50 text-red-700 border-red-200',
    UNVERIFIED: 'bg-amber-50 text-amber-700 border-amber-200',
    PASSED_INITIAL_CHECKS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WARNING_POTENTIALLY_SUSPICIOUS: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH_RISK_WARNING: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    PASS: 'PASS',
    FAIL: 'FAIL',
    UNVERIFIED: 'UNVERIFIED',
    PASSED_INITIAL_CHECKS: 'PASSED INITIAL CHECKS',
    WARNING_POTENTIALLY_SUSPICIOUS: 'WARNING — POTENTIALLY SUSPICIOUS',
    HIGH_RISK_WARNING: 'HIGH RISK WARNING',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {labels[status] || status}
    </span>
  );
}
