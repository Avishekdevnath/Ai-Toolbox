import { IForm } from '@/models/FormModel';
import { IFormResponse } from '@/models/FormResponseModel';

function esc(s: any) { return '"' + String(s ?? '').replace(/"/g, '""') + '"'; }

export function formResponsesToCsv(form: IForm, responses: IFormResponse[]): string {
  const headers = ['submittedAt', 'name', 'email', 'studentId', ...form.fields.map((f) => f.label || f.id)];
  const rows: string[] = [];
  rows.push(headers.map(esc).join(','));
  for (const r of responses) {
    const base = [
      r.submittedAt.toISOString(),
      r.responder?.name || '',
      r.responder?.email || '',
      r.responder?.studentId || '',
    ];
    const map: Record<string, any> = {};
    for (const a of (r.answers || [])) map[a.fieldId] = a.value;
    const rest = form.fields.map((f) => {
      const v = map[f.id];
      return Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : (v ?? '');
    });
    rows.push([...base, ...rest].map(esc).join(','));
  }
  return rows.join('\n');
}


