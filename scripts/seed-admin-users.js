const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Admin User Schema (simplified for seeding)
const AdminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: {
    type: [String],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

// Admin users data from the JSON
const adminUsersData = [
  {
    email: "superadmin@ai-toolbox.com",
    password: "Admin@123456", // Will be hashed
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    permissions: [
      "manage_users",
      "manage_tools",
      "view_analytics",
      "manage_system",
      "manage_content",
      "view_audit_logs",
      "manage_admins",
      "view_dashboard",
      "manage_settings"
    ],
    isActive: true
  },
  {
    email: "admin@ai-toolbox.com",
    password: "Admin@123456", // Will be hashed
    firstName: "Regular",
    lastName: "Admin",
    role: "admin",
    permissions: [
      "manage_users",
      "manage_tools",
      "view_analytics",
      "manage_content",
      "view_audit_logs",
      "view_dashboard",
      "manage_settings"
    ],
    isActive: true
  },
  {
    email: "moderator@ai-toolbox.com",
    password: "Admin@123456", // Will be hashed
    firstName: "Content",
    lastName: "Moderator",
    role: "moderator",
    permissions: [
      "view_analytics",
      "view_dashboard"
    ],
    isActive: true
  }
];

async function seedAdminUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing admin users
    console.log('🧹 Clearing existing admin users...');
    await AdminUser.deleteMany({});
    console.log('✅ Cleared existing admin users');

    // Hash passwords and create admin users
    console.log('👥 Creating admin users...');
    const createdAdmins = [];

    for (const adminData of adminUsersData) {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Create admin user
      const admin = new AdminUser({
        ...adminData,
        password: hashedPassword
      });

      await admin.save();
      createdAdmins.push(admin);
      console.log(`✅ Created admin: ${admin.email} (${admin.role})`);
    }

    console.log('\n🎉 Admin users seeded successfully!');
    console.log(`📊 Total admin users created: ${createdAdmins.length}`);
    
    console.log('\n📋 Admin Users Summary:');
    createdAdmins.forEach(admin => {
      console.log(`  • ${admin.email} - ${admin.role} (${admin.permissions.length} permissions)`);
    });

    console.log('\n🔑 Login Credentials:');
    console.log('  Email: superadmin@ai-toolbox.com');
    console.log('  Password: Admin@123456');
    console.log('\n  Email: admin@ai-toolbox.com');
    console.log('  Password: Admin@123456');
    console.log('\n  Email: moderator@ai-toolbox.com');
    console.log('  Password: Admin@123456');

    console.log('\n✅ Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedAdminUsers();
}

module.exports = { seedAdminUsers }; 