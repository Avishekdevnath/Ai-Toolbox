import { MongoClient, Db } from 'mongodb';
import { config } from './config';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  // Check if we have a valid MongoDB URI
  if (!config.mongodb.uri || config.mongodb.uri.includes('username:password')) {
    throw new Error('MongoDB Atlas connection string not configured. Please set MONGODB_URI in your environment variables.');
  }

  try {
    client = new MongoClient(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds for Atlas
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    
    clientPromise = client.connect();
    
    // Test the connection
    await clientPromise;
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    return clientPromise;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to MongoDB. Please check your connection string and network access.');
      } else if (error.message.includes('authentication')) {
        throw new Error('MongoDB authentication failed. Please check your username and password.');
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error('MongoDB host not found. Please check your connection string.');
      }
    }
    
    throw new Error('Failed to connect to MongoDB Atlas. Please check your configuration.');
  }
}

export function getDatabaseName() {
  return config.mongodb.dbName;
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await connectToDatabase();
    return client.db(config.mongodb.dbName);
  } catch (error) {
    console.error('❌ Failed to get database:', error);
    throw error;
  }
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null;
    console.log('🔌 MongoDB connection closed');
  }
}

// Initialize collections with proper indexes
export async function initializeCollections() {
  try {
    const db = await getDatabase();
    
    // Create resumes collection with indexes
    const resumesCollection = db.collection('resumes');
    await resumesCollection.createIndex({ uploadDate: -1 });
    await resumesCollection.createIndex({ userId: 1 });
    await resumesCollection.createIndex({ fileName: 1 });
    
    // Create analyses collection with indexes
    const analysesCollection = db.collection('analyses');
    await analysesCollection.createIndex({ analysisDate: -1 });
    await analysesCollection.createIndex({ resumeId: 1 });
    await analysesCollection.createIndex({ userId: 1 });
    await analysesCollection.createIndex({ industry: 1 });
    await analysesCollection.createIndex({ jobTitle: 1 });
    
    // Create shortened_urls collection with indexes
    const shortenedUrlsCollection = db.collection('shortened_urls');
    await shortenedUrlsCollection.createIndex({ shortCode: 1 }, { unique: true });
    await shortenedUrlsCollection.createIndex({ createdAt: -1 });
    await shortenedUrlsCollection.createIndex({ userId: 1 });
    await shortenedUrlsCollection.createIndex({ isActive: 1 });
    await shortenedUrlsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
    
    console.log('✅ Database collections initialized with indexes');
  } catch (error) {
    console.error('❌ Failed to initialize collections:', error);
    // Don't throw error, just log it
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await connectToDatabase();
    await client.db(config.mongodb.dbName).admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  await closeConnection();
  process.exit(0);
}); 