import { IForm } from '@/models/FormModel';
import { IFormResponse } from '@/models/FormResponseModel';

export function canSubmit(form: IForm, responder: { email?: string; studentId?: string }, existing: IFormResponse[]): { allowed: boolean; reason?: string } {
  if (!form.submissionPolicy?.oneAttemptPerIdentity) return { allowed: true };
  const dedupe = form.submissionPolicy?.dedupeBy || [];
  if (dedupe.includes('email') && responder.email) {
    if (existing.some((r) => r.responder?.email?.toLowerCase() === responder.email?.toLowerCase())) {
      return { allowed: false, reason: 'duplicate_email' };
    }
  }
  if (dedupe.includes('studentId') && responder.studentId) {
    if (existing.some((r) => r.responder?.studentId === responder.studentId)) {
      return { allowed: false, reason: 'duplicate_studentId' };
    }
  }
  return { allowed: true };
}


