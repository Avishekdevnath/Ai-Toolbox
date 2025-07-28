import { NextRequest, NextResponse } from 'next/server';
import { checkSystemHealth, getConfigurationReport } from '@/lib/configValidator';

/**
 * GET /api/system/health
 * 
 * Returns comprehensive system health information including:
 * - Overall system status
 * - Individual service health (database, AI, auth, config)
 * - Configuration validation results
 * - Recommendations for improvement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    
    // Get system health
    const health = await checkSystemHealth();
    
    // Get detailed configuration report if requested
    const configReport = detailed ? getConfigurationReport() : null;
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      health,
      ...(configReport && { config: configReport }),
    };
    
    // Return appropriate HTTP status based on health
    const statusCode = health.overall === 'critical' ? 503 : 
                      health.overall === 'warning' ? 200 : 200;
    
    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    console.error('System health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to check system health',
      details: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/system/health
 * 
 * Triggers a fresh health check and returns results
 * Useful for monitoring systems to verify application health
 */
export async function POST(request: NextRequest) {
  try {
    // Force a fresh health check
    const health = await checkSystemHealth();
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      health,
      message: 'Health check completed successfully',
    };
    
    // Return appropriate HTTP status based on health
    const statusCode = health.overall === 'critical' ? 503 : 
                      health.overall === 'warning' ? 200 : 200;
    
    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    console.error('System health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform health check',
      details: error.message,
    }, { status: 500 });
  }
} 