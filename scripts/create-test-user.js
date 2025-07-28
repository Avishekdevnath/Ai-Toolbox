const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createTestUser() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'ai-toolbox';

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('ℹ️ Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test user
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      emailVerified: true,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test account for authentication',
        location: 'Test Location',
        website: 'https://example.com',
        avatar: null,
        dateOfBirth: null,
        phone: null,
        socialLinks: {}
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: false
        }
      },
      security: {
        emailVerified: true,
        twoFactorEnabled: false,
        lastPasswordChange: new Date(),
        passwordHistory: [],
        loginAttempts: 0,
        lockedUntil: null,
        securityQuestions: []
      },
      activity: {
        lastLogin: new Date(),
        lastActive: new Date(),
        loginHistory: [{
          timestamp: new Date(),
          ip: '127.0.0.1',
          userAgent: 'Test Script',
          location: 'Local',
          success: true
        }],
        totalLogins: 1,
        accountAge: 0
      },
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        features: ['basic_access'],
        paymentMethod: null,
        billingCycle: null
      },
      role: 'user',
      permissions: ['basic_access'],
      accounts: [],
      sessions: [],
      verificationTokens: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('🆔 User ID:', result.insertedId);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser(); 