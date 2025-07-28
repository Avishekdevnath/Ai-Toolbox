import { MongoClient, Db } from 'mongodb';
import { config } from './config';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB with proper error handling and connection management
 */
export async function connectToDatabase(): Promise<MongoClient> {
  if (client && client.topology?.isConnected()) {
    return client;
  }

  try {
    // Use centralized config
    const { uri, options } = config.mongodb;
    
    client = new MongoClient(uri, {
      maxPoolSize: options.maxPoolSize,
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
      socketTimeoutMS: options.socketTimeoutMS,
      retryWrites: options.retryWrites,
      retryReads: options.retryReads,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    return client;
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error);
    
    // Provide specific error messages based on error type
    if (error.code === 'ECONNREFUSED') {
      throw new Error('MongoDB connection refused. Please check if MongoDB is running and the connection string is correct.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('MongoDB host not found. Please check your connection string and network connectivity.');
    } else if (error.message?.includes('authentication')) {
      throw new Error('MongoDB authentication failed. Please check your username, password, and database name.');
    } else if (error.message?.includes('ENOTFOUND')) {
      throw new Error('MongoDB host not found. Please check your connection string.');
    } else {
      throw new Error(`MongoDB connection failed: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Get database instance with connection management
 */
export async function getDatabase(): Promise<Db> {
  if (!db) {
    const client = await connectToDatabase();
    db = client.db(config.mongodb.dbName);
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Initialize database collections and indexes
 */
export async function initializeCollections(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Initialize shortened_urls collection with indexes
    const shortenedUrlsCollection = db.collection('shortened_urls');
    
    // Create indexes for better performance
    await shortenedUrlsCollection.createIndex({ shortCode: 1 }, { unique: true });
    await shortenedUrlsCollection.createIndex({ createdAt: -1 });
    await shortenedUrlsCollection.createIndex({ userId: 1 });
    await shortenedUrlsCollection.createIndex({ anonymousUserId: 1 });
    await shortenedUrlsCollection.createIndex({ isActive: 1 });
    await shortenedUrlsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
    
    // Initialize tools collection for usage tracking
    const toolsCollection = db.collection('tools');
    await toolsCollection.createIndex({ slug: 1 }, { unique: true });
    await toolsCollection.createIndex({ usage: -1 });
    await toolsCollection.createIndex({ createdAt: -1 });
    
    // Initialize users collection (if using authentication)
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ createdAt: -1 });
    
    console.log('✅ Database collections and indexes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database collections:', error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: any;
}> {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      details: {
        database: config.mongodb.dbName,
        connectionString: config.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
      }
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      details: {
        error: error.message,
        code: error.code,
      }
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  collections: number;
  documents: number;
  indexes: number;
  storageSize: number;
}> {
  try {
    const db = await getDatabase();
    const stats = await db.stats();
    
    return {
      collections: stats.collections,
      documents: stats.objects,
      indexes: stats.indexes,
      storageSize: stats.storageSize,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      collections: 0,
      documents: 0,
      indexes: 0,
      storageSize: 0,
    };
  }
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
  });
} 