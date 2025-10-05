import { NextRequest, NextResponse } from 'next/server';
import { getContactMessageModel } from '@/models/ContactMessageModel';
import { AdminAuthService } from '@/lib/adminAuthService';

// POST: public can create a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body || {};
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const Model = await getContactMessageModel();
    const doc = await Model.create({ name, email, phone, subject, message, status: 'new' });
    return NextResponse.json({ success: true, data: { id: doc._id } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to submit message' }, { status: 500 });
  }
}

// GET: admin list messages
export async function GET(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const Model = await getContactMessageModel();
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const query: any = {};
  if (status) query.status = status;
  const items = await Model.find(query).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ success: true, data: items });
}

// PATCH: admin update message status
export async function PATCH(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { id, status } = body || {};
    if (!id || !status) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    const Model = await getContactMessageModel();
    await Model.findByIdAndUpdate(id, { status });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}


