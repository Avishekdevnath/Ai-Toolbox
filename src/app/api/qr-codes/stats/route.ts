import { NextRequest, NextResponse } from 'next/server';
import { QRCodeModel } from '@/models/QRCodeModel';
import { verifyAccessToken } from '@/lib/auth/jwt';

// GET /api/qr-codes/stats - Get QR code statistics
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await QRCodeModel.getStats(claims.id);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching QR code stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code statistics' },
      { status: 500 }
    );
  }
}
