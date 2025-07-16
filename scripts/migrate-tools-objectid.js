// scripts/migrate-tools-objectid.js
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = (process.env.MONGODB_URI || '').trim();
const DB_NAME = (process.env.DB_NAME || '').trim();

if (!MONGODB_URI || !DB_NAME) {
  console.error('Please set MONGODB_URI and DB_NAME in your environment.');
  process.exit(1);
}

console.log('Using MONGODB_URI:', `[${MONGODB_URI}]`);
console.log('Using DB_NAME:', `[${DB_NAME}]`);

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('tools');

    // Find all tools with a string _id
    const stringIdTools = await collection.find({ _id: { $type: 'string' } }).toArray();
    if (stringIdTools.length === 0) {
      console.log('No tools with string _id found. Migration not needed.');
      process.exit(0);
    }

    for (const tool of stringIdTools) {
      const { _id, ...rest } = tool;
      // Insert new doc with ObjectId
      const result = await collection.insertOne({ ...rest });
      console.log(`Migrated tool "${tool.name}" from _id "${_id}" to ObjectId "${result.insertedId}"`);
      // Remove old doc
      await collection.deleteOne({ _id });
    }

    console.log(`Migrated ${stringIdTools.length} tools to ObjectId _id.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate(); 