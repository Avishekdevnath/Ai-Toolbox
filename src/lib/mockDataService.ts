import { UserModel } from '@/models/UserModel';
import { UserSettingsModel } from '@/models/UserSettingsModel';
import { UserAnalysisHistoryModel } from '@/models/UserAnalysisHistoryModel';
import { ToolUsage as ToolUsageModel } from '@/models/ToolUsageModel';
import { UserRoleModel } from '@/models/UserRoleModel';

export interface MockUser {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  image?: string;
  avatar?: string;
  provider: string;
  providerAccountId: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockUserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    updates: boolean;
    security: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
}

export interface MockAnalysisHistory {
  userId: string;
  toolSlug: string;
  toolName: string;
  analysisType: string;
  parameters: any;
  result: any;
  duration: number;
  success: boolean;
  error?: string;
  metadata: {
    userAgent: string;
    ipAddress: string;
    timestamp: Date;
    sessionId?: string;
  };
}

export interface MockToolUsage {
  userId: string;
  toolSlug: string;
  toolName: string;
  usageType: 'view' | 'generate' | 'download' | 'share';
  metadata: any;
  timestamp: Date;
}

export interface MockUserRole {
  userId: string;
  role: 'user' | 'admin' | 'moderator';
  permissions: string[];
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Generate mock users
export const generateMockUsers = (count: number = 50): MockUser[] => {
  const users: MockUser[] = [];
  const providers = ['google', 'github', 'email'];
  const roles: ('user' | 'admin')[] = ['user', 'admin'];

  for (let i = 1; i <= count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const firstName = `User${i}`;
    const lastName = `Test${i}`;
    const email = `user${i}@example.com`;

    users.push({
      email,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      username: `user${i}`,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      provider,
      providerAccountId: `${provider}_${i}`,
      role,
      isActive: Math.random() > 0.1, // 90% active users
      emailVerified: Math.random() > 0.2, // 80% verified
      twoFactorEnabled: Math.random() > 0.8, // 20% with 2FA
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
      updatedAt: new Date()
    });
  }

  return users;
};

// Generate mock user settings
export const generateMockUserSettings = (users: MockUser[]): MockUserSettings[] => {
  return users.map(user => ({
    userId: user.email, // Using email as userId for mock data
    theme: ['light', 'dark', 'auto'][Math.floor(Math.random() * 3)] as 'light' | 'dark' | 'auto',
    language: ['en', 'es', 'fr', 'de'][Math.floor(Math.random() * 4)],
    timezone: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'][Math.floor(Math.random() * 4)],
    notifications: {
      email: Math.random() > 0.2,
      push: Math.random() > 0.3,
      sms: Math.random() > 0.8,
      marketing: Math.random() > 0.7,
      updates: Math.random() > 0.1,
      security: Math.random() > 0.1
    },
    privacy: {
      profileVisibility: ['public', 'private', 'friends'][Math.floor(Math.random() * 3)] as 'public' | 'private' | 'friends',
      dataSharing: Math.random() > 0.6,
      analytics: Math.random() > 0.2,
      thirdParty: Math.random() > 0.8
    },
    accessibility: {
      highContrast: Math.random() > 0.9,
      largeText: Math.random() > 0.9,
      screenReader: Math.random() > 0.95,
      reducedMotion: Math.random() > 0.9
    }
  }));
};

// Generate mock analysis history
export const generateMockAnalysisHistory = (users: MockUser[], count: number = 200): MockAnalysisHistory[] => {
  const tools = [
    { slug: 'swot-analysis', name: 'SWOT Analysis' },
    { slug: 'age-calculator', name: 'Age Calculator' },
    { slug: 'quote-generator', name: 'Quote Generator' },
    { slug: 'password-generator', name: 'Password Generator' },
    { slug: 'url-shortener', name: 'URL Shortener' },
    { slug: 'qr-generator', name: 'QR Generator' },
    { slug: 'unit-converter', name: 'Unit Converter' },
    { slug: 'tip-calculator', name: 'Tip Calculator' },
    { slug: 'word-counter', name: 'Word Counter' },
    { slug: 'diet-planner', name: 'Diet Planner' }
  ];

  const analysisTypes = ['basic', 'detailed', 'comprehensive', 'quick'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  ];

  const history: MockAnalysisHistory[] = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const tool = tools[Math.floor(Math.random() * tools.length)];
    const analysisType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
    const success = Math.random() > 0.1; // 90% success rate
    const duration = Math.floor(Math.random() * 5000) + 500; // 500ms to 5.5s

    history.push({
      userId: user.email,
      toolSlug: tool.slug,
      toolName: tool.name,
      analysisType,
      parameters: {
        input: `Sample input for ${tool.name}`,
        options: { detailed: Math.random() > 0.5 }
      },
      result: {
        output: `Sample result for ${tool.name}`,
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      },
      duration,
      success,
      error: success ? undefined : 'Sample error message',
      metadata: {
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        sessionId: `session_${Math.floor(Math.random() * 1000)}`
      }
    });
  }

