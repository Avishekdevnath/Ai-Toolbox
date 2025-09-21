import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const claims = verifyAccessToken(token);
    if (!claims) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { otpCode } = await request.json();
    if (!otpCode) {
      return NextResponse.json({ success: false, error: 'OTP code is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    console.log('🔐 Verifying OTP for user:', claims.id);
    console.log('🔐 OTP code provided:', otpCode);
    
    // Find valid OTP
    const otpRecord = await db.collection('password_reset_otps').findOne({
      userId: new ObjectId(claims.id),
      otpCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    console.log('🔐 OTP record found:', !!otpRecord);
    if (otpRecord) {
      console.log('🔐 OTP details:', {
        userId: otpRecord.userId,
        otpCode: otpRecord.otpCode,
        used: otpRecord.used,
        expiresAt: otpRecord.expiresAt
      });
    }

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Don't mark as used yet - only verify it's valid
    // It will be marked as used when password is actually updated
    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
