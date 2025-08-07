const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function addMoreSampleData() {
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
    
    // Sample user IDs
    const sampleUserIds = [
      'user_2abc123def456',
      'user_3def456ghi789',
      'user_4ghi789jkl012'
    ];

    console.log('\n🌱 Adding more comprehensive sample data...');

    // More comprehensive analysis history data
    const moreAnalyses = [
      // User 1 - More analyses
      {
        userId: sampleUserIds[0],
        clerkId: sampleUserIds[0],
        analysisType: 'resume',
        toolSlug: 'resume-reviewer',
        toolName: 'Resume Reviewer',
        inputData: {
          resumeText: 'Experienced software developer with 5+ years...',
          jobTitle: 'Senior Developer',
          industry: 'Technology'
        },
        result: {
          feedback: 'Strong technical skills, good formatting',
          suggestions: ['Add more quantifiable achievements', 'Include certifications']
        },
        metadata: {
          processingTime: 1800,
          tokensUsed: 120,
          model: 'gpt-4',
          cost: 0.015,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash_resume_001',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          jobTitle: 'senior developer',
          industry: 'technology'
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date()
      },
      {
        userId: sampleUserIds[0],
        clerkId: sampleUserIds[0],
        analysisType: 'finance',
        toolSlug: 'finance-advisor',
        toolName: 'Finance Advisor',
        inputData: {
          income: 75000,
          expenses: 45000,
          savings: 15000,
          goals: 'retirement'
        },
        result: {
          recommendations: ['Increase emergency fund', 'Start retirement planning'],
          riskAssessment: 'Moderate',
          nextSteps: ['Set up 401k', 'Create budget']
        },
        metadata: {
          processingTime: 3200,
          tokensUsed: 200,
          model: 'gpt-4',
          cost: 0.025,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash_finance_001',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          income: 75000,
          goals: 'retirement'
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date()
      },
      // User 2 - Different analyses
      {
        userId: sampleUserIds[1],
        clerkId: sampleUserIds[1],
        analysisType: 'diet',
        toolSlug: 'diet-planner',
        toolName: 'Diet Planner',
        inputData: {
          age: 28,
          weight: 70,
          height: 175,
          activityLevel: 'moderate',
          goals: 'weight_loss'
        },
        result: {
          dailyCalories: 1800,
          mealPlan: ['Breakfast: Oatmeal with berries', 'Lunch: Grilled chicken salad'],
          recommendations: ['Eat more protein', 'Reduce carbs']
        },
        metadata: {
          processingTime: 1500,
          tokensUsed: 90,
          model: 'gpt-4',
          cost: 0.012,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash_diet_001',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          age: 28,
          goals: 'weight_loss'
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      },
      // User 3 - More diverse usage
      {
        userId: sampleUserIds[2],
        clerkId: sampleUserIds[2],
        analysisType: 'interview',
        toolSlug: 'job-interviewer',
        toolName: 'Job Interviewer',
        inputData: {
          position: 'Frontend Developer',
          experience: '3 years',
          skills: ['React', 'JavaScript', 'CSS']
        },
        result: {
          questions: ['Tell me about a challenging project', 'How do you handle conflicts?'],
          tips: ['Be specific with examples', 'Show enthusiasm']
        },
        metadata: {
          processingTime: 2800,
          tokensUsed: 180,
          model: 'gpt-4',
          cost: 0.022,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '127.0.0.1'
        },
        status: 'completed',
        isAnonymous: false,
        parameterHash: 'hash_interview_001',
        isDuplicate: false,
        regenerationCount: 0,
        lastAccessed: new Date(),
        accessCount: 1,
        normalizedParameters: {
          position: 'frontend developer',
          experience: '3 years'
        },
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date()
      }
    ];

    // Insert more analyses
    const analysisResult = await db.collection('useranalysishistories').insertMany(moreAnalyses);
    console.log(`✅ Inserted ${analysisResult.insertedCount} additional analyses`);

    // More tool usage data
    const moreToolUsage = [
      {
        userId: sampleUserIds[0],
        toolSlug: 'resume-reviewer',
        toolName: 'Resume Reviewer',
        action: 'generate',
        inputData: { resumeText: 'Experienced software developer...' },
        outputData: { result: 'Resume review completed' },
        processingTime: 1800,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUserIds[0],
        toolSlug: 'finance-advisor',
        toolName: 'Finance Advisor',
        action: 'generate',
        inputData: { income: 75000, goals: 'retirement' },
        outputData: { result: 'Financial advice generated' },
        processingTime: 3200,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUserIds[1],
        toolSlug: 'diet-planner',
        toolName: 'Diet Planner',
        action: 'generate',
        inputData: { age: 28, goals: 'weight_loss' },
        outputData: { result: 'Diet plan created' },
        processingTime: 1500,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sampleUserIds[2],
        toolSlug: 'job-interviewer',
        toolName: 'Job Interviewer',
        action: 'generate',
        inputData: { position: 'Frontend Developer' },
        outputData: { result: 'Interview questions generated' },
        processingTime: 2800,
        success: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ];

    // Insert more tool usage
    const toolUsageResult = await db.collection('toolusages').insertMany(moreToolUsage);
    console.log(`✅ Inserted ${toolUsageResult.insertedCount} additional tool usage records`);

    // Add user settings for other users
    const additionalSettings = [
      {
        userId: sampleUserIds[1],
        clerkId: sampleUserIds[1],
        profile: {
          displayName: 'Jane Smith',
          bio: 'Marketing professional and fitness enthusiast',
          avatar: '',
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'MM/DD/YYYY'
        },
        notifications: {
          email: {
            analysisResults: true,
            weeklyReports: true,
            systemUpdates: true,
            marketing: true
          },
          push: {
            analysisComplete: true,
            newFeatures: true,
            reminders: true
          },
          frequency: 'daily'
        },
        privacy: {
          profileVisibility: 'public',
          shareAnalytics: true,
          allowDataCollection: true,
          showUsageStats: true
        },
        application: {
          theme: 'dark',
          compactMode: true,
          autoSave: true,
          defaultTool: 'diet-planner',
          resultsPerPage: 10
        },
        integrations: {
          exportFormat: 'csv',
          autoExport: true,
          webhookUrl: '',
          apiKey: ''
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 12,
          loginNotifications: true,
          deviceManagement: true
        },
        dataManagement: {
          autoDeleteOldAnalyses: true,
          retentionPeriod: 180,
          backupFrequency: 'daily',
          exportData: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: sampleUserIds[2],
        clerkId: sampleUserIds[2],
        profile: {
          displayName: 'Mike Johnson',
          bio: 'Frontend developer looking for new opportunities',
          avatar: '',
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'YYYY-MM-DD'
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
            newFeatures: false,
            reminders: false
          },
          frequency: 'immediate'
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: false,
          allowDataCollection: true,
          showUsageStats: false
        },
        application: {
          theme: 'light',
          compactMode: false,
          autoSave: true,
          defaultTool: 'job-interviewer',
          resultsPerPage: 25
        },
        integrations: {
          exportFormat: 'json',
          autoExport: false,
          webhookUrl: '',
          apiKey: ''
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 48,
          loginNotifications: false,
          deviceManagement: false
        },
        dataManagement: {
          autoDeleteOldAnalyses: false,
          retentionPeriod: 365,
          backupFrequency: 'monthly',
          exportData: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert additional user settings
    await db.collection('usersettings').insertMany(additionalSettings);
    console.log(`✅ Inserted ${additionalSettings.length} additional user settings`);

    console.log('\n🎉 Additional sample data added successfully!');
    console.log(`📊 Total analyses: ${moreAnalyses.length + 3} (including previous)`);
    console.log(`📊 Total tool usage: ${moreToolUsage.length + 3} (including previous)`);
    console.log(`📊 Total user settings: ${additionalSettings.length + 1} (including previous)`);

  } catch (error) {
    console.error('❌ Additional sample data seeding failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

addMoreSampleData().catch(console.error); 