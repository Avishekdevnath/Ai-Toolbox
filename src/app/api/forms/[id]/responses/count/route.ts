import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { connectWithRetry } from '@/lib/mongodb';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectWithRetry(3, 1000);

    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();

    const formObjectId = new mongoose.Types.ObjectId(id);
    const form = await Form.findById(formObjectId).select({ _id: 1, ownerId: 1 }).lean();
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (String(form.ownerId) !== String(claims.id)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const count = await FormResponse.countDocuments({ formId: formObjectId });
    return NextResponse.json({ success: true, data: { formId: id, count } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to count responses' }, { status: 500 });
  }
}