  return history;
};

// Generate mock tool usage
export const generateMockToolUsage = (users: MockUser[], count: number = 300): MockToolUsage[] => {
  const tools = [
    { slug: 'swot-analysis', name: 'SWOT Analysis' },
    { slug: 'age-calculator', name: 'Age Calculator' },
    { slug: 'quote-generator', name: 'Quote Generator' },
    { slug: 'password-generator', name: 'Password Generator' },
    { slug: 'url-shortener', name: 'URL Shortener' },
    { slug: 'qr-generator', name: 'QR Generator' },
    { slug: 'unit-converter', name: 'Unit Converter' },
    { slug: 'tip-calculator', name: 'Tip Calculator' },
    { slug: 'word-counter', name: 'Word Counter' },
    { slug: 'diet-planner', name: 'Diet Planner' }
  ];

  const usageTypes: ('view' | 'generate' | 'download' | 'share')[] = ['view', 'generate', 'download', 'share'];

  const usage: MockToolUsage[] = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const tool = tools[Math.floor(Math.random() * tools.length)];
    const usageType = usageTypes[Math.floor(Math.random() * usageTypes.length)];

    usage.push({
      userId: user.email,
      toolSlug: tool.slug,
      toolName: tool.name,
      usageType,
      metadata: {
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        platform: ['Windows', 'MacOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)],
        referrer: Math.random() > 0.5 ? 'direct' : 'google.com'
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
    });
  }

  return usage;
};

// Generate mock user roles
export const generateMockUserRoles = (users: MockUser[]): MockUserRole[] => {
  const roles: ('user' | 'admin' | 'moderator')[] = ['user', 'admin', 'moderator'];
  const permissions = [
    'view_dashboard',
    'manage_users',
    'manage_tools',
    'view_analytics',
    'manage_content',
    'view_audit_logs',
    'manage_settings'
  ];

  return users.map(user => {
    const role = user.role === 'admin' ? 'admin' : 'user';
    const rolePermissions = role === 'admin' 
      ? permissions 
      : ['view_dashboard', 'view_analytics'];

    return {
      userId: user.email,
      role,
      permissions: rolePermissions,
      assignedBy: 'system',
      assignedAt: user.createdAt,
      isActive: user.isActive
    };
  });
};

// Seed database with mock data
export const seedMockData = async () => {
  try {
    console.log('Starting mock data seeding...');

    // Generate mock data
    const mockUsers = generateMockUsers(50);
    const mockUserSettings = generateMockUserSettings(mockUsers);
    const mockAnalysisHistory = generateMockAnalysisHistory(mockUsers, 200);
    const mockToolUsage = generateMockToolUsage(mockUsers, 300);
    const mockUserRoles = generateMockUserRoles(mockUsers);

    // Clear existing data
    await UserModel.deleteMany({});
    await UserSettingsModel.deleteMany({});
    await UserAnalysisHistoryModel.deleteMany({});
    await ToolUsageModel.deleteMany({});
    await UserRoleModel.deleteMany({});

    console.log('Cleared existing data');

    // Insert mock users
    const insertedUsers = await UserModel.insertMany(mockUsers);
    console.log(`Inserted ${insertedUsers.length} users`);

    // Insert mock user settings
    const insertedSettings = await UserSettingsModel.insertMany(mockUserSettings);
    console.log(`Inserted ${insertedSettings.length} user settings`);

    // Insert mock analysis history
    const insertedHistory = await UserAnalysisHistoryModel.insertMany(mockAnalysisHistory);
    console.log(`Inserted ${insertedHistory.length} analysis history records`);

    // Insert mock tool usage
    const insertedUsage = await ToolUsageModel.insertMany(mockToolUsage);
    console.log(`Inserted ${insertedUsage.length} tool usage records`);

    // Insert mock user roles
    const insertedRoles = await UserRoleModel.insertMany(mockUserRoles);
    console.log(`Inserted ${insertedRoles.length} user roles`);

    console.log('Mock data seeding completed successfully!');
    
    return {
      users: insertedUsers.length,
      settings: insertedSettings.length,
      history: insertedHistory.length,
      usage: insertedUsage.length,
      roles: insertedRoles.length
    };
  } catch (error) {
    console.error('Error seeding mock data:', error);
    throw error;
  }
};

// Get mock data statistics
export const getMockDataStats = async () => {
  try {
    const userCount = await UserModel.countDocuments();
    const settingsCount = await UserSettingsModel.countDocuments();
    const historyCount = await UserAnalysisHistoryModel.countDocuments();
    const usageCount = await ToolUsageModel.countDocuments();
    const roleCount = await UserRoleModel.countDocuments();

    return {
      users: userCount,
      settings: settingsCount,
      history: historyCount,
      usage: usageCount,
      roles: roleCount
    };
  } catch (error) {
    console.error('Error getting mock data stats:', error);
    return {
      users: 0,
      settings: 0,
      history: 0,
      usage: 0,
      roles: 0
    };
  }
}; 