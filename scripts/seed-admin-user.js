// scripts/seed-admin-user.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolbox';
const DB_NAME = process.env.DB_NAME || 'ai-toolbox';

const adminUser = {
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  password: 'admin123', // Plaintext for hashing only
};

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('users');
    // Remove existing admin users with same email
    await collection.deleteMany({ email: adminUser.email });
    // Hash password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    // Insert admin user
    const result = await collection.insertOne({
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      password: hashedPassword,
    });
    console.log(`Seeded admin user: ${adminUser.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding admin user failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed(); 