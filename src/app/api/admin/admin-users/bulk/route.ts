import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser } from '@/models/AdminUserModel';
import { AdminVerificationService } from '@/lib/adminVerificationService';
import { ObjectId } from 'mongodb';

// POST - Bulk operations on admin users
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Bulk admin operation called');
    
    // Verify admin session
    const session = await AdminVerificationService.getAdminSession(request);
    if (!session.success || !session.session) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Admin session verified:', session.session.email);

    // Check permissions
    if (!AdminVerificationService.canManageAdmins(session.session)) {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();
    console.log('✅ Database connected');

    const body = await request.json();
    const { action, adminIds, role, permissions, reason } = body;

    console.log('🔍 Bulk operation:', { action, adminIds: adminIds?.length, role, permissions });

    // Validate all admin IDs
    const validAdminIds = adminIds.filter((id: string) => ObjectId.isValid(id));
    if (validAdminIds.length !== adminIds.length) {
      console.log('❌ Invalid admin ID provided');
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID provided' },
        { status: 400 }
      );
    }

    let affectedCount = 0;
    let operationDetails: any = {};

    switch (action) {
      case 'activate':
        const activateResult = await AdminUser.updateMany(
          { 
            _id: { $in: validAdminIds },
            _id: { $ne: new ObjectId(session.session.id) } // Prevent self-activation
          },
          { 
            $set: { 
              isActive: true, 
              lockUntil: null, 
              loginAttempts: 0 
            } 
          }
        );
        affectedCount = activateResult.modifiedCount;
        operationDetails = { action: 'activate', affectedCount };
        break;

      case 'deactivate':
        const deactivateResult = await AdminUser.updateMany(
          { 
            _id: { $in: validAdminIds },
            _id: { $ne: new ObjectId(session.session.id) } // Prevent self-deactivation
          },
          { $set: { isActive: false } }
        );
        affectedCount = deactivateResult.modifiedCount;
        operationDetails = { action: 'deactivate', affectedCount };
        break;

      case 'delete':
        // Prevent deletion of super-admin by non-super-admin
        if (!session.session.isSuperAdmin) {
          const superAdmins = await AdminUser.find({
            _id: { $in: validAdminIds },
            role: 'super_admin'
          });
          
          if (superAdmins.length > 0) {
            console.log('❌ Only super admins can delete super admin users');
            return NextResponse.json(
              { success: false, error: 'Only super admins can delete super admin users' },
              { status: 403 }
            );
          }
        }

        const deleteResult = await AdminUser.deleteMany({
          _id: { $in: validAdminIds },
          _id: { $ne: new ObjectId(session.session.id) } // Prevent self-deletion
        });
        affectedCount = deleteResult.deletedCount;
        operationDetails = { action: 'delete', affectedCount };
        break;

      case 'update_role':
        if (!role) {
          console.log('❌ Role is required for update_role action');
          return NextResponse.json(
            { success: false, error: 'Role is required for update_role action' },
            { status: 400 }
          );
        }

        // Prevent non-super-admin from updating to super-admin
        if (role === 'super_admin' && !session.session.isSuperAdmin) {
          console.log('❌ Only super admins can assign super admin role');
          return NextResponse.json(
            { success: false, error: 'Only super admins can assign super admin role' },
            { status: 403 }
          );
        }

        const updateRoleResult = await AdminUser.updateMany(
          { 
            _id: { $in: validAdminIds },
            _id: { $ne: new ObjectId(session.session.id) } // Prevent self-role-change
          },
          { 
            $set: { 
              role: role,
              permissions: AdminVerificationService.getPermissionsByRole(role)
            } 
          }
        );
        affectedCount = updateRoleResult.modifiedCount;
        operationDetails = { action: 'update_role', role, affectedCount };
        break;

      case 'update_permissions':
        if (!permissions || permissions.length === 0) {
          console.log('❌ Permissions are required for update_permissions action');
          return NextResponse.json(
            { success: false, error: 'Permissions are required for update_permissions action' },
            { status: 400 }
          );
        }

        const updatePermissionsResult = await AdminUser.updateMany(
          { 
            _id: { $in: validAdminIds },
            _id: { $ne: new ObjectId(session.session.id) } // Prevent self-permission-change
          },
          { $set: { permissions } }
        );
        affectedCount = updatePermissionsResult.modifiedCount;
        operationDetails = { action: 'update_permissions', permissions, affectedCount };
        break;

      default:
        console.log('❌ Invalid action');
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    console.log('✅ Bulk operation completed:', operationDetails);

    // Log activity
    await AdminVerificationService.logActivity(session.session.id, 'bulk_admin_operation', {
      ...operationDetails,
      adminIds: validAdminIds,
      reason
    });

    return NextResponse.json({
      success: true,
      data: {
        affectedCount,
        action,
        message: `Bulk operation completed successfully. ${affectedCount} admin(s) affected.`
      }
    });

  } catch (error: any) {
    console.error('❌ Error performing bulk admin operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
} 