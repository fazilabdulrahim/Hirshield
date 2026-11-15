import type { ReactNode } from 'react';
import {
  LayoutDashboard, SearchCheck, History, User, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze Job', icon: SearchCheck },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'profile', label: 'My Profile', icon: User },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { fullName, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(page: string) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 bg-white rounded-xl shadow-md border border-slate-200 transition-smooth"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 mesh-bg" />
        <div className="relative flex flex-col h-full text-slate-300">

          {/* Logo section */}
          <div className="px-5 py-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Logo size={36} />
              <div className="min-w-0">
                <h1 className="text-white font-bold text-base tracking-tight truncate">HIRESHIELD</h1>
                <p className="text-slate-400 text-xs">Recruitment Security</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            <p className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth relative group ${
                    active
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/5">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-700 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{fullName || 'User'}</p>
                <p className="text-slate-500 text-xs">Signed in</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-smooth"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop offset */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
