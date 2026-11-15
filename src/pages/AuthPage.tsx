import { useState } from 'react';
import {
  Mail, Lock, User as UserIcon, ArrowLeft, AlertCircle,
  ShieldCheck, Eye, EyeOff, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import { Logo } from '@/components/Logo';

interface AuthPageProps {
  mode: 'login' | 'register';
  onBack: () => void;
  onSwitch: () => void;
}

export function AuthPage({ mode, onBack, onSwitch }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const isRegister = mode === 'register';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [errors, setErrors] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });

  function checkStrength(pwd: string): number {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  }

  function validate(): boolean {
    const e = { fullName: '', email: '', password: '', confirmPassword: '' };
    let valid = true;
    if (isRegister && fullName.trim().length < 2) {
      e.fullName = 'Please enter your full name (at least 2 characters)';
      valid = false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      e.email = 'Please enter a valid email address';
      valid = false;
    }
    if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
      valid = false;
    }
    if (isRegister && password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    setErrors(e);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    if (isRegister) {
      const { error } = await signUp(email, password, fullName);
      if (error) { setError(error); setLoading(false); }
    } else {
      const { error } = await signIn(email, password);
      if (error) { setError(error); setLoading(false); }
    }
  }

  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-500'];

  return (
    <div className="min-h-screen flex">
      {/* ---- Left branding panel ---- */}
      <div className="hidden lg:flex lg:w-1/2 mesh-bg relative overflow-hidden">
        {/* Decorative floating shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo + back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <span className="text-white font-bold text-xl tracking-tight">HIRESHIELD</span>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-smooth text-sm"
            >
              <ArrowLeft size={16} />
              Home
            </button>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs font-medium text-sky-300 mb-6">
              <ShieldCheck size={14} />
              10-Point Fraud Detection Engine
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {isRegister
                ? 'Join thousands protecting themselves from job scams'
                : 'Welcome back to safer job hunting'}
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              {isRegister
                ? 'Create your free account and start verifying job postings with our automated 10-check detection engine.'
                : 'Sign in to access your dashboard, run new analyses, and review your detection history.'}
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {[
                'Instant URL analysis with 10 security checks',
                'Detailed PASS / FAIL / UNVERIFIED reports',
                'Full analysis history saved to your account',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={12} className="text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500">
            Passing all 10 checks does not guarantee a job is genuine. Always verify independently.
          </p>
        </div>
      </div>

      {/* ---- Right form panel ---- */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-8 sm:px-8 relative">
        {/* Mobile back + logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-smooth text-sm"
          >
            <ArrowLeft size={16} />
            Home
          </button>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8 mt-8">
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <span className="font-bold text-slate-900 text-lg tracking-tight">HIRESHIELD</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isRegister ? 'Create your account' : 'Sign in'}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {isRegister
                ? 'Start detecting fake job postings today'
                : 'Welcome back — enter your credentials to continue'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in-scale">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="John Doe"
                  icon={<UserIcon size={18} />}
                  error={errors.fullName}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                error={errors.email}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(checkStrength(e.target.value));
                  }}
                  placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-smooth ${
                    errors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-sky-200 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-smooth"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              {/* Password strength meter */}
              {isRegister && password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-smooth ${
                          i < passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Password strength: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                  </p>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-smooth ${
                      errors.confirmPassword
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-sky-200 focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-smooth"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={onSwitch}
                className="text-sky-600 font-semibold hover:text-sky-700 transition-smooth"
              >
                {isRegister ? 'Sign in' : 'Register for free'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
