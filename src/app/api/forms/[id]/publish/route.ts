import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { publish } = await request.json();
    const { id } = await params;
    const Form = await getFormModel();
    const form = await Form.findById(new mongoose.Types.ObjectId(id));
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (String(form.ownerId) !== String(claims.id)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    form.status = publish ? 'published' : 'draft';
    await form.save();
    return NextResponse.json({ success: true, status: form.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to publish toggle' }, { status: 500 });
  }
}


