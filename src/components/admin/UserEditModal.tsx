'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Shield, Crown } from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface UserData {
  _id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  activity?: {
    toolUsageCount?: number;
    toolsUsed?: number;
    isActive?: boolean;
  };
}

interface Props {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: any) => Promise<void>;
}

const roleIcon = (role: string) => {
  if (role === 'super_admin') return <Crown className="w-3.5 h-3.5 text-yellow-500" />;
  if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-orange-500" />;
  return <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />;
};

const statusColor: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-[var(--color-muted)] text-[var(--color-text-muted)]',
  suspended: 'bg-red-50 text-red-600',
};

export default function UserEditModal({ user, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'user', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, status: user.status });
  }, [user]);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await onSave(user._id, form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const initials = [user.firstName, user.lastName].filter(Boolean).map((n) => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Edit User</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="px-6 py-5 space-y-5">

          {/* User identity header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">
                {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : '—'}
              </p>
              {user.username && <p className="text-[12px] text-blue-500 font-medium">@{user.username}</p>}
              <p className="text-[12px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            <span className={`ml-auto flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColor[user.status] ?? 'bg-[var(--color-muted)] text-[var(--color-text-muted)]'}`}>
              {roleIcon(user.role)}
              <span className="capitalize">{user.role.replace('_', ' ')}</span>
            </span>
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" className={inputCls} />
            </Field>
            <Field label="Last name">
              <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" className={inputCls} />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email address" required className={inputCls} />
          </Field>

          {/* Role + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
          </div>

          {/* Activity summary — only if present */}
          {user.activity && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              <ActivityStat value={user.activity.toolUsageCount} label="Uses (7d)" />
              <ActivityStat value={user.activity.toolsUsed} label="Unique tools" />
              <ActivityStat value={user.activity.isActive ? 'Active' : 'Idle'} label="State" highlight={user.activity.isActive} />
            </div>
          )}
        </ModalContent>

        <ModalFooter className="flex justify-end gap-2.5 px-6 py-4 border-t border-[var(--color-border)]">
          <button type="button" onClick={onClose} disabled={loading} className="h-9 px-4 text-[13px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

const inputCls = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] text-[var(--color-text-secondary)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ActivityStat({ value, label, highlight }: { value: number | string; label: string; highlight?: boolean }) {
  return (
    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl p-3 text-center">
      <p className={`text-[18px] font-bold tabular-nums leading-none ${highlight ? 'text-green-600' : 'text-[var(--color-text-secondary)]'}`}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-none">{label}</p>
    </div>
  );
}
