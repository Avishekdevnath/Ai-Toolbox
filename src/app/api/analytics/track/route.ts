import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ToolUsage } from '@/models/ToolUsageModel';

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { userId, toolSlug, toolName, eventType, source, category, metadata } = body;

    if (!toolSlug || !toolName || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create tool usage record
    const toolUsage = new ToolUsage({
      userId: userId || 'anonymous',
      toolSlug,
      toolName,
      eventType,
      source: source || 'unknown',
      category: category || 'general',
      metadata: metadata || {},
      timestamp: new Date()
    });

    await toolUsage.save();

    return NextResponse.json({
      success: true,
      data: { id: toolUsage._id }
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
} 