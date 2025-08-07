const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seedSampleData() {
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
    
    // Sample user ID (you can change this to match your actual user)
    const sampleUserId = 'user_2abc123def456';
    const sampleClerkId = 'user_2abc123def456';

    console.log('\n🌱 Seeding sample data...');

    // Sample analysis history data
    const sampleAnalyses = [
      {
        userId: sampleUserId,
        clerkId: sampleClerkId,
        analysisType: 'swot',
        toolSlug: 'swot-analysis',
        toolName: 'SWOT Analysis',
        inputData: {
          companyName: 'TechCorp Inc',
          industry: 'Technology',
          description: 'A software development company'
        },
        result: {
          strengths: ['Strong technical team', 'Innovative products'],
          weaknesses: ['Limited market presence', 'High development costs'],
          opportunities: ['Growing market demand', 'Cloud migration trend'],
          threats: ['Competition from big tech', 'Economic uncertainty']
        },
        metadata: {
          processingTime: 2300,
          tokensUsed: 150,
          model: 'gpt-4',
          cost: 0.02,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash123456',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          companyName: 'techcorp inc',
          industry: 'technology'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date()
      },
      {
        userId: sampleUserId,
        clerkId: sampleClerkId,
        analysisType: 'quote',
        toolSlug: 'quote-generator',
        toolName: 'Quote Generator',
        inputData: {
          topic: 'motivation',
          style: 'inspirational'
        },
        result: {
          quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
          author: 'Winston Churchill'
        },
        metadata: {
          processingTime: 1200,
          tokensUsed: 80,
          model: 'gpt-4',
          cost: 0.01,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash789012',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          topic: 'motivation',
          style: 'inspirational'
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      },
      {
        userId: sampleUserId,
        clerkId: sampleClerkId,
        analysisType: 'qr',
        toolSlug: 'qr-generator',
        toolName: 'QR Generator',
        inputData: {
          text: 'https://example.com',
          size: 'medium'
        },
        result: {
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          text: 'https://example.com'
        },
        metadata: {
          processingTime: 500,
          tokensUsed: 20,
          model: 'qr-generator',
          cost: 0.001,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash345678',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          text: 'https://example.com',
          size: 'medium'
        },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updatedAt: new Date()
      }
    ];

    // Insert sample analyses
    const analysisResult = await db.collection('useranalysishistories').insertMany(sampleAnalyses);
    console.log(`✅ Inserted ${analysisResult.insertedCount} sample analyses`);

    // Sample tool usage data
    const sampleToolUsage = [
      {
        userId: sampleUserId,
        toolSlug: 'swot-analysis',
        toolName: 'SWOT Analysis',
        action: 'generate',
        inputData: { companyName: 'TechCorp Inc' },
        outputData: { result: 'SWOT analysis completed' },
        processingTime: 2300,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUserId,
        toolSlug: 'quote-generator',
        toolName: 'Quote Generator',
        action: 'generate',
        inputData: { topic: 'motivation' },
        outputData: { result: 'Quote generated' },
        processingTime: 1200,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUserId,
        toolSlug: 'qr-generator',
        toolName: 'QR Generator',
        action: 'generate',
        inputData: { text: 'https://example.com' },
        outputData: { result: 'QR code generated' },
        processingTime: 500,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    // Insert sample tool usage (using the correct collection name)
    const toolUsageResult = await db.collection('toolusages').insertMany(sampleToolUsage);
    console.log(`✅ Inserted ${toolUsageResult.insertedCount} sample tool usage records`);

    // Sample user settings
    const sampleSettings = {
      userId: sampleUserId,
      clerkId: sampleClerkId,
      profile: {
        displayName: 'John Doe',
        bio: 'Software developer and AI enthusiast',
        avatar: '',
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'MM/DD/YYYY'
      },
      notifications: {
        email: {
          analysisResults: true,
          weeklyReports: false,
          systemUpdates: true,
          marketing: false
        },
        push: {
          analysisComplete: true,
          newFeatures: true,
          reminders: false
        },
        frequency: 'immediate'
      },
      privacy: {
        profileVisibility: 'private',
        shareAnalytics: false,
        allowDataCollection: true,
        showUsageStats: true
      },
      application: {
        theme: 'auto',
        compactMode: false,
        autoSave: true,
        defaultTool: '',
        resultsPerPage: 20
      },
      integrations: {
        exportFormat: 'json',
        autoExport: false,
        webhookUrl: '',
        apiKey: ''
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        loginNotifications: true,
        deviceManagement: true
      },
      dataManagement: {
        autoDeleteOldAnalyses: false,
        retentionPeriod: 365,
        backupFrequency: 'weekly',
        exportData: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert sample user settings
    await db.collection('usersettings').insertOne(sampleSettings);
    console.log('✅ Inserted sample user settings');

    console.log('\n🎉 Sample data seeding completed!');
    console.log(`📊 Total analyses: ${sampleAnalyses.length}`);
    console.log(`📊 Total tool usage: ${sampleToolUsage.length}`);
    console.log(`📊 User settings: 1`);

  } catch (error) {
    console.error('❌ Sample data seeding failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

seedSampleData().catch(console.error); 