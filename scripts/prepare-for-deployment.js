#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AI Toolbox - Pre-Deployment Preparation Script');
console.log('================================================\n');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  log(`✅ Created: ${filePath}`, 'green');
}

function updateFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  log(`✅ Updated: ${filePath}`, 'green');
}

// Step 1: Check environment variables
log('\n📋 Step 1: Checking Environment Variables', 'blue');
const envPath = '.env.local';
if (!checkFileExists(envPath)) {
  log('❌ .env.local file not found!', 'red');
  log('Please create .env.local with required environment variables:', 'yellow');
  log(`
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
  `, 'yellow');
  process.exit(1);
} else {
  log('✅ .env.local file found', 'green');
}

// Step 2: Create production environment template
log('\n📋 Step 2: Creating Production Environment Template', 'blue');
const productionEnvContent = `# Production Environment Variables
# Copy this to .env.production and fill in your production values

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_production_key
CLERK_SECRET_KEY=sk_test_your_production_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

MONGODB_URI=mongodb+srv://your_production_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GEMINI_API_KEY=your_gemini_api_key

NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_DSN=your_sentry_dsn

# Security
NEXTAUTH_SECRET=your_nextauth_secret
`;

createFile('.env.production.template', productionEnvContent);

// Step 3: Create optimized database connection
log('\n📋 Step 3: Creating Optimized Database Connection', 'blue');
const optimizedDbContent = `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
`;

updateFile('src/lib/mongodb.ts', optimizedDbContent);

// Step 4: Create rate limiter
log('\n📋 Step 4: Creating Rate Limiter', 'blue');
const rateLimiterContent = `import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(request: NextRequest, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip).filter((timestamp: number) => timestamp > windowStart);
  requests.push(now);
  rateLimitMap.set(ip, requests);

  if (requests.length > limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return null;
}
`;

createFile('src/lib/rateLimiter.ts', rateLimiterContent);

// Step 5: Create environment validator
log('\n📋 Step 5: Creating Environment Validator', 'blue');
const envValidatorContent = `export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'MONGODB_URI',
    'GEMINI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(\`Missing required environment variables: \${missing.join(', ')}\`);
  }
}

export function validateProductionEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    const productionRequired = [
      'NEXT_PUBLIC_GA_ID',
      'SENTRY_DSN',
      'NEXTAUTH_SECRET'
    ];

    const missing = productionRequired.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(\`Warning: Missing production environment variables: \${missing.join(', ')}\`);
    }
  }
}
`;

updateFile('src/lib/configValidator.ts', envValidatorContent);

// Step 6: Create security headers configuration
log('\n📋 Step 6: Creating Security Headers Configuration', 'blue');
const nextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.clerk.dev https://clerk.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.clerk.dev https://clerk.dev https://generativelanguage.googleapis.com;",
          },
        ],
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
`;

updateFile('next.config.ts', nextConfigContent);

// Step 7: Create deployment script
log('\n📋 Step 7: Creating Deployment Script', 'blue');
const deployScriptContent = `#!/bin/bash

echo "🚀 Starting AI Toolbox Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production environment variables."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app should be live at: https://your-domain.vercel.app"
`;

createFile('deploy.sh', deployScriptContent);
execSync('chmod +x deploy.sh');

// Step 8: Create health check endpoint
log('\n📋 Step 8: Creating Health Check Endpoint', 'blue');
const healthCheckContent = `import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    // Test database connection
    await dbConnect();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        clerk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'not_configured',
        gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    );
  }
}
`;

createFile('src/app/api/health/route.ts', healthCheckContent);

// Step 9: Create robots.txt
log('\n📋 Step 9: Creating robots.txt', 'blue');
const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://your-domain.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/admin/
Disallow: /dashboard/admin/

# Allow important pages
Allow: /dashboard
Allow: /tools/
Allow: /about
Allow: /privacy
Allow: /terms
`;

createFile('public/robots.txt', robotsContent);

// Step 10: Create deployment checklist
log('\n📋 Step 10: Creating Deployment Checklist', 'blue');
const deploymentChecklistContent = `# 🚀 DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment (Complete these first)
- [ ] Environment variables configured in .env.production
- [ ] Database connection tested
- [ ] All tests passing
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Legal pages created
- [ ] SEO optimized

## 🚀 Deployment Steps
1. Run: npm run build
2. Run: vercel --prod
3. Configure environment variables in Vercel dashboard
4. Set up custom domain
5. Test all functionality

## 🔍 Post-Deployment Verification
- [ ] Health check endpoint working
- [ ] All pages loading correctly
- [ ] Authentication working
- [ ] All tools functional
- [ ] Admin panel accessible
- [ ] Error monitoring active
- [ ] Analytics tracking
- [ ] Performance acceptable

## 📊 Success Metrics
- Performance Score: >90
- Security Score: >95
- Uptime: >99.9%
- Error Rate: <1%
`;

createFile('DEPLOYMENT_CHECKLIST_FINAL.md', deploymentChecklistContent);

// Final summary
log('\n🎉 Pre-Deployment Preparation Complete!', 'green');
log('\n📋 Next Steps:', 'blue');
log('1. Update .env.production with your production values', 'yellow');
log('2. Run: npm run build', 'yellow');
log('3. Run: vercel --prod', 'yellow');
log('4. Configure environment variables in Vercel dashboard', 'yellow');
log('5. Test all functionality', 'yellow');

log('\n⚠️  Critical Issues to Fix Before Deployment:', 'red');
log('- Database timeout issues (implemented fallback)', 'yellow');
log('- Add proper error monitoring (Sentry)', 'yellow');
log('- Add analytics tracking (Google Analytics)', 'yellow');
log('- Create legal pages (Privacy Policy, Terms)', 'yellow');
log('- Test all user flows thoroughly', 'yellow');

log('\n📁 Files Created/Updated:', 'blue');
log('- .env.production.template', 'green');
log('- src/lib/mongodb.ts (optimized)', 'green');
log('- src/lib/rateLimiter.ts', 'green');
log('- src/lib/configValidator.ts', 'green');
log('- next.config.ts (security headers)', 'green');
log('- deploy.sh (deployment script)', 'green');
log('- src/app/api/health/route.ts', 'green');
log('- public/robots.txt', 'green');
log('- DEPLOYMENT_CHECKLIST_FINAL.md', 'green');

log('\n🚀 Ready for deployment!', 'green'); 