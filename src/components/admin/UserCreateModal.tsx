'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function UserCreateModal({ isOpen, onClose, onCreate }: Props) {
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'user', status: 'active' });
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameError, setUsernameError] = useState('');

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
    setUsernameStatus('idle');
    setUsernameError('');
    onClose();
  };

  // Real-time username availability check
  useEffect(() => {
    const username = form.username.trim();

    if (!username) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();

        if (!res.ok) {
          setUsernameStatus('invalid');
          setUsernameError(data.error || 'Invalid username');
        } else {
          setUsernameStatus(data.available ? 'available' : 'taken');
          setUsernameError(data.available ? '' : 'Username is already taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus === 'checking') {
      setError('Please wait for username availability check to complete');
      return;
    }
    if (usernameStatus !== 'available') {
      setError(usernameError || 'Please choose a valid, available username');
      return;
    }

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

  function renderUsernameIcon() {
    if (usernameStatus === 'checking') return <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-text-muted)]" />;
    if (usernameStatus === 'available') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" className="max-w-[72rem] rounded-2xl border-[var(--color-border)]/80">
      <ModalHeader className="flex items-center justify-between px-7 py-5 border-b border-[var(--color-border)] bg-gradient-to-r from-slate-50 via-white to-blue-50/60">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">Create New User</h2>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">Add profile details, role access, and recovery questions in one flow.</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="px-7 py-6 space-y-5 bg-gradient-to-b from-white to-slate-50/50">
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]p-4 shadow-sm xl:col-span-7">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">User details</h3>
                <span className="rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">Required fields</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="First name *">
                  <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" required className={inputCls} />
                </Field>
                <Field label="Last name *">
                  <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" required className={inputCls} />
                </Field>
              </div>

              <Field label="Username *">
                <div className="relative">
                  <input
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    placeholder="Letters, numbers, underscores (3–20 chars)"
                    required
                    className={`${inputCls} pr-8 ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : usernameStatus === 'available' ? 'border-green-400 focus:border-green-400 focus:ring-green-500/20' : ''}`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {renderUsernameIcon()}
                  </div>
                </div>
                {usernameError ? (
                  <p className="text-[11px] text-red-500 mt-1">{usernameError}</p>
                ) : (
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Letters, numbers, underscores only</p>
                )}
              </Field>

              <Field label="Email *">
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email address" required className={inputCls} />
              </Field>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Role">
                  <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                    <option value="user">User</option>
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

              <p className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                A temporary password will be generated. The user must set their own password via forgot-password.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]p-4 shadow-sm xl:col-span-5">
              <div>
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Security Questions *</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">3–5 questions required for password recovery</p>
              </div>

              <div className="max-h-[23rem] space-y-3 overflow-y-auto pr-1">
                {securityQuestions.map((sq, index) => (
                  <div key={index} className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 bg-[var(--color-surface-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Question {index + 1}</span>
                      {securityQuestions.length > 3 && (
                        <button type="button" onClick={() => removeSQ(index)} className="p-1 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
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
              </div>

              {securityQuestions.length < 5 && (
                <input
                  type="button"
                  value="+ Add another question"
                  onClick={addSQ}
                  className="w-full cursor-pointer rounded-lg border border-dashed border-blue-200 bg-blue-50/70 px-3 py-2 text-left text-[12px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
                />
              )}
            </section>
          </div>
        </ModalContent>

        <ModalFooter className="flex justify-end gap-2.5 px-7 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <button type="button" onClick={handleClose} disabled={loading} className="h-9 px-4 text-[13px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'idle'}
            className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {loading ? 'Creating…' : 'Create User'}
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
