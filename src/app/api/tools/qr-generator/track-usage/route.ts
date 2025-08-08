import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getEnhancedUserId } from '@/lib/userTracking';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const userId = getEnhancedUserId(request);
    
    // Create a new usage record that matches the ToolUsage model schema
    await mongoose.connection.db.collection('toolusages').insertOne({
      userId: userId,
      toolSlug: 'qr-generator',
      toolName: 'QR Code Generator',
      usageType: 'generate',
      metadata: {
        action: 'generate_qr',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        userAgent: request.headers.get('user-agent') || ''
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 