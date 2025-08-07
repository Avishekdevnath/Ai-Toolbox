const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db('ai-toolbox');
    
    // Check existing collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Existing collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check if required collections exist
    const requiredCollections = [
      'useranalysishistories',
      'usersettings',
      'toolusage',
      'adminusers',
      'adminactivities',
      'adminnotifications'
    ];

    console.log('\n🔍 Checking required collections:');
    for (const collectionName of requiredCollections) {
      const exists = collections.some(col => col.name === collectionName);
      if (exists) {
        console.log(`  ✅ ${collectionName} - EXISTS`);
        
        // Count documents
        const count = await db.collection(collectionName).countDocuments();
        console.log(`     📄 Documents: ${count}`);
      } else {
        console.log(`  ❌ ${collectionName} - MISSING`);
        
        // Create the collection
        try {
          await db.createCollection(collectionName);
          console.log(`     ✅ Created ${collectionName} collection`);
        } catch (error) {
          console.log(`     ⚠️ Failed to create ${collectionName}: ${error.message}`);
        }
      }
    }

    // Check for sample data in useranalysishistories
    console.log('\n📋 Checking for sample data:');
    const sampleData = await db.collection('useranalysishistories').findOne();
    if (sampleData) {
      console.log('  ✅ Found existing data in useranalysishistories');
    } else {
      console.log('  ❌ No data found in useranalysishistories');
      console.log('  💡 You may want to run some tools to generate data');
    }

    // Check database stats
    console.log('\n📈 Database stats:');
    const stats = await db.stats();
    console.log(`  Collections: ${stats.collections}`);
    console.log(`  Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabase().catch(console.error); 