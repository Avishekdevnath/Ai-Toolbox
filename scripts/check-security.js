#!/usr/bin/env node

/**
 * Security Check Script
 * Checks for exposed API keys and sensitive information
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Security Check Starting...\n');

// Check for .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
  
  // Check if it contains actual keys (not placeholders)
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  if (envContent.includes('pk_test_your_publishable_key_here') || 
      envContent.includes('sk_test_your_secret_key_here')) {
    console.log('❌ WARNING: Placeholder keys found in .env.local');
    console.log('   Please replace with actual Clerk keys');
  } else {
    console.log('✅ .env.local contains actual keys (not placeholders)');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('   Please create .env.local with your actual keys');
}

// Check .gitignore
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignoreContent.includes('.env.local')) {
    console.log('✅ .env.local is in .gitignore');
  } else {
    console.log('❌ .env.local is NOT in .gitignore');
  }
  
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env files are in .gitignore');
  } else {
    console.log('❌ .env files are NOT in .gitignore');
  }
} else {
  console.log('❌ .gitignore file not found');
}

// Check template file
const templatePath = path.join(process.cwd(), 'env.local.template');
if (fs.existsSync(templatePath)) {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  
  if (templateContent.includes('pk_test_your_publishable_key_here') && 
      templateContent.includes('sk_test_your_secret_key_here')) {
    console.log('✅ Template file uses placeholder keys (secure)');
  } else {
    console.log('❌ WARNING: Template file may contain actual keys');
  }
} else {
  console.log('❌ env.local.template file not found');
}

console.log('\n🔒 Security Check Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Make sure your .env.local has actual Clerk keys');
console.log('2. Verify .env.local is in .gitignore');
console.log('3. Test authentication at http://localhost:3000/signin'); 