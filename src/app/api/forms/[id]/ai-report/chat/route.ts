import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';
import OpenAI from 'openai';

const CHOICE_TYPES = ['radio', 'dropdown', 'single_select'];
const RATING_TYPES = ['rating', 'scale'];
const SKIP_TYPES = ['section', 'matrix', 'file', 'image', 'video'];

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const message: string = body.message || '';
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = body.history || [];

    if (!message.trim()) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    const { id } = await params;
    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();

    const form = await Form.findById(new mongoose.Types.ObjectId(id)).lean() as any;
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (String(form.ownerId) !== String(claims.id)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const formId = form._id;
    const fields: any[] = form.fields || [];

    // --- Totals ---
    const totalsAgg = await FormResponse.aggregate([
      { $match: { formId } },
      { $group: { _id: null, totalResponses: { $sum: 1 } } },
    ]);
    const totalResponses: number = totalsAgg[0]?.totalResponses ?? 0;

    // --- Scalar counts ---
    const scalarFieldIds = fields.filter(f => [...CHOICE_TYPES, ...RATING_TYPES].includes(f.type)).map(f => f.id);
    const scalarCounts: Array<{ _id: { fieldId: string; value: string }; count: number }> =
      scalarFieldIds.length > 0
        ? await FormResponse.aggregate([
            { $match: { formId } },
            { $unwind: '$answers' },
            { $match: { 'answers.fieldId': { $in: scalarFieldIds } } },
            { $group: { _id: { fieldId: '$answers.fieldId', value: { $toString: '$answers.value' } }, count: { $sum: 1 } } },
          ])
        : [];

    // --- Checkbox counts ---
    const checkboxFieldIds = fields.filter(f => f.type === 'checkbox').map(f => f.id);
    const checkboxCounts: Array<{ _id: { fieldId: string; value: string }; count: number }> =
      checkboxFieldIds.length > 0
        ? await FormResponse.aggregate([
            { $match: { formId } },
            { $unwind: '$answers' },
            { $match: { 'answers.fieldId': { $in: checkboxFieldIds } } },
            { $unwind: '$answers.value' },
            { $group: { _id: { fieldId: '$answers.fieldId', value: { $toString: '$answers.value' } }, count: { $sum: 1 } } },
          ])
        : [];

    // --- 50 most recent raw responses ---
    const rawResponses = await FormResponse.find(
      { formId },
      { answers: 1, responder: 1, submittedAt: 1, score: 1, maxScore: 1 }
    ).sort({ submittedAt: -1 }).limit(50).lean() as any[];

    // --- Build context ---
    const fieldMap: Record<string, string> = {};
    for (const f of fields) fieldMap[f.id] = f.label;

    const summaryLines: string[] = [];
    for (const field of fields) {
      if (SKIP_TYPES.includes(field.type)) continue;
      if ([...CHOICE_TYPES, 'checkbox'].includes(field.type)) {
        const source = field.type === 'checkbox' ? checkboxCounts : scalarCounts;
        const counts: Record<string, number> = {};
        for (const c of source) { if (c._id.fieldId === field.id) counts[c._id.value] = c.count; }
        const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
        const parts = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([v, n]) => `${v}: ${n} (${Math.round((n / total) * 100)}%)`).join(', ');
        if (parts) summaryLines.push(`"${field.label}": ${parts}`);
      } else if (RATING_TYPES.includes(field.type)) {
        let total = 0, sum = 0;
        for (const c of scalarCounts) {
          if (c._id.fieldId === field.id) { total += c.count; sum += Number(c._id.value) * c.count; }
        }
        if (total > 0) summaryLines.push(`"${field.label}": average ${Math.round((sum / total) * 10) / 10} (${total} responses)`);
      }
    }

    const rawLines = rawResponses.map((r, i) => {
      const parts = (r.answers || [])
        .filter((a: any) => a.value !== undefined && a.value !== null && String(a.value).trim())
        .map((a: any) => `${fieldMap[a.fieldId] || a.fieldId}: ${Array.isArray(a.value) ? a.value.join(', ') : String(a.value)}`)
        .join('; ');
      return `Response ${i + 1}: ${parts}`;
    }).join('\n');

    const cachedReport = form.aiInsights?.data?.report;
    const reportContext = cachedReport
      ? `\nPREVIOUSLY GENERATED REPORT:\n${cachedReport.executiveSummary}\n${(cachedReport.recommendations || []).join('\n')}`
      : '';

    const systemPrompt = `You are an AI assistant analyzing form response data for the form "${form.title}" (type: ${form.type}).

TOTAL RESPONSES: ${totalResponses}

AGGREGATED DATA:
${summaryLines.join('\n') || 'No aggregated data.'}

RAW RESPONSES (up to 50 most recent):
${rawLines || 'No responses yet.'}
${reportContext}

Answer questions about this form's response data concisely and specifically. Use actual numbers from the data. If asked something you cannot determine from the data provided, say so clearly rather than guessing. Keep answers to 2-4 sentences unless a longer answer is clearly needed.`;

    let reply: string;
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content } as OpenAI.Chat.ChatCompletionMessageParam)),
        { role: 'user', content: message },
      ];

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages,
      });
      reply = completion.choices[0]?.message?.content?.trim() || 'I could not generate a response.';
    } catch (aiErr) {
      console.error('[ai-report/chat] OpenAI error:', aiErr);
      reply = "I'm temporarily unavailable. Please try again in a moment.";
    }

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error('[ai-report/chat] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
