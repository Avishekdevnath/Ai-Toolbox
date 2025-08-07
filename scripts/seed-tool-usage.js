const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Tool Usage Schema
const ToolUsageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  toolSlug: {
    type: String,
    required: true,
    index: true
  },
  toolName: {
    type: String,
    required: true
  },
  usageType: {
    type: String,
    enum: ['view', 'generate', 'download', 'share'],
    default: 'view'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

const ToolUsage = mongoose.model('ToolUsage', ToolUsageSchema);

// Sample tools data
const tools = [
  { slug: 'swot-analysis', name: 'SWOT Analysis Tool' },
  { slug: 'finance-advisor', name: 'Finance Tools' },
  { slug: 'diet-planner', name: 'Diet Planner' },
  { slug: 'price-tracker', name: 'Product Price Tracker' },
  { slug: 'age-calculator', name: 'Age Calculator' },
  { slug: 'quote-generator', name: 'Quote Generator' },
  { slug: 'resume-reviewer', name: 'Resume Reviewer' },
  { slug: 'mock-interviewer', name: 'Mock Interviewer' },
  { slug: 'job-interviewer', name: 'Job-Specific Interviewer' },
  { slug: 'password-generator', name: 'Password Generator' },
  { slug: 'qr-generator', name: 'QR Generator' },
  { slug: 'unit-converter', name: 'Unit Converter' },
  { slug: 'url-shortener', name: 'URL Shortener' },
  { slug: 'word-counter', name: 'Word Counter' },
  { slug: 'tip-calculator', name: 'Tip Calculator' }
];

// Sample user IDs
const userIds = [
  'user_001', 'user_002', 'user_003', 'user_004', 'user_005',
  'user_006', 'user_007', 'user_008', 'user_009', 'user_010'
];

// Usage types
const usageTypes = ['view', 'generate', 'download', 'share'];

// Generate random usage data
function generateUsageData() {
  const usageData = [];
  const now = new Date();
  
  // Generate data for the last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    
    // Generate 10-50 usage records per day
    const dailyUsage = Math.floor(Math.random() * 40) + 10;
    
    for (let i = 0; i < dailyUsage; i++) {
      const tool = tools[Math.floor(Math.random() * tools.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const usageType = usageTypes[Math.floor(Math.random() * usageTypes.length)];
      
      // Add some randomness to the timestamp within the day
      const timestamp = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      
      usageData.push({
        userId,
        toolSlug: tool.slug,
        toolName: tool.name,
        usageType,
        metadata: {
          source: 'web',
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  }
  
  return usageData;
}

async function seedToolUsage() {
  try {
    console.log('🗑️ Clearing existing tool usage data...');
    await ToolUsage.deleteMany({});
    
    console.log('📊 Generating tool usage data...');
    const usageData = generateUsageData();
    
    console.log(`📝 Inserting ${usageData.length} usage records...`);
    await ToolUsage.insertMany(usageData);
    
    console.log('✅ Tool usage data seeded successfully!');
    
    // Display summary
    const summary = await ToolUsage.aggregate([
      {
        $group: {
          _id: '$toolSlug',
          toolName: { $first: '$toolName' },
          totalUsage: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          toolSlug: '$_id',
          toolName: 1,
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);
    
    console.log('\n📊 Tool Usage Summary:');
    summary.forEach(tool => {
      console.log(`  ${tool.toolName}: ${tool.totalUsage} uses by ${tool.uniqueUsers} users`);
    });
    
    const totalUsage = await ToolUsage.countDocuments();
    const totalUniqueUsers = (await ToolUsage.distinct('userId')).length;
    
    console.log(`\n📈 Total Usage: ${totalUsage}`);
    console.log(`👥 Unique Users: ${totalUniqueUsers}`);
    
  } catch (error) {
    console.error('❌ Error seeding tool usage data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedToolUsage(); 