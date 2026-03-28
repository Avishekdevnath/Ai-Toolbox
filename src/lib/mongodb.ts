import mongoose from 'mongoose';

let isConnected = false;
let listenersAttached = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    // Enhanced connection options with better error handling
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Reduced for faster failure detection
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000, // Reduced for faster failure detection
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    });

    // Handle connection events - avoid attaching duplicate listeners (HMR/dev caution)
    try {
      // Allow unlimited listeners on the connection to avoid MaxListeners warnings in dev
      (mongoose.connection as any).setMaxListeners?.(0);
    } catch (e) {
      // ignore
    }

    // Attach listeners only if not already present
    if (mongoose.connection.listenerCount('error') === 0) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        isConnected = false;
      });
    }

    if (mongoose.connection.listenerCount('disconnected') === 0) {
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        isConnected = false;
      });
    }

    if (mongoose.connection.listenerCount('reconnected') === 0) {
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        isConnected = true;
      });
    }

    isConnected = true;
    console.log('✅ MongoDB connected via Mongoose');

    // Initialize collections if they don't exist
    await initializeCollections();

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    isConnected = false;
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo ENOTFOUND')) {
        throw new Error('MongoDB server not found. Please check your MONGODB_URI and network connectivity.');
      } else if (error.message.includes('timeout')) {
        throw new Error('MongoDB connection timeout. The server may be unavailable or slow to respond.');
      } else if (error.message.includes('authentication')) {
        throw new Error('MongoDB authentication failed. Please check your credentials.');
      }
    }
    
    throw error;
  }
}

async function initializeCollections() {
  try {
    const db = mongoose.connection?.db;
    if (!db) {
      console.log('⚠️  Collection initialization skipped: no active db connection');
      return;
    }
    
    // List of collections to ensure exist
    const collections = [
      'userfavorites',
      'toolratings', 
      'toolusages',
      'useranalysishistories',
      'usersettings',
      'adminusers',
      'users',
      'urlshorteners'
    ];

    for (const collectionName of collections) {
      try {
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          await db.createCollection(collectionName);
          console.log(`✅ Created collection: ${collectionName}`);
        }
      } catch (error) {
        // Collection might already exist or other error
        console.log(`ℹ️  Collection ${collectionName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('⚠️  Collection initialization warning:', error.message);
  }
}

export async function getDatabase() {
  if (!isConnected) {
    await connectToDatabase();
  }
  return mongoose.connection;
}

// Connection retry mechanism
export async function connectWithRetry(maxRetries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectToDatabase();
      return;
    } catch (error) {
      console.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
