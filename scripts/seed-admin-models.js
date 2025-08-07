const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define ToolUsage Schema
const ToolUsageSchema = new mongoose.Schema({
  userId: { type: String, required: false, index: true },
  userEmail: { type: String, required: false, index: true },
  toolSlug: { type: String, required: true, index: true },
  toolName: { type: String, required: true },
  action: { type: String, enum: ['view', 'use', 'download', 'share'], default: 'use', required: true },
  metadata: {
    duration: { type: Number },
    result: { type: String },
    error: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Define AdminActivity Schema
const AdminActivitySchema = new mongoose.Schema({
  adminId: { type: String, required: true, index: true },
  adminEmail: { type: String, required: true, index: true },
  adminRole: { type: String, required: true, enum: ['super_admin', 'admin', 'moderator'] },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, required: false, index: true },
  details: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    changes: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String },
  },
  ipAddress: { type: String, required: false },
  userAgent: { type: String, required: false },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success', required: true },
  errorMessage: { type: String, required: false },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Define SystemSettings Schema
const SystemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'], required: true },
  category: { type: String, enum: ['general', 'security', 'email', 'tools', 'analytics', 'maintenance'], required: true, index: true },
  description: { type: String, required: false },
  isPublic: { type: Boolean, default: false },
  isEditable: { type: Boolean, default: true },
  updatedBy: { type: String, required: false },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Define AdminNotification Schema
const AdminNotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', required: true },
  category: { type: String, enum: ['system', 'security', 'user', 'tool', 'analytics', 'maintenance'], required: true },
  targetRoles: [{ type: String, enum: ['super_admin', 'admin', 'moderator'] }],
  targetAdmins: [{ type: String }],
  isRead: { type: Boolean, default: false, index: true },
  isDismissed: { type: Boolean, default: false, index: true },
  expiresAt: { type: Date, required: false, index: true },
  metadata: {
    resourceId: { type: String },
    resourceType: { type: String },
    action: { type: String },
    userId: { type: String },
    toolSlug: { type: String },
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  readAt: { type: Date, required: false },
  dismissedAt: { type: Date, required: false },
});

// Create models
const ToolUsage = mongoose.model('ToolUsage', ToolUsageSchema);
const AdminActivity = mongoose.model('AdminActivity', AdminActivitySchema);
const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);
const AdminNotification = mongoose.model('AdminNotification', AdminNotificationSchema);

