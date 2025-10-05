import { NextRequest, NextResponse } from 'next/server';
import { getContactMessageModel } from '@/models/ContactMessageModel';
import { AdminAuthService } from '@/lib/adminAuthService';

// GET: admin list contact collection data
export async function GET(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  
  try {
    const Model = await getContactMessageModel();
    
    // Get all contact messages as collection data
    const messages = await Model.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    
    // Transform messages to collection format
    const submissions = messages.map(msg => ({
      _id: msg._id.toString(),
      name: msg.name,
      email: msg.email,
      phone: '', // Contact messages don't have phone
      source: 'contact_form' as const,
      submittedAt: msg.createdAt.toISOString(),
      metadata: {
        userAgent: 'Unknown',
        ipAddress: 'Unknown',
        referrer: 'Contact Form'
      }
    }));
    
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching contact collection:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch collection data' }, { status: 500 });
  }
}