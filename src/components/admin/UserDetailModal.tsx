'use client';

import { useState } from 'react';
import { X, Crown, Shield, User, BarChart2 } from 'lucide-react';
import UserActivityModal from './UserActivityModal';

interface UserRow {
  _id: string; email: string; firstName: string; lastName: string; username?: string;
  role: string; status: string; createdAt: string; updatedAt: string;
  activity?: { toolUsageCount?: number; toolsUsed?: number; isActive?: boolean };
}

interface Props { user: UserRow | null; isOpen: boolean; onClose: () => void; onEdit: () => void; }

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const statusBadge = (s: string) => {
  const map: Record<string, string> = { active: 'bg-green-50 text-green-700', inactive: 'bg-[var(--color-muted)] text-[var(--color-text-muted)]', suspended: 'bg-red-50 text-red-600' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[s] || 'bg-[var(--color-muted)] text-[var(--color-text-muted)]'}`}>{s}</span>;
};

const roleIcon = (role: string) => {
  if (role === 'super_admin') return <Crown className="w-3.5 h-3.5 text-yellow-500" />;
  if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-green-500" />;
  return <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />;
};

export default function UserDetailModal({ user, isOpen, onClose, onEdit }: Props) {
  const [showActivity, setShowActivity] = useState(false);
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">User Details</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Name', value: `${user.firstName} ${user.lastName}`.trim() || '—' },
              { label: 'Username', value: user.username ? `@${user.username}` : '—' },
              { label: 'Email', value: user.email },
              { label: 'Joined', value: fmt(user.createdAt) },
              { label: 'Last Updated', value: fmt(user.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] font-medium mb-1">{label}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] font-medium mb-1">Role</p>
              <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                {roleIcon(user.role)} <span className="capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] font-medium mb-1">Status</p>
              {statusBadge(user.status)}
            </div>
          </div>

          {user.activity && (
            <div className="border-t border-[var(--color-border)] pt-4">
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] font-medium mb-3">Activity (Last 7 Days)</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tools Used', value: user.activity.toolUsageCount, color: 'text-blue-600' },
                  { label: 'Unique Tools', value: user.activity.toolsUsed, color: 'text-green-600' },
                  { label: 'Active', value: user.activity.isActive ? 'Yes' : 'No', color: 'text-orange-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[var(--color-surface-secondary)] rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-[var(--color-border)] justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[13px] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] transition-colors">Close</button>
          <button
            onClick={() => setShowActivity(true)}
            className="h-9 px-4 text-[13px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            View Activity
          </button>
          <button onClick={onEdit} className="px-4 py-2 text-[13px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Edit User</button>
        </div>
      </div>

      {showActivity && (
        <UserActivityModal
          userId={user._id}
          userName={`${user.firstName} ${user.lastName}`.trim() || user.email}
          onClose={() => setShowActivity(false)}
        />
      )}
    </div>
  );
}
