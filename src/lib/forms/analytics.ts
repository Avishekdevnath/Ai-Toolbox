import { IForm } from '@/models/FormModel';
import { IFormResponse } from '@/models/FormResponseModel';

export function aggregateDistributions(form: IForm, responses: IFormResponse[]) {
  const distributions: Record<string, Record<string, number>> = {};
  const choiceFieldIds = (form.fields || []).filter((f: any) => ['dropdown', 'radio', 'checkbox'].includes(f.type)).map((f) => f.id);
  for (const r of responses) {
    for (const a of (r.answers || [])) {
      if (!choiceFieldIds.includes(a.fieldId)) continue;
      const vals = Array.isArray(a.value) ? a.value : [a.value];
      const bucket = (distributions[a.fieldId] = distributions[a.fieldId] || {});
      for (const v of vals) {
        const key = String(v ?? '');
        bucket[key] = (bucket[key] || 0) + 1;
      }
    }
  }
  return distributions;
}

export function timeSeries(responses: IFormResponse[], days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const map = new Map<string, number>();
  for (const r of responses) {
    if (r.submittedAt < cutoff) continue;
    const key = r.submittedAt.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
}

export function attendanceStats(responses: IFormResponse[]) {
  const total = responses.length;
  const byDay = timeSeries(responses, 14);
  return { total, byDay };
}


