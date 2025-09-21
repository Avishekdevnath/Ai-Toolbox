import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { sendPasswordChangeConfirmation } from '../../../../../lib/emailService';

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

    const { newPassword, otpCode } = await request.json();
    if (!newPassword || !otpCode) {
      return NextResponse.json({ success: false, error: 'New password and OTP code are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Verify OTP is still valid and not used
    const otpRecord = await db.collection('password_reset_otps').findOne({
      userId: new ObjectId(claims.id),
      otpCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log('🔐 Updating password for user:', claims.id);
    console.log('🔐 New password hash generated');

    // Update user password
    const result = await db.collection('authusers').updateOne(
      { _id: new ObjectId(claims.id) },
      { 
        $set: { 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    console.log('🔐 Password update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Mark OTP as used
    await db.collection('password_reset_otps').updateOne(
      { _id: otpRecord._id },
      { $set: { used: true, usedAt: new Date() } }
    );

    // Clean up expired OTPs for this user
    await db.collection('password_reset_otps').deleteMany({
      userId: new ObjectId(claims.id),
      $or: [
        { expiresAt: { $lt: new Date() } },
        { used: true }
      ]
    });

    // Send password change confirmation email
    try {
      const user = await db.collection('authusers').findOne({ _id: new ObjectId(claims.id) });
      if (user) {
        await sendPasswordChangeConfirmation(user.email, user.firstName || user.username || 'User');
      }
    } catch (emailError) {
      console.error('Failed to send password change confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
