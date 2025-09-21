import { NextRequest, NextResponse } from 'next/server';
import { getFormModel } from '@/models/FormModel';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const Form = await getFormModel();
    const { id } = await params;
    // Find form by slug or valid ObjectId
    let form = await Form.findOne({ slug: id }).lean();
    if (!form) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        form = await Form.findById(new mongoose.Types.ObjectId(id)).lean();
      }
    }
    if (!form) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (form.status !== 'published') {
      return NextResponse.json({ success: false, error: 'Form is not published' }, { status: 403 });
    }

    const now = new Date();
    if (form.settings?.startAt && new Date(form.settings.startAt) > now) {
      return NextResponse.json({ success: false, error: 'Form is not yet available' }, { status: 403 });
    }
    if (form.settings?.endAt && new Date(form.settings.endAt) < now) {
      return NextResponse.json({ success: false, error: 'Form has expired' }, { status: 403 });
    }

    // Remove internal fields and return public schema
    const publicFields = (form.fields || []).filter((f: any) => f.visibility !== 'internal');

    return NextResponse.json({
      success: true,
      data: {
        id: String(form._id),
        slug: form.slug,
        title: form.title,
        description: form.description,
        type: form.type,
        fields: publicFields,
        settings: {
          identitySchema: form.settings?.identitySchema || {},
          timer: form.settings?.timer || { enabled: false, minutes: 0 },
          startAt: form.settings?.startAt || null,
          endAt: form.settings?.endAt || null,
          allowAnonymous: !!form.settings?.allowAnonymous,
        },
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch schema' }, { status: 500 });
  }
}


