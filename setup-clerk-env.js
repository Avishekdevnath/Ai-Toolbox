#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Clerk Environment Variables Setup');
console.log('=====================================\n');

const envPath = path.join(__dirname, '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please copy env.local.template to .env.local first.');
  process.exit(1);
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupEnvironment() {
  console.log('📝 Please provide your Clerk credentials:\n');

  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Get Clerk Publishable Key
  const publishableKey = await askQuestion('Enter your Clerk Publishable Key (pk_test_...): ');
  if (publishableKey) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/,
      `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}`
    );
  }

  // Get Clerk Secret Key
  const secretKey = await askQuestion('Enter your Clerk Secret Key (sk_test_...): ');
  if (secretKey) {
    envContent = envContent.replace(
      /CLERK_SECRET_KEY=.*/,
      `CLERK_SECRET_KEY=${secretKey}`
    );
  }

  // Get MongoDB URI
  const mongoUri = await askQuestion('Enter your MongoDB URI (optional, press Enter to skip): ');
  if (mongoUri) {
    envContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${mongoUri}`
    );
  }

  // Get Google AI API Key
  const googleAiKey = await askQuestion('Enter your Google AI API Key (optional, press Enter to skip): ');
  if (googleAiKey) {
    envContent = envContent.replace(
      /GOOGLE_AI_API_KEY=.*/,
      `GOOGLE_AI_API_KEY=${googleAiKey}`
    );
  }

  // Write updated .env.local
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Environment variables updated successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your development server');
  console.log('2. Visit http://localhost:3000/clerk-diagnostic to verify setup');
  console.log('3. Configure OAuth providers in your Clerk dashboard');
  console.log('4. Follow the OAuth setup guide at http://localhost:3000/oauth-setup-guide');

  rl.close();
}

setupEnvironment().catch(console.error); 