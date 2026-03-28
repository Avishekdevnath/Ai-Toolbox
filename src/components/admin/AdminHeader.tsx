'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, LogOut, Settings, Activity, AlertTriangle } from 'lucide-react';
import { signOutClient } from '@/lib/authService';
import ThemeDropdown from '@/components/ui/ThemeDropdown';

interface AdminUser {
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function AdminHeader() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetch('/api/admin/auth/session')
      .then((r) => r.json())
      .then((d) => (d.success && d.admin ? setAdmin(d.admin) : router.push('/')))
      .catch(() => router.push('/'));
  }, [router]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setNotifOpen(false);
    setAdmin(null);
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    signOutClient();
    router.replace('/');
    router.refresh();
  };

  const displayName = admin
    ? (admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.email)
    : '…';

  const initials = admin
    ? (admin.firstName && admin.lastName
        ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
        : admin.email.slice(0, 2).toUpperCase())
    : 'A';

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-5 bg-[var(--color-surface)] border-b border-[var(--color-border)] gap-4">
      {/* Search */}
      <div className="relative hidden md:flex items-center w-full max-w-xs">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="search"
          placeholder="Search admin panel…"
          className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <ThemeDropdown />
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)]">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Notifications</span>
                <button className="text-[11px] text-blue-500 hover:text-blue-700">Mark all read</button>
              </div>
              <NotifItem icon={<Activity className="w-4 h-4 text-blue-500" />} title="New user registration" body="A new user has registered." time="2m ago" />
              <NotifItem icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />} title="System alert" body="High memory usage detected." time="1h ago" />
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white">
              {initials}
            </div>
            <span className="hidden md:inline text-[13px] font-medium text-[var(--color-text-secondary)] max-w-[120px] truncate">{displayName}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-52 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[var(--color-border-subtle)]">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{displayName}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{admin?.email}</p>
              </div>
              <Link href="/admin/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-colors">
                <Settings className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Profile & Settings
              </Link>
              <div className="border-t border-[var(--color-border-subtle)]">
                <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-red-500 hover:bg-[var(--color-destructive-muted)] transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NotifItem({ icon, title, body, time }: { icon: React.ReactNode; title: string; body: string; time: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-muted)] transition-colors">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{title}</p>
        <p className="text-[12px] text-[var(--color-text-muted)] truncate">{body}</p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{time}</p>
      </div>
    </div>
  );
}
