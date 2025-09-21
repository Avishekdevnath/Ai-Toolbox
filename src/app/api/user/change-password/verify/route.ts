import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getDatabase } from '../../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendOTP } from '../../../../../lib/emailService';
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

    const { currentPassword } = await request.json();
    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const user = await db.collection('authusers').findOne({ _id: new ObjectId(claims.id) });
    
    console.log('🔐 User found for password change:', !!user);
    if (user) {
      console.log('🔐 User details:', {
        id: user._id,
        email: user.email,
        username: user.username,
        hasPasswordHash: !!user.passwordHash
      });
    }
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    console.log('🔐 Verifying current password...');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    console.log('🔐 Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    // Generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.collection('password_reset_otps').insertOne({
      userId: new ObjectId(claims.id),
      email: user.email,
      otpCode,
      expiresAt: otpExpiry,
      createdAt: new Date(),
      used: false
    });

    // Send OTP via email
    try {
      await sendOTP(user.email, otpCode, 'Password Change Verification');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
