import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin logout attempt started');
    
    // Get admin session to log the activity
    const adminSession = await AdminAuth.getAdminSession(request);
    
    if (adminSession) {
      // Log logout activity
      await AdminAuth.logActivity(
        adminSession.id,
        'logout',
        'admin_dashboard',
        { ipAddress: request.headers.get('x-forwarded-for') || 'unknown' }
      );
      
      console.log('✅ Logout activity logged for:', adminSession.email);
    }

    console.log('✅ Admin logout successful');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Admin logout error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 