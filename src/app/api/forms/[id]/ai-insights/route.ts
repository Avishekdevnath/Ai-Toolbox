import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const responses = await FormResponse.find({ formId: form._id }).limit(200).lean();

    // Placeholder AI summary (hook up to provider later)
    const total = responses.length;
    const sample = responses.slice(0, 3).map((r) => ({ submittedAt: r.submittedAt, answersCount: (r.answers || []).length }));
    const summary = `Total responses: ${total}. Sample: ${JSON.stringify(sample)}.`;

    return NextResponse.json({ success: true, data: { summary } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to get AI insights' }, { status: 500 });
  }
}


