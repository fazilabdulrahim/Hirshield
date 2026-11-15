import { useState } from 'react';
import {
  ShieldCheck, SearchCheck, AlertTriangle, Lock, FileText, ArrowRight,
  Menu, X, Mail, Users, Info, Eye, CheckCircle2, DollarSign, Briefcase,
  UserX, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

interface HomePageProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onLogin: () => void;
}

export function HomePage({ onGetStarted, onLearnMore, onLogin }: HomePageProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileNavOpen(false);
  }

  const navLinks = [
    { label: 'Home', action: () => scrollToSection('hero') },
    { label: 'Overview', action: () => scrollToSection('how-it-works') },
    { label: 'Refer a Friend', action: () => scrollToSection('refer') },
    { label: 'About', action: () => scrollToSection('about') },
    { label: 'Contact', action: () => scrollToSection('contact') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== Navigation Bar ===== */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Logo size={32} />
              <span className="font-bold text-slate-900 tracking-tight text-lg hidden sm:block">HIRESHIELD</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50/60 rounded-lg transition-smooth"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onLogin}
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-smooth"
              >
                Login / Sign In
              </button>
              <Button variant="primary" size="sm" onClick={onGetStarted}>
                Get Started
                <ArrowRight size={14} />
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-smooth"
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50/60 rounded-lg transition-smooth"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => { onLogin(); setMobileNavOpen(false); }}
                  className="flex-1 text-sm font-medium text-slate-600 hover:text-sky-600 px-3 py-2.5 rounded-lg hover:bg-sky-50/60 transition-smooth"
                >
                  Login / Sign In
                </button>
                <Button variant="primary" size="sm" onClick={() => { onGetStarted(); setMobileNavOpen(false); }}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== Hero Section ===== */}
      <section id="hero" className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-emerald-50/40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text content */}
            <div className="text-center lg:text-left max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-700 mb-6">
                <ShieldCheck size={14} />
                10-Point Fraud Detection Engine
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] tracking-tight">
                Ensure safety from{' '}
                <span className="gradient-text">fake recruitment offers</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Submit any job posting URL and HIRESHIELD runs 10 automated
                security checks to identify potential fraud — from payment requests to
                suspicious contact details and known scam patterns.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                <Button variant="primary" size="lg" onClick={onGetStarted}>
                  Start Analyzing Jobs
                  <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="lg" onClick={onLearnMore}>
                  Learn How It Works
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">10 Security Checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-sky-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Instant Results</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Eye size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Detailed Reports</span>
                </div>
              </div>
            </div>

            {/* Right: visual with floating warning badges */}
            <div className="hidden lg:block relative animate-fade-in-up delay-2">
              <div className="relative rounded-[1.75rem] overflow-hidden border border-white/80 bg-slate-200 shadow-[0_24px_70px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5">
                <img
                  src="/hr_image.webp"
                  alt="Professional recruiter welcoming a candidate during an online job conversation"
                  className="block w-full h-[480px] object-cover object-center scale-[1.01]"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />

                {/* Floating analysis card at bottom */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/40">
                  <div className="flex items-center gap-3">
                    <Logo size={32} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">HIRESHIELD Analysis</p>
                      <p className="text-xs text-slate-500">10 checks run on every job posting</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-semibold">7 PASS</span>
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-semibold">3 FAIL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating warning badge: top-left — Payment Detected */}
              <div className="absolute -top-5 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 flex items-center gap-2.5 animate-float">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Payment Detected</p>
                  <p className="text-xs text-slate-400">Registration fee flagged</p>
                </div>
              </div>

              {/* Floating warning badge: top-right — Attractive Salary Offers */}
              <div className="absolute top-8 -right-5 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 flex items-center gap-2.5 animate-float delay-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Attractive Salary</p>
                  <p className="text-xs text-slate-400">Unrealistic offer detected</p>
                </div>
              </div>

              {/* Floating warning badge: mid-right — No Proper Interview */}
              <div className="absolute top-44 -right-3 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 flex items-center gap-2.5 animate-float delay-5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <UserX size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">No Proper Interview</p>
                  <p className="text-xs text-slate-400">Process not verified</p>
                </div>
              </div>

              {/* Floating warning badge: bottom-left — Fake Internships */}
              <div className="absolute bottom-28 -left-5 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 flex items-center gap-2.5 animate-float delay-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Briefcase size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Fake Internships</p>
                  <p className="text-xs text-slate-400">Company info missing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features / Overview Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20" id="how-it-works">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-700 mb-4">
            <SearchCheck size={13} />
            Detection Engine
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            10 Automated Detection Checks
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Each test returns PASS, FAIL, or UNVERIFIED — never a hardcoded result.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {checks.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`bg-white rounded-2xl border border-slate-200/80 p-6 card-hover animate-fade-in-up delay-${(i % 6) + 1}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    TC{String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm">{c.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-slate-600">From signup to detailed report in four simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-full h-0.5 bg-gradient-to-r from-sky-200 to-transparent" />
                )}
                <div className="relative inline-flex w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-2xl items-center justify-center font-bold text-xl shadow-lg shadow-sky-600/20 mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== About Section ===== */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80">
              <img
                src="https://images.pexels.com/photos/18848926/pexels-photo-18848926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Professional handshake during a job interview"
                className="w-full h-[340px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 mb-4">
              <Info size={13} />
              About HIRESHIELD
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built to protect job seekers from fraud
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              HIRESHIELD is a recruitment security platform that analyzes job postings
              using a 10-point detection engine. Whether you're applying on a job board,
              responding to a recruiter email, or evaluating an offer — HIRESHIELD gives
              you an instant, transparent risk assessment.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Our engine checks for payment requests, unrealistic salaries, missing company
              details, sensitive information demands, and known scam patterns — returning
              honest PASS, FAIL, or UNVERIFIED results for every test.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-sky-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Honest Results</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Eye size={18} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Full Transparency</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText size={18} className="text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Detailed Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Refer a Friend ===== */}
      <section id="refer" className="bg-gradient-to-br from-sky-600 to-sky-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-sky-100 mb-4">
            <Users size={13} />
            Refer a Friend
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Know someone hunting for a job?
          </h2>
          <p className="mt-3 text-sky-100 max-w-xl mx-auto">
            Share HIRESHIELD with your friends and colleagues so they can verify job
            postings before applying. Protect your network from recruitment fraud.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-5 py-3">
            <Mail size={18} className="text-sky-200" />
            <a href="mailto:hireshield@gmail.com" className="text-sm font-medium text-white hover:text-sky-100 transition-smooth">
              hireshield@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ===== Contact Section ===== */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 mb-4">
          <Mail size={13} />
          Get in Touch
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Have questions or feedback?
        </h2>
        <p className="mt-3 text-slate-600 max-w-lg mx-auto">
          We'd love to hear from you. Reach out for support, feature requests, or
 partnership inquiries.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hireshield@gmail.com"
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-smooth shadow-sm"
          >
            <Mail size={18} className="text-sky-600" />
            hireshield@gmail.com
          </a>
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Create Free Account
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo size={24} />
                <span className="text-slate-300 font-bold tracking-tight">HIRESHIELD</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Recruitment security platform that helps job seekers identify
                potentially fraudulent job postings.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('hero')} className="block text-sm text-slate-500 hover:text-sky-400 transition-smooth">Home</button>
                <button onClick={() => scrollToSection('how-it-works')} className="block text-sm text-slate-500 hover:text-sky-400 transition-smooth">Overview</button>
                <button onClick={() => scrollToSection('about')} className="block text-sm text-slate-500 hover:text-sky-400 transition-smooth">About</button>
                <button onClick={() => scrollToSection('refer')} className="block text-sm text-slate-500 hover:text-sky-400 transition-smooth">Refer a Friend</button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Contact</h4>
              <a href="mailto:hireshield@gmail.com" className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-400 transition-smooth">
                <Mail size={15} />
                hireshield@gmail.com
              </a>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck size={15} className="text-sky-400" />
                <span>10-Point Detection Engine</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-sm">
            <p className="text-slate-500">
              Passing all 10 checks does not guarantee a job is genuine. Always verify independently.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const checks = [
  { title: 'URL Validation', desc: 'Verifies the submitted URL has a valid HTTP/HTTPS format.', icon: SearchCheck, color: 'bg-sky-50 text-sky-600' },
  { title: 'HTTPS Security', desc: 'Checks HTTPS usage and TLS certificate validity.', icon: Lock, color: 'bg-sky-50 text-sky-600' },
  { title: 'Company Information', desc: 'Checks whether the posting includes company details.', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { title: 'Contact Verification', desc: 'Evaluates recruiter contact info and email domain credibility.', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { title: 'Payment Detection', desc: 'Detects registration, interview, or placement fee requests.', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  { title: 'Salary Analysis', desc: 'Identifies unrealistically high salary claims without context.', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  { title: 'Job Description', desc: 'Checks for responsibilities, qualifications, skills, and role.', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { title: 'Scam Indicators', desc: 'Matches against known suspicious patterns and scam keywords.', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  { title: 'Sensitive Info Requests', desc: 'Detects requests for passwords, OTPs, or bank credentials.', icon: Lock, color: 'bg-red-50 text-red-600' },
  { title: 'Recruitment Verification', desc: 'Checks connection to official careers pages or job boards.', icon: ShieldCheck, color: 'bg-sky-50 text-sky-600' },
];

const steps = [
  { title: 'Create Account', desc: 'Register with your email and password in seconds.' },
  { title: 'Submit Job URL', desc: 'Paste the job posting URL you want to verify.' },
  { title: 'Run Analysis', desc: 'Our engine fetches and analyzes the posting with 10 tests.' },
  { title: 'Review Results', desc: 'Get a detailed report with PASS/FAIL/UNVERIFIED per test.' },
];
