#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates all systems before production deployment
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 AI Toolbox - Production Deployment Validation\n');

async function validateEnvironment() {
  console.log('📋 Validating Environment Variables...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXTAUTH_SECRET'
  ];

  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
}

async function validateDatabase() {
  console.log('\n🗄️ Validating Database Connection...');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('ai-toolbox');
    const collections = await db.listCollections().toArray();
    
    console.log(`✅ Database connected successfully`);
    console.log(`📊 Found ${collections.length} collections`);
    
    // Check required collections
    const requiredCollections = [
      'users',
      'adminusers',
      'useranalysishistories',
      'toolusages',
      'adminactivities',
      'adminnotifications'
    ];

    const existingCollections = collections.map(c => c.name);
    const missing = requiredCollections.filter(c => !existingCollections.includes(c));

    if (missing.length > 0) {
      console.warn('⚠️ Missing collections:', missing.join(', '));
    } else {
      console.log('✅ All required collections exist');
    }

    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    return false;
  }
}

async function validateAPIs() {
  console.log('\n🔌 Validating API Endpoints...');
  
  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    '/api/system/health',
    '/api/admin/auth/session',
    '/api/user/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (response.status === 401) {
        console.log(`✅ ${endpoint} - Protected (401 Unauthorized)`);
      } else if (response.status === 200) {
        console.log(`✅ ${endpoint} - Accessible (200 OK)`);
      } else {
        console.warn(`⚠️ ${endpoint} - Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - Failed: ${error.message}`);
    }
  }
}

async function validateModels() {
  console.log('\n📊 Validating Database Models...');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('ai-toolbox');
    
    // Check admin users
    const adminUsers = await db.collection('adminusers').countDocuments();
    console.log(`👥 Admin Users: ${adminUsers}`);
    
    // Check regular users
    const users = await db.collection('users').countDocuments();
    console.log(`👤 Regular Users: ${users}`);
    
    // Check analysis history
    const history = await db.collection('useranalysishistories').countDocuments();
    console.log(`📈 Analysis History: ${history}`);
    
    // Check tool usage
    const toolUsage = await db.collection('toolusages').countDocuments();
    console.log(`🛠️ Tool Usage: ${toolUsage}`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Model validation failed:', error.message);
    return false;
  }
}

async function validateSecurity() {
  console.log('\n🔒 Validating Security Configuration...');
  
  // Check for common security issues
  const securityChecks = [
    {
      name: 'Environment Variables',
      check: () => !process.env.MONGODB_URI?.includes('localhost'),
      message: 'Using production MongoDB URI'
    },
    {
      name: 'Clerk Configuration',
      check: () => process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
      message: 'Clerk authentication configured'
    },
    {
      name: 'NextAuth Secret',
      check: () => process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 32,
      message: 'Strong NextAuth secret configured'
    }
  ];

  let allPassed = true;
  for (const check of securityChecks) {
    if (check.check()) {
      console.log(`✅ ${check.name}: ${check.message}`);
    } else {
      console.error(`❌ ${check.name}: Failed`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function main() {
  console.log('🚀 Starting Production Deployment Validation...\n');

  const checks = [
    { name: 'Environment', fn: validateEnvironment },
    { name: 'Database', fn: validateDatabase },
    { name: 'APIs', fn: validateAPIs },
    { name: 'Models', fn: validateModels },
    { name: 'Security', fn: validateSecurity }
  ];

  let allPassed = true;
  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name} validation failed:`, error.message);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 PRODUCTION DEPLOYMENT VALIDATION PASSED');
    console.log('✅ The system is ready for production deployment');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy to production environment');
    console.log('2. Configure production environment variables');
    console.log('3. Set up monitoring and logging');
    console.log('4. Conduct user acceptance testing');
    console.log('5. Monitor system performance');
  } else {
    console.log('❌ PRODUCTION DEPLOYMENT VALIDATION FAILED');
    console.log('⚠️ Please fix the issues above before deploying');
    process.exit(1);
  }
  console.log('='.repeat(50));
}

// Run validation
main().catch(console.error); 