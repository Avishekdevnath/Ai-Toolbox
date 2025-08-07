#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AI Toolbox - Production Environment Setup');
console.log('============================================\n');

const productionEnvContent = `# Production Environment Variables
# Copy this to .env.production and fill in your production values

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_production_key_here
CLERK_SECRET_KEY=sk_test_your_production_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Production MongoDB Atlas)
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/ai-toolbox?retryWrites=true&w=majority

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here

# NextAuth (if using)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# Analytics (Production)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Monitoring (Production)
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
SENTRY_DSN=https://your_sentry_dsn_here

# Security
NEXTAUTH_SECRET=your_nextauth_secret_here

# Base URL (Production)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Additional Production Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
`;

// Create production environment file
const envPath = '.env.production';
fs.writeFileSync(envPath, productionEnvContent);

console.log('✅ Created .env.production file');
console.log('\n📋 Next Steps:');
console.log('1. Edit .env.production with your actual production values');
console.log('2. Get your Clerk production keys from: https://dashboard.clerk.com');
console.log('3. Set up MongoDB Atlas production cluster');
console.log('4. Configure Google OAuth for production');
console.log('5. Set up Google Analytics');
console.log('6. Configure Sentry for error monitoring');
console.log('\n⚠️  IMPORTANT: Never commit .env.production to version control!');
console.log('   Add it to .gitignore if not already there.');

// Check if .env.production is in .gitignore
const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env.production')) {
    console.log('\n⚠️  Warning: .env.production is not in .gitignore');
    console.log('   Adding it now...');
    fs.appendFileSync(gitignorePath, '\n# Production environment\n.env.production\n');
    console.log('✅ Added .env.production to .gitignore');
  }
} else {
  console.log('\n⚠️  Warning: .gitignore file not found');
  console.log('   Creating .gitignore with .env.production...');
  fs.writeFileSync('.gitignore', '# Production environment\n.env.production\n');
  console.log('✅ Created .gitignore with .env.production');
}

console.log('\n🎉 Production environment setup complete!');
console.log('   Remember to fill in all the placeholder values in .env.production'); 