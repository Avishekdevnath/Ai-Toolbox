import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has service management permission
    if (!AdminAuth.hasPermission(adminSession, 'manage_services')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get all tools with their usage statistics
    const tools = await db.collection('tools').find({}).toArray();

    // Get usage statistics for each tool
    const toolsWithStats = await Promise.all(
      tools.map(async (tool) => {
        const usageCount = await db.collection('toolusage')
          .countDocuments({ toolSlug: tool.slug });
        
        const successCount = await db.collection('toolusage')
          .countDocuments({ 
            toolSlug: tool.slug, 
            status: 'success' 
          });
        
        const avgResponseTime = await db.collection('toolusage')
          .aggregate([
            { $match: { toolSlug: tool.slug } },
            { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
          ]).toArray();

        return {
          _id: tool._id,
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          status: tool.status || 'active',
          usage: usageCount,
          successRate: usageCount > 0 ? successCount / usageCount : 0,
          avgResponseTime: avgResponseTime[0]?.avgTime || 0,
          lastUpdated: tool.updatedAt || tool.createdAt,
          config: tool.config || {}
        };
      })
    );

    return NextResponse.json({
      success: true,
      tools: toolsWithStats
    });

  } catch (error) {
    console.error('Tools fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
} 