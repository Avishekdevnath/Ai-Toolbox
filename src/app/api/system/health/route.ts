import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Test basic operations
    const collections = await db.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      collections: collectionNames,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/system/health
 * Trigger system maintenance tasks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'cleanup':
        // Import cleanup function
        const { cleanupOldData } = await import('@/lib/databaseInit');
        const cleanupResult = await cleanupOldData();
        
        return NextResponse.json({
          success: true,
          message: 'Data cleanup completed',
          data: cleanupResult,
        });

      case 'sync':
        // Trigger user sync (this would typically be done by middleware)
        return NextResponse.json({
          success: true,
          message: 'User sync is handled automatically by middleware',
        });

      case 'stats':
        // Refresh statistics
        const stats = await getFullStats();
        
        return NextResponse.json({
          success: true,
          message: 'Statistics refreshed',
          data: stats,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['cleanup', 'sync', 'stats'],
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ System maintenance failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'System maintenance failed',
      details: error.message,
    }, { status: 500 });
  }
} 