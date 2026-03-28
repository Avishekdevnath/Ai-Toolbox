'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, BarChart3, Wrench, Edit } from 'lucide-react';

export default function ProfileView() {
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null), [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError('');
        const [pRes, sRes] = await Promise.all([fetch('/api/user/profile'), fetch('/api/user/stats')]);
        if (pRes.ok) { const p = await pRes.json(); setProfile(p.data || null); }
        if (sRes.ok) { const s = await sRes.json(); setStats(s.data?.userStats || null); }
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = profile ? (`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username) : 'User';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Profile</h1>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Manage your profile and account settings.</p>
        </div>
        <Link href="/dashboard/profile/edit" className="inline-flex items-center gap-1.5 h-9 px-4 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[13px] font-medium rounded-lg hover:bg-[var(--color-muted)] transition-colors">
          <Edit size={14} /> Edit Profile
        </Link>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-[var(--color-text-muted)]" />
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Profile Information</h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-[var(--color-muted)] rounded animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="text-[13px] text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{displayName}</div>
                <div className="text-[12px] text-[var(--color-text-muted)]">{profile?.email}</div>
              </div>
              <span className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700">{profile?.role ?? 'user'}</span>
            </div>
            <div className="border-t border-[var(--color-border-subtle)] pt-4 grid grid-cols-2 gap-4">
              {[
                { label: 'First Name', value: profile?.firstName },
                { label: 'Last Name', value: profile?.lastName },
                { label: 'Username', value: profile?.username },
                { label: 'Phone', value: profile?.phoneNumber },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">{label}</div>
                  <div className="text-[13px] text-[var(--color-text-primary)] break-words">{value || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={15} className="text-[var(--color-text-muted)]" />
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Account Statistics</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tools Used', value: stats?.totalToolsUsed ?? 0, color: 'text-blue-600' },
            { label: 'Total Analyses', value: stats?.totalAnalyses ?? 0, color: 'text-green-600' },
            { label: 'Sessions', value: stats?.sessionCount ?? 0, color: 'text-violet-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center bg-[var(--color-surface-secondary)] rounded-xl p-4">
              <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
              <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={15} className="text-[var(--color-text-muted)]" />
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'SWOT Analysis', href: '/tools/swot-analysis' },
            { label: 'Finance Advisor', href: '/tools/finance-advisor' },
            { label: 'Diet Planner', href: '/tools/diet-planner' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="inline-flex items-center h-9 px-4 border border-[var(--color-border)] text-[13px] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-muted)] transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
