import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    // Create a new usage record that matches the ToolUsage model schema
    await mongoose.connection.db.collection('toolusages').insertOne({
      userId: 'anonymous',
      toolSlug: 'mock-interviewer',
      toolName: 'Mock Interviewer',
      usageType: 'generate',
      metadata: {
        action: 'conduct_mock_interview',
        timestamp: new Date()
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 