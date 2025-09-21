import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import mongoose from 'mongoose';
import { createUniqueRandomSlug } from '@/lib/slugUtils';

function ensureOwner(claims: any, form: any) {
  return claims?.id && String(form.ownerId) === String(claims.id);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const Form = await getFormModel();
    const form = mongoose.Types.ObjectId.isValid(id)
      ? await Form.findById(new mongoose.Types.ObjectId(id)).lean()
      : null;
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (!ensureOwner(claims, form)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: true, data: form });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to get form' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id } = await params;
    const Form = await getFormModel();
    const form = mongoose.Types.ObjectId.isValid(id)
      ? await Form.findById(new mongoose.Types.ObjectId(id))
      : null;
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (!ensureOwner(claims, form)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // If title changes, do not change slug (immutable). Only update title.
    if (body.title !== undefined && body.title !== form.title) {
      form.title = body.title;
    }
    
    if (body.description !== undefined) form.description = body.description;
    if (body.type !== undefined) form.type = body.type;
    if (body.fields !== undefined) form.fields = body.fields;
    
    // Slug is immutable; ignore explicit slug updates
    if (body.settings !== undefined) {
      form.settings = {
        ...form.settings,
        ...body.settings,
        timer: {
          enabled: !!body.settings?.timer?.enabled,
          minutes: Number(body.settings?.timer?.minutes || 0),
        },
        startAt: body.settings?.startAt ? new Date(body.settings.startAt) : undefined,
        endAt: body.settings?.endAt ? new Date(body.settings.endAt) : undefined,
      } as any;
    }
    if (body.submissionPolicy !== undefined) form.submissionPolicy = body.submissionPolicy;
    if (body.status !== undefined) form.status = body.status;
    await form.save();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const Form = await getFormModel();
    const form = mongoose.Types.ObjectId.isValid(id)
      ? await Form.findById(new mongoose.Types.ObjectId(id))
      : null;
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (!ensureOwner(claims, form)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // If already archived, perform hard delete. Otherwise, soft-delete by archiving.
    if (form.status === 'archived') {
      await form.deleteOne();
      return NextResponse.json({ success: true, data: { deleted: true, mode: 'hard' } });
    }

    form.status = 'archived';
    await form.save();
    return NextResponse.json({ success: true, data: { deleted: true, mode: 'soft' } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to delete form' }, { status: 500 });
  }
}


