import { NextRequest, NextResponse } from 'next/server';
import { getContactSettingsModel } from '@/models/ContactSettingsModel';
import { AdminAuthService } from '@/lib/adminAuthService';

export async function GET() {
  const Model = await getContactSettingsModel();
  const doc = await Model.findOne({}).lean();
  return NextResponse.json({ success: true, data: doc || {} });
}

export async function PUT(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const Model = await getContactSettingsModel();
    const doc = await Model.findOneAndUpdate({}, body, { upsert: true, new: true });
    return NextResponse.json({ success: true, data: doc });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}


