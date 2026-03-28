import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';
import OpenAI from 'openai';

const CHOICE_TYPES = ['radio', 'dropdown', 'single_select'];
const RATING_TYPES = ['rating', 'scale'];
const TEXT_TYPES = ['short_text', 'long_text', 'email', 'date', 'time'];
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
      { $group: { _id: null, totalResponses: { $sum: 1 }, avgDurationMs: { $avg: '$durationMs' } } },
    ]);
    const totalResponses: number = totalsAgg[0]?.totalResponses ?? 0;
    const avgDurationMs: number = totalsAgg[0]?.avgDurationMs ?? 0;

    // --- Scalar choice + rating counts ---
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

    // --- Number stats ---
    const numberFieldIds = fields.filter(f => f.type === 'number').map(f => f.id);
    const numberStats: Array<{ _id: string; average: number; min: number; max: number }> =
      numberFieldIds.length > 0
        ? await FormResponse.aggregate([
            { $match: { formId } },
            { $unwind: '$answers' },
            { $match: { 'answers.fieldId': { $in: numberFieldIds } } },
            { $group: { _id: '$answers.fieldId', average: { $avg: { $toDouble: '$answers.value' } }, min: { $min: { $toDouble: '$answers.value' } }, max: { $max: { $toDouble: '$answers.value' } } } },
          ])
        : [];

    // --- Text samples ---
    const textFieldIds = fields.filter(f => TEXT_TYPES.includes(f.type)).map(f => f.id);
    const textSamples: Record<string, string[]> = {};
    if (textFieldIds.length > 0) {
      const recentForSamples = await FormResponse.find({ formId }, { answers: 1 })
        .sort({ submittedAt: -1 }).limit(100).lean() as any[];
      for (const fieldId of textFieldIds) {
        const samples: string[] = [];
        for (const r of recentForSamples) {
          const ans = (r.answers || []).find((a: any) => a.fieldId === fieldId);
          if (ans?.value !== undefined && String(ans.value).trim()) {
            samples.push(String(ans.value).trim());
            if (samples.length >= 5) break;
          }
        }
        textSamples[fieldId] = samples;
      }
    }

    // --- 50 most recent raw responses ---
    const rawResponses = await FormResponse.find(
      { formId },
      { answers: 1, responder: 1, submittedAt: 1, score: 1, maxScore: 1 }
    ).sort({ submittedAt: -1 }).limit(50).lean() as any[];

    // --- Build analytics summary lines ---
    const summaryLines: string[] = [];
    for (const field of fields) {
      if (SKIP_TYPES.includes(field.type)) continue;
      if ([...CHOICE_TYPES, 'checkbox'].includes(field.type)) {
        const source = field.type === 'checkbox' ? checkboxCounts : scalarCounts;
        const counts: Record<string, number> = {};
        for (const c of source) { if (c._id.fieldId === field.id) counts[c._id.value] = c.count; }
        const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
        const top3 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
          .map(([v, n]) => `${v} ${Math.round((n / total) * 100)}%`).join(', ');
        if (top3) summaryLines.push(`- "${field.label}" (${field.type}): ${top3}`);
      } else if (RATING_TYPES.includes(field.type)) {
        let total = 0, sum = 0;
        for (const c of scalarCounts) {
          if (c._id.fieldId === field.id) { total += c.count; sum += Number(c._id.value) * c.count; }
        }
        if (total > 0) summaryLines.push(`- "${field.label}" (${field.type}): Average ${Math.round((sum / total) * 10) / 10}`);
      } else if (field.type === 'number') {
        const stat = numberStats.find(n => n._id === field.id);
        if (stat) summaryLines.push(`- "${field.label}" (number): Average ${Math.round(stat.average * 10) / 10}, range ${stat.min}–${stat.max}`);
      } else if (TEXT_TYPES.includes(field.type)) {
        const samples = textSamples[field.id] || [];
        if (samples.length > 0) summaryLines.push(`- "${field.label}" (${field.type}): Sample answers: ${samples.map(s => `"${s}"`).join(', ')}`);
      }
    }

    // --- Format raw responses ---
    const fieldMap: Record<string, string> = {};
    for (const f of fields) fieldMap[f.id] = f.label;

    const rawLines = rawResponses.map((r, i) => {
      const parts = (r.answers || [])
        .filter((a: any) => a.value !== undefined && a.value !== null && String(a.value).trim())
        .map((a: any) => `${fieldMap[a.fieldId] || a.fieldId}: ${Array.isArray(a.value) ? a.value.join(', ') : String(a.value)}`)
        .join('; ');
      return `Response ${i + 1}: ${parts}`;
    }).join('\n');

    const durationText = avgDurationMs > 0
      ? (() => { const s = Math.round(avgDurationMs / 1000); return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`; })()
      : null;

    const nonSkippedFields = fields.filter(f => !SKIP_TYPES.includes(f.type));

    const prompt = `You are analyzing form response data. Return a JSON object only — no markdown, no prose outside the JSON.

Form: "${form.title}"
Form type: ${form.type}
Total responses: ${totalResponses}${durationText ? `\nAverage completion time: ${durationText}` : ''}

AGGREGATED DATA:
${summaryLines.length > 0 ? summaryLines.join('\n') : 'No aggregated field data.'}

RECENT RAW RESPONSES (up to 50):
${rawLines || 'No responses yet.'}

Return this exact JSON shape:
{
  "executiveSummary": "3-4 sentences covering total responses, overall tone, and single most important finding",
  "fieldInsights": [
    ${nonSkippedFields.map(f => `{ "fieldId": "${f.id}", "label": "${f.label}", "insight": "1-2 specific sentences about this field's data", "sentiment": ${TEXT_TYPES.includes(f.type) ? '"positive" or "neutral" or "negative"' : 'null'} }`).join(',\n    ')}
  ],
  "recommendations": [
    "Specific action 1 based on the data",
    "Specific action 2 based on the data",
    "Specific action 3 based on the data"
  ]
}

Rules:
- sentiment: only set to positive/neutral/negative for text fields, null for all other types
- Be specific with numbers from the data
- recommendations must be concrete and tailored to this form's content
- executiveSummary must mention total response count`;

    let report: any;
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      const raw = completion.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(raw);
      report = {
        executiveSummary: parsed.executiveSummary || 'Summary could not be generated.',
        fieldInsights: Array.isArray(parsed.fieldInsights) ? parsed.fieldInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        generatedAt: new Date().toISOString(),
      };
    } catch (aiErr) {
      console.error('[ai-report/generate] OpenAI error:', aiErr);
      report = {
        executiveSummary: 'AI report is temporarily unavailable. Please try again later.',
        fieldInsights: [],
        recommendations: [],
        generatedAt: new Date().toISOString(),
      };
    }

    await Form.findByIdAndUpdate(formId, {
      $set: {
        'aiInsights.data.report': report,
        'aiInsights.generatedAt': new Date(),
        'aiInsights.model': 'gpt-4o-mini',
        'aiInsights.generatedBy': String(claims.id),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('[ai-report/generate] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
