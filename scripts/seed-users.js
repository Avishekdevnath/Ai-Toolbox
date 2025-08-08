require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.error('Please set MONGODB_URI in your .env.local file');
  process.exit(1);
}

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db();
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);
    
    // Admin users
    const adminUsers = [
      {
        email: 'superadmin@ai-toolbox.com',
        password: adminPassword,
        firstName: 'Super',
        lastName: 'Admin',
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
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        email: 'admin@ai-toolbox.com',
        password: adminPassword,
        firstName: 'Regular',
        lastName: 'Admin',
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
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        email: 'moderator@ai-toolbox.com',
        password: adminPassword,
        firstName: 'Content',
        lastName: 'Moderator',
        role: 'moderator',
        permissions: [
          'view_analytics',
          'view_dashboard'
        ],
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      }
    ];
    
    // Regular users
    const regularUsers = [
      {
        email: 'user@ai-toolbox.com',
        password: userPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        loginAttempts: 0,
        permissions: ['basic_access'],
        stats: {
          totalLogins: 0,
          toolsUsed: 0,
          totalAnalyses: 0,
          favoriteTools: 0,
          accountAge: 0,
          activityStreak: 0,
          premiumFeatures: 0
        },
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        settings: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        loginHistory: [],
        toolUsage: [],
        favorites: []
      },
      {
        email: 'demo@ai-toolbox.com',
        password: userPassword,
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        loginAttempts: 0,
        permissions: ['basic_access'],
        stats: {
          totalLogins: 0,
          toolsUsed: 0,
          totalAnalyses: 0,
          favoriteTools: 0,
          accountAge: 0,
          activityStreak: 0,
          premiumFeatures: 0
        },
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        settings: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        loginHistory: [],
        toolUsage: [],
        favorites: []
      }
    ];
    
    // Clear existing users
    await db.collection('adminusers').deleteMany({});
    await db.collection('users').deleteMany({});
    
    console.log('🗑️ Cleared existing users');
    
    // Insert admin users
    const adminResult = await db.collection('adminusers').insertMany(adminUsers);
    console.log(`✅ Inserted ${adminResult.insertedCount} admin users`);
    
    // Insert regular users
    const userResult = await db.collection('users').insertMany(regularUsers);
    console.log(`✅ Inserted ${userResult.insertedCount} regular users`);
    
    console.log('\n📋 Test Accounts Created:');
    console.log('\n🔐 Admin Accounts:');
    console.log('  Super Admin: superadmin@ai-toolbox.com / Admin123!');
    console.log('  Admin: admin@ai-toolbox.com / Admin123!');
    console.log('  Moderator: moderator@ai-toolbox.com / Admin123!');
    console.log('\n👤 User Accounts:');
    console.log('  Test User: user@ai-toolbox.com / User123!');
    console.log('  Demo User: demo@ai-toolbox.com / User123!');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers().catch(console.error); 