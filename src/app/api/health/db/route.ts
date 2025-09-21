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