async function seedAdminModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingToolUsage = await ToolUsage.countDocuments();
    const existingAdminActivity = await AdminActivity.countDocuments();
    const existingSystemSettings = await SystemSettings.countDocuments();
    const existingNotifications = await AdminNotification.countDocuments();

    if (existingToolUsage > 0 || existingAdminActivity > 0 || existingSystemSettings > 0 || existingNotifications > 0) {
      console.log('⚠️ Data already exists in admin models. Skipping seeding.');
      console.log(`- Tool Usage: ${existingToolUsage} records`);
      console.log(`- Admin Activity: ${existingAdminActivity} records`);
      console.log(`- System Settings: ${existingSystemSettings} records`);
      console.log(`- Admin Notifications: ${existingNotifications} records`);
      return;
    }

    // Seed Tool Usage Data
    console.log('\n📊 Seeding Tool Usage Data...');
    const toolUsageData = [
      { toolSlug: 'swot-analysis', toolName: 'SWOT Analysis', action: 'use', userId: 'user1', userEmail: 'user1@example.com' },
      { toolSlug: 'swot-analysis', toolName: 'SWOT Analysis', action: 'use', userId: 'user2', userEmail: 'user2@example.com' },
      { toolSlug: 'finance-advisor', toolName: 'Finance Tools', action: 'use', userId: 'user1', userEmail: 'user1@example.com' },
      { toolSlug: 'diet-planner', toolName: 'Diet Planner', action: 'use', userId: 'user3', userEmail: 'user3@example.com' },
      { toolSlug: 'price-tracker', toolName: 'Product Price Tracker', action: 'use', userId: 'user2', userEmail: 'user2@example.com' },
      { toolSlug: 'resume-reviewer', toolName: 'Resume Reviewer', action: 'use', userId: 'user1', userEmail: 'user1@example.com' },
      { toolSlug: 'mock-interviewer', toolName: 'Mock Interviewer', action: 'use', userId: 'user4', userEmail: 'user4@example.com' },
      { toolSlug: 'qr-generator', toolName: 'QR Generator', action: 'use', userId: 'user3', userEmail: 'user3@example.com' },
      { toolSlug: 'password-generator', toolName: 'Password Generator', action: 'use', userId: 'user2', userEmail: 'user2@example.com' },
      { toolSlug: 'url-shortener', toolName: 'URL Shortener', action: 'use', userId: 'user1', userEmail: 'user1@example.com' },
    ];

    // Add timestamps to make data more realistic
    const now = new Date();
    const toolUsageWithTimestamps = toolUsageData.map((data, index) => ({
      ...data,
      createdAt: new Date(now.getTime() - (index * 60 * 60 * 1000)), // Spread over hours
      updatedAt: new Date(now.getTime() - (index * 60 * 60 * 1000)),
    }));

    await ToolUsage.insertMany(toolUsageWithTimestamps);
    console.log('✅ Tool Usage data seeded successfully');

    // Seed Admin Activity Data
    console.log('\n📝 Seeding Admin Activity Data...');
    const adminActivityData = [
      {
        adminId: '6887d6ef030eb89dca849d72',
        adminEmail: 'superadmin@ai-toolbox.com',
        adminRole: 'super_admin',
        action: 'viewed',
        resource: 'dashboard',
        status: 'success',
        createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
        updatedAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        adminId: '6887d6ef030eb89dca849d72',
        adminEmail: 'superadmin@ai-toolbox.com',
        adminRole: 'super_admin',
        action: 'accessed',
        resource: 'user management',
        status: 'success',
        createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        adminId: '6887d6ef030eb89dca849d72',
        adminEmail: 'superadmin@ai-toolbox.com',
        adminRole: 'super_admin',
        action: 'updated',
        resource: 'system settings',
        status: 'success',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        updatedAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
    ];

    await AdminActivity.insertMany(adminActivityData);
    console.log('✅ Admin Activity data seeded successfully');

    // Seed System Settings Data
    console.log('\n⚙️ Seeding System Settings Data...');
    const systemSettingsData = [
      {
        key: 'maintenance_mode',
        value: false,
        type: 'boolean',
        category: 'maintenance',
        description: 'Enable maintenance mode for the application',
        isPublic: false,
        isEditable: true,
        updatedBy: 'superadmin@ai-toolbox.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'max_file_upload_size',
        value: 10485760, // 10MB
        type: 'number',
        category: 'general',
        description: 'Maximum file upload size in bytes',
        isPublic: true,
        isEditable: true,
        updatedBy: 'superadmin@ai-toolbox.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'session_timeout',
        value: 86400, // 24 hours
        type: 'number',
        category: 'security',
        description: 'Session timeout in seconds',
        isPublic: false,
        isEditable: true,
        updatedBy: 'superadmin@ai-toolbox.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'enable_analytics',
        value: true,
        type: 'boolean',
        category: 'analytics',
        description: 'Enable analytics tracking',
        isPublic: false,
        isEditable: true,
        updatedBy: 'superadmin@ai-toolbox.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await SystemSettings.insertMany(systemSettingsData);
    console.log('✅ System Settings data seeded successfully');

    // Seed Admin Notifications Data
    console.log('\n🔔 Seeding Admin Notifications Data...');
    const adminNotificationsData = [
      {
        title: 'System Health Check',
        message: 'All systems are running normally',
        type: 'success',
        priority: 'low',
        category: 'system',
        isRead: false,
        isDismissed: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        title: 'New User Registration',
        message: 'A new user has registered: user5@example.com',
        type: 'info',
        priority: 'medium',
        category: 'user',
        isRead: false,
        isDismissed: false,
        createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000),
      },
      {
        title: 'High Tool Usage',
        message: 'SWOT Analysis tool usage has increased by 25%',
        type: 'warning',
        priority: 'medium',
        category: 'tool',
        isRead: false,
        isDismissed: false,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
    ];

    await AdminNotification.insertMany(adminNotificationsData);
    console.log('✅ Admin Notifications data seeded successfully');

    console.log('\n🎉 All admin models seeded successfully!');
    console.log('\n📋 Summary:');
    console.log('- Tool Usage: 10 records');
    console.log('- Admin Activity: 3 records');
    console.log('- System Settings: 4 records');
    console.log('- Admin Notifications: 3 records');

  } catch (error) {
    console.error('❌ Error seeding admin models:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedAdminModels(); 