import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected via Mongoose');

    // Initialize collections if they don't exist
    await initializeCollections();

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function initializeCollections() {
  try {
    const db = mongoose.connection.db;
    
    // List of collections to ensure exist
    const collections = [
      'userfavorites',
      'toolratings', 
      'toolusages',
      'useranalysishistories',
      'usersettings',
      'adminusers',
      'users',
      'urlshorteners',
      'age_analyses'
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
