const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define AdminUser schema for the script
const AdminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin',
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
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
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
  ]
};

// Pre-save middleware to hash password and set permissions
AdminUserSchema.pre('save', async function(next) {
  const adminUser = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!adminUser.isModified('password')) {
    // Set permissions based on role if not already set
    if (!adminUser.permissions || adminUser.permissions.length === 0) {
      adminUser.permissions = ROLE_PERMISSIONS[adminUser.role] || ROLE_PERMISSIONS.admin;
    }
    return next();
  }

  try {
    // Hash the password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    adminUser.password = await bcrypt.hash(adminUser.password, salt);
    
    // Set permissions based on role
    adminUser.permissions = ROLE_PERMISSIONS[adminUser.role] || ROLE_PERMISSIONS.admin;
    
    next();
  } catch (error) {
    next(error);
  }
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

async function seedAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin users already exist
    const existingAdmin = await AdminUser.findOne({
      role: { $in: ['admin', 'super_admin'] },
      isActive: true
    });

    if (existingAdmin) {
      console.log('⚠️ Admin users already exist');
      console.log('Current admin users:');
      
      const allAdmins = await AdminUser.find({ isActive: true }).select('-password');
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Name: ${admin.firstName || ''} ${admin.lastName || ''}`);
        console.log('---');
      });
      return;
    }

    // Create super admin user
    const superAdmin = new AdminUser({
      email: 'superadmin@ai-toolbox.com',
      password: 'superadmin123',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true
    });

    await superAdmin.save();
    console.log('✅ Super admin user created successfully');
    console.log('Email: superadmin@ai-toolbox.com');
    console.log('Password: superadmin123');
    console.log('Role: super_admin');

    // Create regular admin user
    const admin = new AdminUser({
      email: 'admin@ai-toolbox.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Regular',
      lastName: 'Admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Regular admin user created successfully');
    console.log('Email: admin@ai-toolbox.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    // Create moderator user
    const moderator = new AdminUser({
      email: 'moderator@ai-toolbox.com',
      password: 'moderator123',
      role: 'moderator',
      firstName: 'Content',
      lastName: 'Moderator',
      isActive: true
    });

    await moderator.save();
    console.log('✅ Moderator user created successfully');
    console.log('Email: moderator@ai-toolbox.com');
    console.log('Password: moderator123');
    console.log('Role: moderator');

    console.log('\n📋 Admin Login Credentials:');
    console.log('==========================');
    console.log('Super Admin:');
    console.log('  Email: superadmin@ai-toolbox.com');
    console.log('  Password: superadmin123');
    console.log('');
    console.log('Admin:');
    console.log('  Email: admin@ai-toolbox.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Moderator:');
    console.log('  Email: moderator@ai-toolbox.com');
    console.log('  Password: moderator123');
    console.log('');
    console.log('🔗 Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seed function
seedAdminUsers(); 