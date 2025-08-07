import { getDatabase } from './mongodb';
import { userService } from './userService';
import { toolUsageService } from './toolUsageService';

/**
 * Initialize database with all required collections and seed data
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing database...');
    
    // Initialize collections and indexes
    await getDatabase();
    
    // Seed initial data
    await seedInitialData();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Seed initial data for the application
 */
async function seedInitialData(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Seed tools collection with default tools
    await seedTools();
    
    // Create admin user if not exists
    await createAdminUser();
    
    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    // Don't throw error as seeding is not critical
  }
}

/**
 * Seed tools collection with default tools
 */
async function seedTools(): Promise<void> {
  try {
    const db = await getDatabase();
    const toolsCollection = db.collection('tools');
    
    const defaultTools = [
      {
        slug: 'swot-analysis',
        name: 'SWOT Analysis',
        description: 'Analyze strengths, weaknesses, opportunities, and threats',
        category: 'Business',
        icon: '📊',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'finance-advisor',
        name: 'Finance Advisor',
        description: 'Get personalized financial advice and planning',
        category: 'Finance',
        icon: '💰',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'diet-planner',
        name: 'Diet Planner',
        description: 'Create personalized meal plans and nutrition advice',
        category: 'Health',
        icon: '🥗',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'price-tracker',
        name: 'Product Price Tracker',
        description: 'Track product prices across different retailers',
        category: 'Shopping',
        icon: '🛒',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'resume-reviewer',
        name: 'Resume Reviewer',
        description: 'Get AI-powered resume feedback and improvements',
        category: 'Career',
        icon: '📝',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'mock-interviewer',
        name: 'Mock Interviewer',
        description: 'Practice interviews with AI-powered questions',
        category: 'Career',
        icon: '🎤',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'qr-generator',
        name: 'QR Generator',
        description: 'Generate QR codes for URLs, text, and more',
        category: 'Utilities',
        icon: '📱',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure passwords with custom criteria',
        category: 'Security',
        icon: '🔐',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'url-shortener',
        name: 'URL Shortener',
        description: 'Shorten long URLs for easy sharing',
        category: 'Utilities',
        icon: '🔗',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units of measurement',
        category: 'Utilities',
        icon: '📏',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'word-counter',
        name: 'Word Counter',
        description: 'Count words, characters, and analyze text',
        category: 'Utilities',
        icon: '📊',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'tip-calculator',
        name: 'Tip Calculator',
        description: 'Calculate tips and split bills easily',
        category: 'Finance',
        icon: '💡',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'quote-generator',
        name: 'Quote Generator',
        description: 'Generate inspirational quotes and sayings',
        category: 'Inspiration',
        icon: '💭',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'age-calculator',
        name: 'Age Calculator',
        description: 'Calculate age and time differences',
        category: 'Utilities',
        icon: '🎂',
        usage: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert tools if they don't exist
    for (const tool of defaultTools) {
      await toolsCollection.updateOne(
        { slug: tool.slug },
        { $setOnInsert: tool },
        { upsert: true }
      );
    }

    console.log(`✅ Seeded ${defaultTools.length} tools`);
  } catch (error) {
    console.error('❌ Error seeding tools:', error);
  }
}

/**
 * Create admin user if not exists
 */
async function createAdminUser(): Promise<void> {
  try {
    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aitoolbox.com';
    const existingAdmin = await userService.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      // Create admin user in MongoDB (will be synced when they sign in)
      console.log('ℹ️  Admin user will be created when they first sign in');
    } else {
      // Ensure admin role
      if (existingAdmin.role !== 'admin') {
        await userService.updateUserRole(existingAdmin.clerkId, 'admin');
        console.log('✅ Admin role assigned to existing user');
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
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
    const db = await getDatabase();
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