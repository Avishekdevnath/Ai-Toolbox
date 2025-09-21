import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { RoleService } from '@/lib/roleService';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role from database
    const userRole = await RoleService.getUserRole(userId);
    
    if (!userRole || !userRole.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Convert to admin user format
    const adminUser = {
      id: userId,
      email: userRole.email,
      role: userRole.role,
      permissions: {
        canManageUsers: userRole.permissions.includes('manage_users'),
        canManageTools: userRole.permissions.includes('manage_tools'),
        canViewAnalytics: userRole.permissions.includes('view_analytics'),
        canManageSystem: userRole.permissions.includes('manage_system'),
        canManageContent: userRole.permissions.includes('manage_content'),
        canViewAuditLogs: userRole.permissions.includes('view_audit_logs'),
        canManageAdmins: userRole.permissions.includes('manage_admins'),
      },
      isActive: userRole.isActive,
      lastLoginAt: userRole.lastLoginAt,
      createdAt: userRole.createdAt,
      updatedAt: userRole.updatedAt,
    };

    return NextResponse.json({
      success: true,
      userRole: adminUser,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching user role:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user role',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 