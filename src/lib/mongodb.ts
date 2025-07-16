import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolbox';
const DB_NAME = process.env.DB_NAME || 'ai-toolbox';

let client: MongoClient | null = null;
export const clientPromise = {};

export async function connectToDatabase(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
    
    // Test the connection
    await clientPromise;
    console.log('✅ Connected to MongoDB successfully');
    
    return clientPromise;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export function getDatabaseName() {
  return DB_NAME;
}

export async function getDatabase() {
  const client = await connectToDatabase();
  return client.db(DB_NAME);
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
    
    console.log('✅ Database collections initialized with indexes');
  } catch (error) {
    console.error('❌ Failed to initialize collections:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await connectToDatabase();
    await client.db().admin().ping();
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