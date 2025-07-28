require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function clearTestUsers() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all test users
    const testUsers = await usersCollection.find({
      $or: [
        { email: { $regex: /test/i } },
        { email: { $regex: /example/i } },
        { email: 'avishekdevnath@gmail.com' },
        { email: 'avishekdevnathavi@gmail.com' }
      ]
    }).toArray();

    console.log(`📋 Found ${testUsers.length} test users to remove:`);
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });

    if (testUsers.length > 0) {
      // Delete test users
      const result = await usersCollection.deleteMany({
        $or: [
          { email: { $regex: /test/i } },
          { email: { $regex: /example/i } },
          { email: 'avishekdevnath@gmail.com' },
          { email: 'avishekdevnathavi@gmail.com' }
        ]
      });

      console.log(`✅ Successfully removed ${result.deletedCount} test users`);
    } else {
      console.log('ℹ️ No test users found to remove');
    }

    await client.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error clearing test users:', error);
  }
}

// Run the script
clearTestUsers(); 