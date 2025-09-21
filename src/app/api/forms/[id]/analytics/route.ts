import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();
    const form = await Form.findById(new mongoose.Types.ObjectId(id)).lean();
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (String(form.ownerId) !== String(claims.id)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const total = await FormResponse.countDocuments({ formId: form._id });
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const byDay = await FormResponse.aggregate([
      { $match: { formId: form._id, submittedAt: { $gte: last30 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Per-field distribution for choice fields
    const distributions: Record<string, Record<string, number>> = {};
    const choiceFieldIds = (form.fields || []).filter((f: any) => ['dropdown', 'radio', 'checkbox'].includes(f.type)).map((f: any) => f.id);
    if (choiceFieldIds.length) {
      const cursor = await FormResponse.find({ formId: form._id }).select('answers').lean();
      for (const r of cursor) {
        for (const a of (r.answers || [])) {
          if (!choiceFieldIds.includes(a.fieldId)) continue;
          const key = a.fieldId;
          const val = Array.isArray(a.value) ? a.value : [a.value];
          distributions[key] = distributions[key] || {};
          for (const v of val) {
            const s = String(v ?? '');
            distributions[key][s] = (distributions[key][s] || 0) + 1;
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: { total, byDay, distributions } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to get analytics' }, { status: 500 });
  }
}


