import { NextRequest, NextResponse } from 'next/server';
import { QRCodeModel } from '@/models/QRCodeModel';
import { verifyAccessToken } from '@/lib/auth/jwt';

// GET /api/qr-codes/[id]/analytics - Get detailed analytics for a QR code
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await QRCodeModel.findById(params.id);
    
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Check if user owns this QR code
    if (qrCode.userId !== claims.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const analytics = await QRCodeModel.getAnalytics(params.id);
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching QR code analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code analytics' },
      { status: 500 }
    );
  }
}
