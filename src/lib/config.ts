export const config = {
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-1.5-flash',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox',
    dbName: process.env.DB_NAME || 'ai-toolbox',
  },
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-change-this-in-production-12345',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  app: {
    name: process.env.APP_NAME || 'AI Toolbox',
    version: process.env.APP_VERSION || '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
} as const;

// Validation function
export function validateConfig() {
  const missing: string[] = [];
  
  if (!config.googleAI.apiKey) {
    missing.push('GOOGLE_AI_API_KEY');
  }
  
  if (!config.mongodb.uri || config.mongodb.uri.includes('username:password')) {
    missing.push('MONGODB_URI (MongoDB Atlas connection string)');
  }
  
  if (!config.nextAuth.secret || config.nextAuth.secret === 'your-super-secret-key-change-this-in-production-12345') {
    missing.push('NEXTAUTH_SECRET');
  }
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work properly without these variables.');
    console.warn('');
    console.warn('📝 To set up MongoDB Atlas:');
    console.warn('1. Go to https://www.mongodb.com/atlas');
    console.warn('2. Create a free cluster');
    console.warn('3. Get your connection string');
    console.warn('4. Add it to your .env.local file as MONGODB_URI');
  }
  
  return missing.length === 0;
}

// Initialize config validation
validateConfig(); 