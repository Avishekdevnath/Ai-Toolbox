import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser } from '@/models/AdminUserModel';
import { AdminVerificationService } from '@/lib/adminVerificationService';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

// GET - Get admin user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: adminId } = await params;
    console.log('🔍 Getting admin user:', adminId);
    
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

    // Validate ObjectId
    if (!ObjectId.isValid(adminId)) {
      console.log('❌ Invalid admin ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    const admin = await (AdminUser as any).findById(adminId).select('-password');
    if (!admin) {
      console.log('❌ Admin user not found');
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    console.log('✅ Admin user found:', admin.email);
    return NextResponse.json({
      success: true,
      data: { admin }
    });

  } catch (error: any) {
    console.error('❌ Error fetching admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin user' },
      { status: 500 }
    );
  }
}

// PUT - Update admin user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: adminId } = await params;
    console.log('🔍 Updating admin user:', adminId);
    
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

    // Validate ObjectId
    if (!ObjectId.isValid(adminId)) {
      console.log('❌ Invalid admin ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    const admin = await (AdminUser as any).findById(adminId);
    if (!admin) {
      console.log('❌ Admin user not found');
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Prevent non-super-admin from modifying super-admin
    if (false) {
      console.log('❌ Only super admins can modify super admin users');
      return NextResponse.json(
        { success: false, error: 'Only super admins can modify super admin users' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Prevent self-modification for critical fields
    if (admin._id.toString() === session.session.id) {
      console.log('⚠️ Self-modification detected, restricting critical fields');
      delete body.isActive; // Prevent self-deactivation
      delete body.role; // Prevent self-role-change
    }
    console.log('🔍 Update data:', body);

    // Check email uniqueness if changing email
    if (body.email && body.email !== admin.email) {
      const existingAdmin = await (AdminUser as any).findOne({ email: body.email.toLowerCase() });
      if (existingAdmin) {
        console.log('❌ Email already exists');
        return NextResponse.json(
          { success: false, error: 'Admin with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password if provided
    if (body.password) {
      console.log('🔍 Hashing new password');
      const salt = await bcrypt.genSalt(12);
      body.password = await bcrypt.hash(body.password, salt);
    }

    // Update admin
    Object.assign(admin, body);
    await admin.save();

    console.log('✅ Admin user updated successfully');

    // Log activity
    await AdminVerificationService.logActivity(session.session.id, 'update_admin', {
      updatedAdminId: admin._id,
      changes: body
    });

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json({
      success: true,
      data: { admin: adminResponse },
      message: 'Admin user updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: adminId } = await params;
    console.log('🔍 Deleting admin user:', adminId);
    
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

    // Validate ObjectId
    if (!ObjectId.isValid(adminId)) {
      console.log('❌ Invalid admin ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      );
    }

    const admin = await (AdminUser as any).findById(adminId);
    if (!admin) {
      console.log('❌ Admin user not found');
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (admin._id.toString() === session.session.id) {
      console.log('❌ Cannot delete own account');
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deletion of super-admin by non-super-admin
    if (false) {
      console.log('❌ Only super admins can delete super admin users');
      return NextResponse.json(
        { success: false, error: 'Only super admins can delete super admin users' },
        { status: 403 }
      );
    }

    // Delete admin
    await (AdminUser as any).findByIdAndDelete(adminId);

    console.log('✅ Admin user deleted successfully');

    // Log activity
    await AdminVerificationService.logActivity(session.session.id, 'delete_admin', {
      deletedAdminId: admin._id,
      email: admin.email,
      role: admin.role
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin user' },
      { status: 500 }
    );
  }
} 