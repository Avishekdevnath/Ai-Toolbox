import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ToolUsage } from '@/models/ToolUsageModel';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing tool slug' }, { status: 400 });
  }
  
  try {
    const db = await getDatabase();
    
    // Get user ID from JWT token
    const token = req.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id || 'anonymous';
    
    // Get usage type from request body
    const body = await req.json().catch(() => ({}));
    const usageType = body.usageType || 'view';
    // Fallback to userId provided by client if JWT is not available
    const effectiveUserId = userId || body.userId || 'anonymous';
    
    // Create ToolUsage record for analytics
    const toolName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const toolUsage = new ToolUsage({
      userId: effectiveUserId,
      toolSlug: slug,
      toolName,
      usageType: usageType as 'view' | 'generate' | 'download' | 'share',
      metadata: { source: 'web' },
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });
    
    await toolUsage.save();
    
    // Also update legacy tools collection for backward compatibility
    let existingTool = await db.collection('tools').findOne({ slug });
    
    if (existingTool) {
      await db.collection('tools').updateOne(
        { slug },
        { $inc: { usage: 1 } }
      );
    } else {
      const newTool = {
        name: toolName,
        slug: slug,
        usage: 1,
        createdAt: new Date()
      };
      await db.collection('tools').insertOne(newTool);
    }
    
    return NextResponse.json({ success: true, usage: (existingTool?.usage || 0) + 1 });
  } catch (e) {
    console.error('Usage tracking error:', e);
    // Don't fail the main request if usage tracking fails
    return NextResponse.json({ success: true, usage: 0 });
  }
} 