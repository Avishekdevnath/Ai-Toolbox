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
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
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
    if (!form) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
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
    const scalarFieldIds = fields
      .filter(f => [...CHOICE_TYPES, ...RATING_TYPES].includes(f.type))
      .map(f => f.id);

    const scalarCounts: Array<{ _id: { fieldId: string; value: string }; count: number }> =
      scalarFieldIds.length > 0
        ? await FormResponse.aggregate([
            { $match: { formId } },
            { $unwind: '$answers' },
            { $match: { 'answers.fieldId': { $in: scalarFieldIds } } },
            {
              $group: {
                _id: { fieldId: '$answers.fieldId', value: { $toString: '$answers.value' } },
                count: { $sum: 1 },
              },
            },
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
            {
              $group: {
                _id: { fieldId: '$answers.fieldId', value: { $toString: '$answers.value' } },
                count: { $sum: 1 },
              },
            },
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
            {
              $group: {
                _id: '$answers.fieldId',
                average: { $avg: { $toDouble: '$answers.value' } },
                min: { $min: { $toDouble: '$answers.value' } },
                max: { $max: { $toDouble: '$answers.value' } },
              },
            },
          ])
        : [];

    // --- Text samples ---
    const textFieldIds = fields.filter(f => TEXT_TYPES.includes(f.type)).map(f => f.id);
    const textSamples: Record<string, string[]> = {};
    if (textFieldIds.length > 0) {
      const recentResponses = await FormResponse.find({ formId }, { answers: 1 })
        .sort({ submittedAt: -1 })
        .limit(100)
        .lean() as any[];
      for (const fieldId of textFieldIds) {
        const samples: string[] = [];
        for (const r of recentResponses) {
          const ans = (r.answers || []).find((a: any) => a.fieldId === fieldId);
          if (ans?.value !== undefined && ans.value !== null && String(ans.value).trim()) {
            samples.push(String(ans.value).trim());
            if (samples.length >= 3) break;
          }
        }
        textSamples[fieldId] = samples;
      }
    }

    // --- Build prompt lines ---
    const durationText = avgDurationMs > 0
      ? (() => {
          const s = Math.round(avgDurationMs / 1000);
          return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
        })()
      : null;

    const fieldLines: string[] = [];
    for (const field of fields) {
      if (SKIP_TYPES.includes(field.type)) continue;

      if ([...CHOICE_TYPES, 'checkbox'].includes(field.type)) {
        const source = field.type === 'checkbox' ? checkboxCounts : scalarCounts;
        const counts: Record<string, number> = {};
        for (const c of source) {
          if (c._id.fieldId === field.id) counts[c._id.value] = c.count;
        }
        const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
        const top3 = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([v, n]) => `${v} ${Math.round((n / total) * 100)}%`)
          .join(', ');
        if (top3) fieldLines.push(`- "${field.label}": ${top3}`);

      } else if (RATING_TYPES.includes(field.type)) {
        const counts: Record<string, number> = {};
        let total = 0, sum = 0;
        for (const c of scalarCounts) {
          if (c._id.fieldId === field.id) {
            counts[c._id.value] = c.count;
            total += c.count;
            sum += Number(c._id.value) * c.count;
          }
        }
        if (total > 0) {
          const avg = Math.round((sum / total) * 10) / 10;
          fieldLines.push(`- "${field.label}": Average ${avg}`);
        }

      } else if (field.type === 'number') {
        const stat = numberStats.find(n => n._id === field.id);
        if (stat) {
          fieldLines.push(`- "${field.label}": Average ${Math.round(stat.average * 10) / 10}, range ${stat.min}–${stat.max}`);
        }

      } else if (TEXT_TYPES.includes(field.type)) {
        const samples = textSamples[field.id] || [];
        if (samples.length > 0) {
          fieldLines.push(`- "${field.label}": Sample answers: ${samples.map(s => `"${s}"`).join(', ')}`);
        }
      }
    }

    const prompt = `You are analyzing form response data. Write a concise 2-4 sentence summary of the key patterns and insights. Be specific about numbers. Do not use bullet points. Write in third person (e.g. "Respondents rated...").

Form: "${form.title}"
Total responses: ${totalResponses}${durationText ? `\nAverage completion time: ${durationText}` : ''}

${fieldLines.length > 0 ? fieldLines.join('\n') : 'No field-level data available.'}`;

    // --- Call OpenAI ---
    let summary: string;
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });
      summary = completion.choices[0]?.message?.content?.trim() || 'AI summary could not be generated.';
    } catch (aiErr) {
      console.error('[ai-summary] OpenAI error:', aiErr);
      summary = 'AI summary is temporarily unavailable. Please try again later.';
    }

    // --- Cache on form ---
    await Form.findByIdAndUpdate(formId, {
      $set: {
        'aiInsights.data.summary': summary,
        'aiInsights.data.summaryGeneratedAt': new Date().toISOString(),
        'aiInsights.generatedAt': new Date(),
        'aiInsights.model': 'gpt-4o-mini',
        'aiInsights.generatedBy': String(claims.id),
      },
    });

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error('[ai-summary] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
