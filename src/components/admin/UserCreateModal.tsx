'use client';

import { useState } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { SECURITY_QUESTION_OPTIONS } from '@/lib/auth/securityQuestions';

interface SecurityQuestion {
  questionId: string;
  answer: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: any) => Promise<void>;
}

const emptyQuestion = (): SecurityQuestion => ({ questionId: '', answer: '' });

export default function UserCreateModal({ isOpen, onClose, onCreate }: Props) {
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'user', status: 'active' });
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const setSQ = (index: number, key: keyof SecurityQuestion, value: string) =>
    setSecurityQuestions((prev) => prev.map((q, i) => i === index ? { ...q, [key]: value } : q));

  const addSQ = () => {
    if (securityQuestions.length < 5) setSecurityQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeSQ = (index: number) => {
    if (securityQuestions.length > 3) setSecurityQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setForm({ firstName: '', lastName: '', username: '', email: '', role: 'user', status: 'active' });
    setSecurityQuestions([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreate({ ...form, securityQuestions });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedQuestionIds = new Set(securityQuestions.map((q) => q.questionId).filter(Boolean));

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

          {/* Security Questions */}
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Security Questions *</p>
              <p className="text-[11px] text-slate-400 mt-0.5">3–5 questions required for password recovery</p>
            </div>

            {securityQuestions.map((sq, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">Question {index + 1}</span>
                  {securityQuestions.length > 3 && (
                    <button type="button" onClick={() => removeSQ(index)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <select
                  value={sq.questionId}
                  onChange={(e) => setSQ(index, 'questionId', e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Select a question</option>
                  {SECURITY_QUESTION_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      disabled={sq.questionId !== opt.id && selectedQuestionIds.has(opt.id)}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  value={sq.answer}
                  onChange={(e) => setSQ(index, 'answer', e.target.value)}
                  placeholder="Your answer"
                  required
                  autoComplete="off"
                  className={inputCls}
                />
              </div>
            ))}

            {securityQuestions.length < 5 && (
              <button
                type="button"
                onClick={addSQ}
                className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add another question
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            A temporary password will be generated. The user must set their own password via forgot-password.
          </p>
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
