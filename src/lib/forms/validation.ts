import { IForm } from '@/models/FormModel';

export function validateFormDefinition(form: Partial<IForm>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!form.title || !String(form.title).trim()) errors.push('Title is required');
  if (!form.type) errors.push('Type is required');
  const ids = new Set<string>();
  (form.fields || []).forEach((f: any, idx: number) => {
    if (!f?.id) errors.push(`Field[${idx}] missing id`);
    if (!f?.label) errors.push(`Field[${idx}] missing label`);
    if (f?.id) {
      if (ids.has(f.id)) errors.push(`Duplicate field id: ${f.id}`);
      ids.add(f.id);
    }
    if (['dropdown', 'radio', 'checkbox'].includes(f?.type) && (!f?.options || !f.options.length)) {
      errors.push(`Field[${idx}] options required for ${f?.type}`);
    }
    if (f?.multiple && f?.type !== 'dropdown') {
      errors.push(`multiple is only valid for dropdown`);
    }
  });
  return { valid: errors.length === 0, errors };
}

export function validateSubmission(form: IForm, payload: { answers: Array<{ fieldId: string; value: any }> }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fieldMap = new Map(form.fields.map((f) => [f.id, f]));
  const provided = new Map(payload.answers.map((a) => [a.fieldId, a.value]));
  for (const f of form.fields) {
    if (f.visibility === 'internal') continue;
    const val = provided.get(f.id);
    if (f.required && (val === undefined || val === null || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0))) {
      errors.push(`Missing required: ${f.label || f.id}`);
      continue;
    }
    if (val !== undefined) {
      if (f.type === 'email' && typeof val === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors.push(`Invalid email for: ${f.label}`);
      }
      if (['dropdown', 'radio', 'checkbox'].includes(f.type) && f.options) {
        const values = Array.isArray(val) ? val : [val];
        for (const v of values) if (!f.options.includes(String(v))) errors.push(`Invalid option for: ${f.label}`);
        if (f.type === 'radio' && Array.isArray(val)) errors.push(`Radio must be single-select: ${f.label}`);
        if (f.type === 'checkbox' && !Array.isArray(val)) errors.push(`Checkbox must be multi-select array: ${f.label}`);
        if (f.multiple && f.type === 'dropdown' && !Array.isArray(val)) errors.push(`Dropdown multiple expects array: ${f.label}`);
        const selRule = f.validation?.selection;
        if (selRule && Array.isArray(val)) {
          if (selRule.min !== undefined && val.length < selRule.min) errors.push(`${f.label}: select at least ${selRule.min}`);
          if (selRule.max !== undefined && val.length > selRule.max) errors.push(`${f.label}: select at most ${selRule.max}`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}


