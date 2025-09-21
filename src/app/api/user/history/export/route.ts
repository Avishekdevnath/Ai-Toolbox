import { NextRequest, NextResponse } from 'next/server';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;

    if (!claims?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const analyses = await UserAnalysisHistory.exportUserData(claims.id, format as 'json' | 'csv');

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Date', 'Tool', 'Type', 'Status', 'Processing Time (ms)', 'Input Data', 'Result'];
      const csvRows = analyses.map((analysis: any) => [
        new Date(analysis.createdAt).toISOString(),
        analysis.toolName,
        analysis.analysisType,
        analysis.status,
        analysis.metadata.processingTime,
        JSON.stringify(analysis.inputData),
        JSON.stringify(analysis.result)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analysis-history-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: analyses,
      exportDate: new Date().toISOString(),
      totalRecords: analyses.length
    });

  } catch (error: any) {
    console.error('Error exporting user history:', error);
    return NextResponse.json(
      { error: 'Failed to export history' },
      { status: 500 }
    );
  }
} 