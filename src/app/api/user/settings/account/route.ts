import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Account deletion validation schema
const AccountDeletionSchema = z.object({
  confirmDeletion: z.boolean().refine(val => val === true, {
    message: 'You must confirm account deletion'
  }),
  deleteReason: z.string().optional(),
  exportData: z.boolean().default(true)
});

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
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
    const validatedData = AccountDeletionSchema.parse(body);
    
    if (!validatedData.confirmDeletion) {
      return NextResponse.json(
        { success: false, error: 'Account deletion must be confirmed' },
        { status: 400 }
      );
    }
    
    // Export user data if requested
    let exportedData = null;
    if (validatedData.exportData) {
      try {
        const settings = await UserSettings.getUserSettings(claims.id);
        const analyses = await UserAnalysisHistory.exportUserData(claims.id);
        
        exportedData = {
          exportDate: new Date().toISOString(),
          userId: claims.id,
          settings,
          analyses,
          deletionReason: validatedData.deleteReason,
          metadata: {
            totalAnalyses: analyses.length,
            exportFormat: 'json'
          }
        };
      } catch (error) {
        console.error('Error exporting data before deletion:', error);
        // Continue with deletion even if export fails
      }
    }
    
    // Delete user data
    const deletionResults = await Promise.allSettled([
      UserSettings.deleteUserSettings(claims.id),
      UserAnalysisHistory.deleteMany({ userId: claims.id })
    ]);
    
    // Check deletion results
    const settingsDeleted = deletionResults[0].status === 'fulfilled';
    const analysesDeleted = deletionResults[1].status === 'fulfilled';
    
    if (!settingsDeleted && !analysesDeleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user data' },
        { status: 500 }
      );
    }
    
    // Log the deletion for audit purposes
    console.log(`User account deleted: ${claims.id}`, {
      timestamp: new Date().toISOString(),
      userId: claims.id,
      deletionReason: validatedData.deleteReason,
      settingsDeleted,
      analysesDeleted,
      dataExported: !!exportedData
    });
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      data: {
        settingsDeleted,
        analysesDeleted,
        exportedData: exportedData ? 'Data exported before deletion' : 'No data exported'
      }
    });

  } catch (error: any) {
    console.error('Error deleting user account:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid deletion request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 