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

    // Wait for connection to be ready
    await mongoose.connection.asPromise();
    
    isConnected = true;
    console.log('✅ MongoDB connected via Mongoose');

    // Initialize collections if they don't exist
    await initializeCollections();

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
  }
}

export async function getDatabase() {
  if (!isConnected) {
    await connectToDatabase();
  }
  return { db: mongoose.connection.db };
}

async function initializeCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const requiredCollections = [
      'users',
      'adminusers',
      'toolusages',
      'useranalysishistories',
      'userfavorites',
      'usersettings',
      'adminactivities',
      'adminnotifications'
    ];
    
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing collections:', error);
  }
}
