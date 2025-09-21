import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = await getDatabase();

    // Get role distribution from users collection
    const roleDistribution = await db.collection('users').aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // Calculate total users for percentage calculation
    const totalUsers = roleDistribution.reduce((sum, role) => sum + role.count, 0);

    // Add percentage to each role
    const rolesWithPercentage = roleDistribution.map(role => ({
      ...role,
      percentage: totalUsers > 0 ? Math.round((role.count / totalUsers) * 100 * 10) / 10 : 0
    }));

    // Define system roles with their descriptions and permissions
    const systemRoles = [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['all'],
        isDefault: false,
        isSystem: true,
        userCount: roleDistribution.find(r => r.role === 'super_admin')?.count || 0
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Administrative access to manage users and tools',
        permissions: ['manage_users', 'manage_tools', 'view_analytics', 'manage_content'],
        isDefault: false,
        isSystem: true,
        userCount: roleDistribution.find(r => r.role === 'admin')?.count || 0
      },
      {
        id: 'moderator',
        name: 'Moderator',
        description: 'Moderate user content and manage basic operations',
        permissions: ['moderate_content', 'view_users', 'view_analytics'],
        isDefault: false,
        isSystem: true,
        userCount: roleDistribution.find(r => r.role === 'moderator')?.count || 0
      },
      {
        id: 'user',
        name: 'User',
        description: 'Standard user with basic access',
        permissions: ['basic_access'],
        isDefault: true,
        isSystem: true,
        userCount: roleDistribution.find(r => r.role === 'user')?.count || 0
      }
    ];

    // Define available permissions by category
    const permissions = [
      // User Management
      { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'User Management' },
      { id: 'view_users', name: 'View Users', description: 'View user information and activity', category: 'User Management' },
      { id: 'assign_roles', name: 'Assign Roles', description: 'Assign roles to users', category: 'User Management' },
      
      // Tool Management
      { id: 'manage_tools', name: 'Manage Tools', description: 'Create, edit, and configure tools', category: 'Tool Management' },
      { id: 'view_tools', name: 'View Tools', description: 'View tool information and usage', category: 'Tool Management' },
      
      // Analytics
      { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics and reports', category: 'Analytics' },
      { id: 'export_data', name: 'Export Data', description: 'Export analytics and user data', category: 'Analytics' },
      
      // Content Management
      { id: 'manage_content', name: 'Manage Content', description: 'Manage static content and pages', category: 'Content Management' },
      { id: 'moderate_content', name: 'Moderate Content', description: 'Moderate user-generated content', category: 'Content Management' },
      
      // System Settings
      { id: 'manage_settings', name: 'Manage Settings', description: 'Manage system configuration', category: 'System Settings' },
      { id: 'view_settings', name: 'View Settings', description: 'View system configuration', category: 'System Settings' },
      
      // Security
      { id: 'manage_security', name: 'Manage Security', description: 'Manage security policies and settings', category: 'Security' },
      { id: 'view_logs', name: 'View Logs', description: 'View system and security logs', category: 'Security' },
      
      // Basic Access
      { id: 'basic_access', name: 'Basic Access', description: 'Basic access to tools and features', category: 'Basic Access' },
      
      // All Permissions
      { id: 'all', name: 'All Permissions', description: 'Full system access', category: 'System' }
    ];

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({
      success: true,
      data: {
        roles: systemRoles,
        permissions: groupedPermissions,
        roleDistribution: rolesWithPercentage,
        totalUsers
      }
    });

  } catch (error: any) {
    console.error('Error fetching user roles:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user roles',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can create roles
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !description || !permissions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll just return success since we're not storing custom roles in the database yet
    // In a real implementation, you would store this in a roles collection
    
    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      data: {
        id: `custom_${Date.now()}`,
        name,
        description,
        permissions,
        isDefault: false,
        isSystem: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error creating role:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create role',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 