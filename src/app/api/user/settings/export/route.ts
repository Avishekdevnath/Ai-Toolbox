import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Export request validation schema
const ExportRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeAnalyses: z.boolean().default(true),
  includeSettings: z.boolean().default(true),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

// POST - Export user data
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = ExportRequestSchema.parse(body);
    
    // Get user settings
    const settings = await UserSettings.getUserSettings(claims.id);
    
    // Get user analysis history if requested
    let analyses: any[] = [];
    if (validatedData.includeAnalyses) {
      try {
        analyses = await UserAnalysisHistory.exportUserData(claims.id);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        // Continue without analysis data
      }
    }
    
    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: claims.id,
      settings: validatedData.includeSettings ? settings : null,
      analyses: validatedData.includeAnalyses ? analyses : null,
      metadata: {
        totalAnalyses: analyses.length,
        exportFormat: validatedData.format,
        dateRange: validatedData.dateRange
      }
    };
    
    // Handle different export formats
    switch (validatedData.format) {
      case 'json':
        return NextResponse.json({
          success: true,
          data: exportData,
          message: 'Data exported successfully'
        });
        
      case 'csv':
        // Convert to CSV format
        const csvData = convertToCSV(exportData);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="user-data-${claims.id}-${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
        
      case 'pdf':
        // For PDF, we'll return a JSON response with instructions
        // In a real implementation, you'd generate a PDF file
        return NextResponse.json({
          success: true,
          data: exportData,
          message: 'PDF export requested - file generation in progress',
          note: 'PDF generation would be implemented with a library like puppeteer or jsPDF'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported export format' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Error exporting user data:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid export request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}

// Helper function to convert data to CSV format
function convertToCSV(data: any): string {
  const headers = ['Type', 'Field', 'Value'];
  const rows: any[] = [];
  
  // Add settings data
  if (data.settings) {
    rows.push(['Settings', 'Profile Display Name', data.settings.profile?.displayName || '']);
    rows.push(['Settings', 'Profile Bio', data.settings.profile?.bio || '']);
    rows.push(['Settings', 'Theme', data.settings.application?.theme || '']);
    rows.push(['Settings', 'Language', data.settings.profile?.language || '']);
    rows.push(['Settings', 'Timezone', data.settings.profile?.timezone || '']);
  }
  
  // Add analysis data
  if (data.analyses && Array.isArray(data.analyses)) {
    data.analyses.forEach((analysis: any, index: number) => {
      rows.push(['Analysis', `Analysis ${index + 1} - Type`, analysis.analysisType || '']);
      rows.push(['Analysis', `Analysis ${index + 1} - Tool`, analysis.toolName || '']);
      rows.push(['Analysis', `Analysis ${index + 1} - Created`, analysis.createdAt || '']);
      rows.push(['Analysis', `Analysis ${index + 1} - Status`, analysis.status || '']);
    });
  }
  
  // Convert to CSV format
  const csvContent = [headers, ...rows]
    .map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csvContent;
} 