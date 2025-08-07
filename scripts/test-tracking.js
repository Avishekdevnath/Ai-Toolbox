const { MongoClient } = require('mongodb');

async function testTracking() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolbox';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Test the tracking API by making a request
    console.log('🔍 Testing QR Generator tracking...');
    
    // Simulate what the tracking API does
    const result = await db.collection('toolusages').insertOne({
      userId: 'anonymous',
      toolSlug: 'qr-generator',
      toolName: 'QR Code Generator',
      usageType: 'generate',
      metadata: {
        action: 'generate_qr',
        timestamp: new Date()
      },
      userAgent: 'test-script',
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Test record inserted:', result.insertedId);
    
    // Check what's in the database
    const count = await db.collection('toolusages').countDocuments();
    console.log('📊 Total records in toolusages collection:', count);
    
    // Get recent records
    const recentRecords = await db.collection('toolusages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('📋 Recent records:');
    recentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.toolName} (${record.toolSlug}) - ${record.usageType} - ${record.createdAt}`);
    });
    
    // Test aggregation like the admin dashboard does
    const stats = await db.collection('toolusages').aggregate([
      {
        $group: {
          _id: '$toolSlug',
          toolName: { $first: '$toolName' },
          totalUsage: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          lastUsed: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          toolSlug: '$_id',
          toolName: 1,
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          lastUsed: 1
        }
      },
      { $sort: { totalUsage: -1 } }
    ]).toArray();
    
    console.log('\n📈 Aggregated stats:');
    stats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.toolName}: ${stat.totalUsage} uses, ${stat.uniqueUsers} users`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testTracking(); 