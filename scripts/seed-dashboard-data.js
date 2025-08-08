require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function seedDashboardData() {
  try {
    console.log('🌱 Starting dashboard data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas inline
    const SystemActivitySchema = new mongoose.Schema({
      type: String,
      userEmail: String,
      action: String,
      toolSlug: String,
      timestamp: { type: Date, default: Date.now },
      severity: { type: String, default: 'low' },
      isRead: { type: Boolean, default: false }
    });

    const SystemAlertSchema = new mongoose.Schema({
      type: String,
      title: String,
      message: String,
      category: String,
      severity: { type: String, default: 'medium' },
      isRead: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    // Create models
    const SystemActivity = mongoose.model('SystemActivity', SystemActivitySchema);
    const SystemAlert = mongoose.model('SystemAlert', SystemAlertSchema);

    // Clear existing data
    await SystemActivity.deleteMany({});
    await SystemAlert.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample alerts
    await SystemAlert.create([
      {
        type: 'success',
        title: 'System backup completed successfully',
        message: 'Daily backup completed without issues',
        category: 'system'
      },
      {
        type: 'warning',
        title: 'High memory usage detected',
        message: 'Memory usage is above 80%',
        category: 'performance'
      },
      {
        type: 'info',
        title: 'New user registration milestone reached',
        message: 'Reached 1000 registered users',
        category: 'user'
      }
    ]);
    console.log('✅ Created sample alerts');

    // Create sample activities
    const sampleUsers = ['john.doe@example.com', 'jane.smith@example.com', 'admin@ai-toolbox.com', 'user123@example.com', 'demo@example.com'];
    const sampleTools = ['age-calculator', 'password-generator', 'qr-generator', 'unit-converter', 'quote-generator'];
    const sampleActions = ['Used Age Calculator', 'Created new account', 'Updated system settings', 'Used Password Generator', 'Logged in'];

    for (let i = 0; i < 20; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const randomTool = sampleTools[Math.floor(Math.random() * sampleTools.length)];
      const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
      
      await SystemActivity.create({
        type: 'user_activity',
        userEmail: randomUser,
        action: randomAction,
        toolSlug: randomAction.includes('Used') ? randomTool : undefined,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    console.log('✅ Created sample activities');

    console.log('✅ Dashboard data seeded successfully!');
    console.log('📊 You can now view real data on the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedDashboardData(); 