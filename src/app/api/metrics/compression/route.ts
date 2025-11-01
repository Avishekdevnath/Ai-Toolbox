import { NextRequest, NextResponse } from 'next/server';
import { compressionMonitor, formatBytes } from '@/lib/compressionMonitor';

/**
 * GET /api/metrics/compression
 * Get compression statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = compressionMonitor.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalResponses: stats.totalResponses,
          averageCompressionRatio: `${stats.averageCompressionRatio}%`,
          averageOriginalSize: formatBytes(stats.averageOriginalSize),
          averageCompressedSize: formatBytes(stats.averageCompressedSize),
          totalBytesSaved: formatBytes(stats.totalBytesSaved),
          bandwidthReduction: `${stats.averageCompressionRatio}%`,
        },
        encodingDistribution: stats.encodingDistribution,
        byEndpoint: stats.byEndpoint,
        raw: {
          averageOriginalSizeBytes: stats.averageOriginalSize,
          averageCompressedSizeBytes: stats.averageCompressedSize,
          totalBytesSaved: stats.totalBytesSaved,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Failed to get compression metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve compression metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics/compression
 * Clear compression metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear') {
      compressionMonitor.clearMetrics();
      return NextResponse.json({
        success: true,
        message: 'Compression metrics cleared',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        validActions: ['clear'],
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('❌ Failed to perform action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

