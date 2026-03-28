import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';

const CHOICE_TYPES = ['radio', 'dropdown', 'single_select'];
const RATING_TYPES = ['rating', 'scale'];
const TEXT_TYPES = ['short_text', 'long_text', 'email', 'date', 'time'];
const SKIP_TYPES = ['section', 'matrix', 'file', 'image', 'video'];

export async function GET(
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

    // --- Choice field counts (radio, dropdown, single_select, rating, scale) ---
    const scalarChoiceFieldIds = fields
      .filter(f => [...CHOICE_TYPES, ...RATING_TYPES].includes(f.type))
      .map(f => f.id);

    const scalarCounts: Array<{ _id: { fieldId: string; value: string }; count: number }> =
      scalarChoiceFieldIds.length > 0
        ? await FormResponse.aggregate([
            { $match: { formId } },
            { $unwind: '$answers' },
            { $match: { 'answers.fieldId': { $in: scalarChoiceFieldIds } } },
            {
              $group: {
                _id: { fieldId: '$answers.fieldId', value: { $toString: '$answers.value' } },
                count: { $sum: 1 },
              },
            },
          ])
        : [];

    // --- Checkbox counts (value is an array, needs second $unwind) ---
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

    // --- Number field stats ---
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

    // --- Text/date/time samples (5 most recent non-empty per field) ---
    const textFieldIds = fields.filter(f => TEXT_TYPES.includes(f.type)).map(f => f.id);
    const textSamples: Record<string, string[]> = {};

    if (textFieldIds.length > 0) {
      const recentResponses = await FormResponse.find(
        { formId },
        { answers: 1 }
      )
        .sort({ submittedAt: -1 })
        .limit(200)
        .lean() as any[];

      for (const fieldId of textFieldIds) {
        const samples: string[] = [];
        for (const r of recentResponses) {
          const ans = (r.answers || []).find((a: any) => a.fieldId === fieldId);
          if (ans?.value !== undefined && ans.value !== null && String(ans.value).trim()) {
            samples.push(String(ans.value).trim());
            if (samples.length >= 5) break;
          }
        }
        textSamples[fieldId] = samples;
      }
    }

    // --- Build byField map ---
    const byField: Record<string, any> = {};

    for (const field of fields) {
      if (SKIP_TYPES.includes(field.type)) continue;

      if (CHOICE_TYPES.includes(field.type)) {
        const counts: Record<string, number> = {};
        for (const c of scalarCounts) {
          if (c._id.fieldId === field.id) counts[c._id.value] = c.count;
        }
        byField[field.id] = { type: field.type, label: field.label, counts };

      } else if (field.type === 'checkbox') {
        const counts: Record<string, number> = {};
        for (const c of checkboxCounts) {
          if (c._id.fieldId === field.id) counts[c._id.value] = c.count;
        }
        byField[field.id] = { type: 'checkbox', label: field.label, counts };

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
        byField[field.id] = {
          type: field.type,
          label: field.label,
          counts,
          average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
        };

      } else if (field.type === 'number') {
        const stat = numberStats.find(n => n._id === field.id);
        byField[field.id] = {
          type: 'number',
          label: field.label,
          average: stat ? Math.round(stat.average * 10) / 10 : 0,
          min: stat?.min ?? 0,
          max: stat?.max ?? 0,
        };

      } else if (TEXT_TYPES.includes(field.type)) {
        byField[field.id] = {
          type: field.type,
          label: field.label,
          samples: textSamples[field.id] || [],
        };
      }
    }

    // Include ordered field list (for client rendering order + options)
    const orderedFields = fields
      .filter(f => !SKIP_TYPES.includes(f.type))
      .map(f => ({ id: f.id, type: f.type, label: f.label, options: f.options || [] }));

    return NextResponse.json({
      success: true,
      data: {
        totalResponses,
        avgDurationMs: Math.round(avgDurationMs),
        formType: form.type,
        fields: orderedFields,
        byField,
      },
    });
  } catch (err: any) {
    console.error('[analytics] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
