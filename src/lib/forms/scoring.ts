import { IForm } from '@/models/FormModel';

export function scoreQuiz(form: IForm, answers: Array<{ fieldId: string; value: any }>): { score: number; maxScore: number; perQuestion: Array<{ fieldId: string; points: number; earned: number }> } {
  let score = 0;
  let maxScore = 0;
  const perQuestion: Array<{ fieldId: string; points: number; earned: number }> = [];
  const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));
  for (const f of form.fields) {
    const pts = f.quiz?.points ?? 0;
    if (!pts || !f.quiz?.correctOptions || !f.quiz.correctOptions.length) continue;
    maxScore += pts;
    const given = answerMap.get(f.id);
    let earned = 0;
    if (f.type === 'radio' || (f.type === 'dropdown' && !f.multiple)) {
      const idx = typeof given === 'number' ? given : (typeof given === 'string' ? f.options?.indexOf(given) ?? -1 : -1);
      if (idx !== -1 && f.quiz.correctOptions.includes(idx)) earned = pts;
    } else if (f.type === 'checkbox' || (f.type === 'dropdown' && f.multiple)) {
      const arr = Array.isArray(given) ? given : [];
      const idxs = arr.map((v: any) => (typeof v === 'number' ? v : (typeof v === 'string' ? (f.options?.indexOf(v) ?? -1) : -1))).filter((i: number) => i >= 0);
      const correct = new Set(f.quiz.correctOptions);
      const allMatch = idxs.length === correct.size && idxs.every((i: number) => correct.has(i));
      if (allMatch) earned = pts;
    }
    score += earned;
    perQuestion.push({ fieldId: f.id, points: pts, earned });
  }
  return { score, maxScore, perQuestion };
}


