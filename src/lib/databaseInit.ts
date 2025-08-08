import mongoose from 'mongoose';
import { AdminUser } from '@/models/AdminUserModel';
import bcrypt from 'bcryptjs';

// Database connection function
export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    console.log('✅ MongoDB connected via Mongoose');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Initialize admin users
export const initializeAdminUsers = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing admin users...');

    // Check if admin users already exist
    const existingAdmins = await AdminUser.find({});
    
    if (existingAdmins.length > 0) {
      console.log(`✅ Found ${existingAdmins.length} existing admin users`);
      return;
    }

    // Create default admin users
    const adminUsers = [
      {
        email: 'superadmin@ai-toolbox.com',
        password: 'SuperAdmin123!',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin' as const,
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
        isActive: true
      },
      {
        email: 'admin@ai-toolbox.com',
        password: 'Admin123!',
        firstName: 'Regular',
        lastName: 'Admin',
        role: 'admin' as const,
        permissions: [
          'manage_users',
          'manage_tools',
          'view_analytics',
          'manage_content',
          'view_audit_logs',
          'view_dashboard',
          'manage_settings'
        ],
        isActive: true
      },
      {
        email: 'moderator@ai-toolbox.com',
        password: 'Moderator123!',
        firstName: 'Content',
        lastName: 'Moderator',
        role: 'moderator' as const,
        permissions: [
          'view_analytics',
          'view_dashboard'
        ],
        isActive: true
      }
    ];

    // Hash passwords and create admin users
    for (const adminData of adminUsers) {
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      const adminUser = new AdminUser({
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role,
        permissions: adminData.permissions,
        isActive: adminData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await adminUser.save();
      console.log(`✅ Created admin user: ${adminData.email}`);
    }

    console.log('✅ Admin users initialization completed');
  } catch (error) {
    console.error('❌ Error initializing admin users:', error);
    throw error;
  }
};

// Initialize database collections
export const initializeCollections = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing database collections...');

    const collections = [
      'adminusers',
      'users',
      'usersettings',
      'useranalysishistories',
      'toolusages',
      'userroles',
      'toolratings',
      'userfavorites',
      'adminactivities',
      'adminnotifications',
      'systemsettings',
      'quotes',
      'resumes',
      'urlshorteners',
      'age_analyses'
    ];

    for (const collectionName of collections) {
      try {
        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          // Create collection
          await mongoose.connection.createCollection(collectionName);
          console.log(`✅ Created collection: ${collectionName}`);
        } else {
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not initialize collection ${collectionName}:`, error);
      }
    }

    console.log('✅ Database collections initialization completed');
  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    throw error;
  }
};

// Create database indexes
export const createIndexes = async (): Promise<void> => {
  try {
    console.log('🔧 Creating database indexes...');

    // Admin users indexes
    await AdminUser.createIndexes();
    console.log('✅ Admin users indexes created');

    // Note: Other model indexes will be created when models are first used
    console.log('✅ Database indexes creation completed');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to database
    await connectToDatabase();

    // Initialize collections
    await initializeCollections();

    // Create indexes
    await createIndexes();

    // Initialize admin users
    await initializeAdminUsers();

    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const gracefulShutdown = async (): Promise<void> => {
  try {
    console.log('🔄 Gracefully shutting down database connection...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: any;
}> => {
  try {
    // Check connection status
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        details: { readyState: mongoose.connection.readyState }
      };
    }

    // Ping database
    await mongoose.connection.db.admin().ping();

    // Check admin users count
    const adminCount = await AdminUser.countDocuments();

    return {
      status: 'healthy',
      message: 'Database is healthy',
      details: {
        readyState: mongoose.connection.readyState,
        adminUsers: adminCount,
        collections: Object.keys(mongoose.connection.collections)
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};

// Export default initialization function
export default initializeDatabase; 