import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { sendPasswordChangeConfirmation } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reset token and new password are required' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    console.log('🔐 Reset password request for token:', token);

    const db = await getDatabase();
    
    // Find valid reset token
    const tokenRecord = await db.collection('password_reset_tokens').findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenRecord) {
      console.log('🔐 Invalid or expired reset token');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    console.log('🔐 Valid reset token found, updating password for user:', tokenRecord.email);

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    const result = await db.collection('authusers').updateOne(
      { _id: tokenRecord.userId },
      { 
        $set: { 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('🔐 User not found for password update');
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('🔐 Password updated successfully for user:', tokenRecord.email);

    // Mark token as used
    await db.collection('password_reset_tokens').updateOne(
      { _id: tokenRecord._id },
      { $set: { used: true, usedAt: new Date() } }
    );

    // Clean up expired tokens
    await db.collection('password_reset_tokens').deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { used: true }
      ]
    });

    // Send password change confirmation email
    try {
      const user = await db.collection('authusers').findOne({ 
        _id: tokenRecord.userId 
      });
      if (user) {
        await sendPasswordChangeConfirmation(
          user.email, 
          user.firstName || user.username || 'User'
        );
        console.log('✅ Password change confirmation email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('❌ Failed to send password change confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
