import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser } from '@/models/AdminUserModel';
import { AdminVerificationService } from '@/lib/adminVerificationService';
import bcrypt from 'bcryptjs';

// GET - Fetch admin users with search and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin users API called');
    
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

    // Get query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    console.log('🔍 Query params:', { search, role, status, page, limit, sortBy, sortOrder });

    // Build query
    const queryFilter: any = {};

    if (search) {
      queryFilter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      queryFilter.role = role;
    }

    if (status !== 'all') {
      queryFilter.isActive = status === 'active';
    }

    console.log('🔍 Query filter:', queryFilter);

    // Get total count
    const totalAdmins = await AdminUser.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalAdmins / limit);

    console.log('📊 Total admins:', totalAdmins, 'Total pages:', totalPages);

    // Get admins with pagination
    const admins = await AdminUser.find(queryFilter)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('✅ Found admins:', admins.length);

    return NextResponse.json({
      success: true,
      data: {
        admins,
        pagination: {
          page,
          limit,
          totalAdmins,
          totalPages
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin users: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await AdminVerificationService.getAdminSession(request);
    if (!session.success || !session.session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!AdminVerificationService.canManageAdmins(session.session)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();

    const body = await request.json();

    // Check if email already exists
    const existingAdmin = await AdminUser.findOne({ email: body.email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Create admin user
    const admin = new AdminUser({
      email: body.email.toLowerCase(),
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      permissions: AdminVerificationService.getPermissionsByRole(body.role),
      isActive: body.isActive
    });

    await admin.save();

    // Log activity
    await AdminVerificationService.logActivity(session.session.id, 'create_admin', {
      createdAdminId: admin._id,
      email: admin.email,
      role: admin.role
    });

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json({
      success: true,
      data: { admin: adminResponse },
      message: 'Admin user created successfully'
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
} 