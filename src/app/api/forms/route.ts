import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getFormModel } from '@/models/FormModel';
import { getFormResponseModel } from '@/models/FormResponseModel';
import mongoose from 'mongoose';
import { countResponsesByFormIds } from '@/lib/forms-utils';
import { createUniqueRandomSlug } from '@/lib/slugUtils';
import { connectWithRetry } from '@/lib/mongodb';

// POST: create form
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();

    // Title is stored but slug is now a unique random string
    const title = body.title || 'Untitled Form';
    const slug = await createUniqueRandomSlug(async (s) => {
      const exists = await Form.exists({ slug: s });
      return !!exists;
    });

    // Normalize settings (timer, dates)
    const inputSettings = body.settings || {};
    const timerEnabled = !!inputSettings?.timer?.enabled;
    const normalizedSettings: any = {
      ...inputSettings,
      timer: {
        enabled: timerEnabled,
        minutes: timerEnabled ? Math.max(1, Math.min(480, Number(inputSettings?.timer?.minutes || 0))) : 0,
      },
      startAt: inputSettings?.startAt ? new Date(inputSettings.startAt) : undefined,
      endAt: inputSettings?.endAt ? new Date(inputSettings.endAt) : undefined,
    };

    const doc = await Form.create({
      ownerId: claims.id,
      title,
      description: body.description || '',
      type: body.type || 'general',
      slug,
      fields: body.fields || [],
      settings: normalizedSettings,
      submissionPolicy: body.submissionPolicy || {},
      status: body.status === 'published' ? 'published' : 'draft',
    });
    return NextResponse.json({ success: true, data: { id: String(doc._id), slug: doc.slug } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to create form' }, { status: 500 });
  }
}

// GET: list forms for owner
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Try to connect with retry mechanism
    try {
      await connectWithRetry(3, 1000);
    } catch (connectionError) {
      console.error('MongoDB connection failed after retries:', connectionError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed. Please try again later.',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const q = searchParams.get('q') || '';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const Form = await getFormModel();
    const FormResponse = await getFormResponseModel();
    const query: any = { ownerId: claims.id };
    if (status) query.status = status;
    if (type) query.type = type;
    if (q) query.title = { $regex: q, $options: 'i' };

    const [items, total] = await Promise.all([
      Form.find(query).sort({ updatedAt: -1 }).skip(offset).limit(limit).lean(),
      Form.countDocuments(query),
    ]);

    // Forms fetched; counts computed below

    // Compute response counts for the fetched forms using helper
    let itemsWithCounts = items as any[];
    try {
      const formIds = items.map((f: any) => String(f._id));
      const idToCount = await countResponsesByFormIds(FormResponse, formIds);
      itemsWithCounts = items.map((f: any) => ({ ...f, responseCount: idToCount.get(String(f._id)) || 0 }));
    } catch (aggErr) {
      console.warn('Forms GET: response count aggregation failed:', aggErr);
      itemsWithCounts = items.map((f: any) => ({ ...f, responseCount: 0 }));
    }

    return NextResponse.json({ success: true, data: { items: itemsWithCounts, total, limit, offset } });
  } catch (e: any) {
    console.error('Forms API error:', e);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to list forms';
    if (e.message?.includes('MongoDB server not found')) {
      errorMessage = 'Database server is currently unavailable. Please try again later.';
    } else if (e.message?.includes('timeout')) {
      errorMessage = 'Database request timed out. Please try again.';
    } else if (e.message?.includes('authentication')) {
      errorMessage = 'Database authentication failed. Please contact support.';
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: e.message || 'Unknown error'
    }, { status: 500 });
  }
}


