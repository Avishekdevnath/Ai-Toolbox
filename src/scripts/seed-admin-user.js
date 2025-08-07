const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define UserRole schema directly for the seed script
const UserRoleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'user'],
    default: 'user',
    required: true,
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_tools', 
      'view_analytics',
      'manage_system',
      'manage_content',
      'view_audit_logs',
      'manage_admins',
      'view_dashboard',
      'manage_settings'
    ],
    default: ['view_dashboard']
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
UserRoleSchema.index({ role: 1, isActive: 1 });
UserRoleSchema.index({ email: 1, isActive: 1 });

const UserRole = mongoose.model('UserRole', UserRoleSchema);

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'manage_tools',
    'view_analytics',
    'manage_system',
    'manage_content',
    'view_audit_logs',
    'manage_admins',
    'view_dashboard',
    'manage_settings'
  ],
  admin: [
    'manage_users',
    'manage_tools',
    'view_analytics',
    'manage_content',
    'view_audit_logs',
    'view_dashboard',
    'manage_settings'
  ],
  moderator: [
    'view_analytics',
    'view_dashboard'
  ],
  user: [
    'view_dashboard'
  ]
};

async function seedAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await UserRole.findOne({
      role: { $in: ['admin', 'super_admin'] },
      isActive: true
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create super admin user
    const adminUser = new UserRole({
      userId: 'admin_seed_user', // This will be replaced with actual Clerk user ID
      email: 'admin@ai-toolbox.com',
      role: 'super_admin',
      permissions: ROLE_PERMISSIONS.super_admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Super admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Permissions:', adminUser.permissions);

    // Create a regular admin user for testing
    const regularAdmin = new UserRole({
      userId: 'admin_regular_user',
      email: 'admin2@ai-toolbox.com',
      role: 'admin',
      permissions: ROLE_PERMISSIONS.admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await regularAdmin.save();
    console.log('✅ Regular admin user created successfully');
    console.log('Email:', regularAdmin.email);
    console.log('Role:', regularAdmin.role);

    // Create a moderator user for testing
    const moderator = new UserRole({
      userId: 'moderator_user',
      email: 'moderator@ai-toolbox.com',
      role: 'moderator',
      permissions: ROLE_PERMISSIONS.moderator,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await moderator.save();
    console.log('✅ Moderator user created successfully');
    console.log('Email:', moderator.email);
    console.log('Role:', moderator.role);

    console.log('\n📋 Next Steps:');
    console.log('1. Sign up with one of these emails in your app');
    console.log('2. Update the userId field with the actual Clerk user ID');
    console.log('3. Test admin access in the admin dashboard');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seed function
seedAdminUser(); 