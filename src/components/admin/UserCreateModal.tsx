'use client';

import { useState } from 'react';
import { X, Save, Loader2, Plus } from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: any) => Promise<void>;
}

export default function UserCreateModal({ isOpen, onClose, onCreate }: Props) {
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'user', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleClose = () => {
    setForm({ firstName: '', lastName: '', username: '', email: '', role: 'user', status: 'active' });
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreate(form);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <h2 className="text-[15px] font-semibold text-slate-800">Create New User</h2>
        </div>
        <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="px-6 py-5 space-y-5">
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" required className={inputCls} />
            </Field>
            <Field label="Last name">
              <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" required className={inputCls} />
            </Field>
          </div>

          {/* Username */}
          <Field label="Username">
            <input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="username (optional)" className={inputCls} />
          </Field>

          {/* Email */}
          <Field label="Email *">
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
        </ModalContent>

        <ModalFooter className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={handleClose} disabled={loading} className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
} 