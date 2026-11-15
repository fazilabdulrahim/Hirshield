import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Calendar, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/Sidebar';
import type { Profile } from '@/types';

export function ProfilePage() {
  const { user, fullName, updateFullName } = useAuth();
  const [name, setName] = useState(fullName);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setProfile(data as Profile);
        setName(data.full_name);
      }
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setMessage('');
    const { error } = await updateFullName(name.trim());
    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage('Profile updated successfully');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {(name || fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{name || fullName || 'User'}</h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${
              message.startsWith('Error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={setName}
                placeholder="Your full name"
                icon={<UserIcon size={18} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Member Since</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={profile ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
            </div>

            <Button variant="primary" size="md" disabled={saving || name.trim() === fullName} onClick={handleSave}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Security info */}
        <Card className="p-5 bg-sky-50 border-sky-200">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Account Security</h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Your password is securely hashed. All your analysis data is private — only you
                can access your job submission history and reports.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
