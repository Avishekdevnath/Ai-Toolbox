import { getDatabase } from './mongodb';
import { userService } from './userService';
import { toolUsageService } from './toolUsageService';

/**
 * Initialize database with all required collections
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing database...');
    
    // Initialize collections and indexes
    await getDatabase();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  collections: number;
  documents: number;
  indexes: number;
  storageSize: number;
  users: number;
  tools: number;
  usageRecords: number;
}> {
  try {
    const dbConnection = await getDatabase();
    const db = dbConnection.db;
    const stats = await db.stats();
    
    // Get collection-specific counts
    const usersCount = await db.collection('users').countDocuments();
    const toolsCount = await db.collection('tools').countDocuments();
    const usageCount = await db.collection('toolUsage').countDocuments();
    
    return {
      collections: stats.collections,
      documents: stats.objects,
      indexes: stats.indexes,
      storageSize: stats.storageSize,
      users: usersCount,
      tools: toolsCount,
      usageRecords: usageCount,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      collections: 0,
      documents: 0,
      indexes: 0,
      storageSize: 0,
      users: 0,
      tools: 0,
      usageRecords: 0,
    };
  }
}

/**
 * Clean up old data (for maintenance)
 */
export async function cleanupOldData(): Promise<{
  deletedUsers: number;
  deletedUsage: number;
  deletedUrls: number;
}> {
  try {
    console.log('🧹 Starting data cleanup...');
    
    // Clean up old usage data (older than 1 year)
    const deletedUsage = await toolUsageService.cleanupOldUsage(365);
    
    // Clean up expired URLs
    const db = await getDatabase();
    const urlsCollection = db.collection('shortened_urls');
    const deletedUrls = await urlsCollection.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    
    // Soft delete inactive users (older than 2 years)
    const usersCollection = db.collection('users');
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const deletedUsers = await usersCollection.updateMany(
      {
        lastSignInAt: { $lt: twoYearsAgo },
        isActive: true,
        role: { $ne: 'admin' },
      },
      { $set: { isActive: false } }
    );
    
    console.log(`✅ Cleanup completed: ${deletedUsers.modifiedCount} users, ${deletedUsage} usage records, ${deletedUrls.deletedCount} URLs`);
    
    return {
      deletedUsers: deletedUsers.modifiedCount,
      deletedUsage,
      deletedUrls: deletedUrls.deletedCount,
    };
  } catch (error) {
    console.error('❌ Error during data cleanup:', error);
    return {
      deletedUsers: 0,
      deletedUsage: 0,
      deletedUrls: 0,
    };
  }
}

/**
 * Export database for backup
 */
export async function exportDatabase(): Promise<{
  users: any[];
  tools: any[];
  usage: any[];
  urls: any[];
}> {
  try {
    const db = await getDatabase();
    
    const [users, tools, usage, urls] = await Promise.all([
      db.collection('users').find({}).toArray(),
      db.collection('tools').find({}).toArray(),
      db.collection('toolUsage').find({}).toArray(),
      db.collection('shortened_urls').find({}).toArray(),
    ]);
    
    return {
      users,
      tools,
      usage,
      urls,
    };
  } catch (error) {
    console.error('❌ Error exporting database:', error);
    return {
      users: [],
      tools: [],
      usage: [],
      urls: [],
    };
  }
} 