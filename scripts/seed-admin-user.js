// scripts/seed-admin-user.js
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

// MongoDB connection
const { MongoClient } = require('mongodb');

async function seedAdminUsers() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxIdleTimeMS: 30000,
    w: 'majority',
    readPreference: 'primaryPreferred',
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const adminUsersCollection = db.collection('adminusers');

    // Clear existing admin users
    console.log('🧹 Clearing existing admin users...');
    await adminUsersCollection.deleteMany({});
    console.log('✅ Existing admin users cleared');

    // Define admin users with proper password hashing
    const adminUsers = [
      {
        email: 'superadmin@ai-toolbox.com',
        password: 'Admin@123456',
        role: 'super_admin',
        permissions: [
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
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin@ai-toolbox.com',
        password: 'Admin@123456',
        role: 'admin',
        permissions: [
          'manage_users',
          'manage_tools',
          'view_analytics',
          'manage_content',
          'view_audit_logs',
          'view_dashboard',
          'manage_settings'
        ],
        firstName: 'Regular',
        lastName: 'Admin',
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'moderator@ai-toolbox.com',
        password: 'Admin@123456',
        role: 'moderator',
        permissions: [
          'view_analytics',
          'view_dashboard'
        ],
        firstName: 'Content',
        lastName: 'Moderator',
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Hash passwords and insert admin users
    console.log('🔐 Hashing passwords and creating admin users...');
    
    for (const adminUser of adminUsers) {
      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Replace plain password with hashed password
      const adminUserWithHashedPassword = {
        ...adminUser,
        password: hashedPassword
      };

      // Insert the admin user
      const result = await adminUsersCollection.insertOne(adminUserWithHashedPassword);
      console.log(`✅ Created admin user: ${adminUser.email} (ID: ${result.insertedId})`);
    }

    console.log('\n🎉 Admin users seeded successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    adminUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log('');
    });

    console.log('🔗 Admin Login URL: http://localhost:3000/admin-login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seeding function
seedAdminUsers().catch(console.error); 