import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reset token is required' 
      }, { status: 400 });
    }

    console.log('🔐 Verifying reset token:', token);

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

    console.log('🔐 Valid reset token found for user:', tokenRecord.email);

    // Get user details
    const user = await db.collection('authusers').findOne({ 
      _id: tokenRecord.userId 
    });

    if (!user) {
      console.log('🔐 User not found for token');
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reset token is valid',
      user: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
