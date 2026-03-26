/**
 * Seed script — drops and reseeds `tools` and `authusers` collections.
 * All users (admin + regular) go into the single `authusers` collection.
 * Run: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------------------------
// Tools data
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: 'Age Calculator',
    slug: 'age-calculator',
    description: 'Calculate your exact age in years, months, days, and more.',
    category: 'Utility',
    icon: '🎂',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Diet Planner',
    slug: 'diet-planner',
    description: 'AI-powered personalized diet plans based on your goals.',
    category: 'AI',
    icon: '🥗',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Finance Advisor',
    slug: 'finance-advisor',
    description: 'Get AI-driven financial advice and investment analysis.',
    category: 'AI',
    icon: '💰',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Job Interviewer',
    slug: 'job-interviewer',
    description: 'Practice job interviews with an AI-powered interviewer.',
    category: 'AI',
    icon: '💼',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Mock Interviewer',
    slug: 'mock-interviewer',
    description: 'Simulate real interview scenarios with instant feedback.',
    category: 'AI',
    icon: '🎤',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Password Generator',
    slug: 'password-generator',
    description: 'Generate strong, secure passwords instantly.',
    category: 'Security',
    icon: '🔐',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Price Tracker',
    slug: 'price-tracker',
    description: 'Track product prices across multiple online stores.',
    category: 'Utility',
    icon: '📈',
    status: 'active',
    usage: 0,
  },
  {
    name: 'QR Generator',
    slug: 'qr-generator',
    description: 'Generate QR codes for URLs, text, contacts, and more.',
    category: 'Utility',
    icon: '📱',
    status: 'active',
    usage: 0,
  },
  {
    name: 'QR Scanner',
    slug: 'qr-scanner',
    description: 'Scan and decode QR codes directly in your browser.',
    category: 'Utility',
    icon: '🔍',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Quote Generator',
    slug: 'quote-generator',
    description: 'Generate inspiring quotes powered by AI.',
    category: 'AI',
    icon: '💬',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Resume Reviewer',
    slug: 'resume-reviewer',
    description: 'AI-powered resume analysis with actionable feedback.',
    category: 'AI',
    icon: '📄',
    status: 'active',
    usage: 0,
  },
  {
    name: 'SWOT Analysis',
    slug: 'swot-analysis',
    description: 'AI-generated SWOT analysis for businesses and projects.',
    category: 'AI',
    icon: '📊',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Tip Calculator',
    slug: 'tip-calculator',
    description: 'Calculate tips and split bills easily.',
    category: 'Utility',
    icon: '🧾',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'Convert between units of length, weight, temperature, and more.',
    category: 'Utility',
    icon: '📏',
    status: 'active',
    usage: 0,
  },
  {
    name: 'URL Shortener',
    slug: 'url-shortener',
    description: 'Shorten long URLs and track click analytics.',
    category: 'Utility',
    icon: '🔗',
    status: 'active',
    usage: 0,
  },
  {
    name: 'Word Counter',
    slug: 'word-counter',
    description: 'Count words, characters, sentences, and reading time.',
    category: 'Utility',
    icon: '📝',
    status: 'active',
    usage: 0,
  },
];

// ---------------------------------------------------------------------------
// Users — all go into `authusers` collection
// ---------------------------------------------------------------------------
const USERS = [
  {
    username: 'ai_avishekdevnath',
    firstName: 'AI',
    lastName: 'Admin',
    email: 'ai@avishekdevnath.com',
    password: 'Ai@bubu#123',
    role: 'admin' as const,
    userType: 'admin' as const,
    subscriptionPlan: 'premium' as const,
  },
  {
    username: 'avishekdevnath',
    firstName: 'Avishek',
    lastName: 'Devnath',
    email: 'avishekdevnath@gmail.com',
    password: 'Ai@bubu#123',
    role: 'user' as const,
    userType: 'free' as const,
    subscriptionPlan: 'free' as const,
  },
  {
    username: 'pro_avishekdevnath',
    firstName: 'Pro',
    lastName: 'User',
    email: 'pro@avishekdevnath.com',
    password: 'Ai@bubu#123',
    role: 'user' as const,
    userType: 'pro' as const,
    subscriptionPlan: 'basic' as const,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env.local');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  // --- Drop collections ---
  console.log('🗑️  Dropping tools and authusers collections...');
  await db.collection('tools').drop().catch(() => {});
  await db.collection('authusers').drop().catch(() => {});

  // --- Seed tools ---
  console.log('🔧 Seeding tools...');
  const now = new Date();
  const toolDocs = TOOLS.map(t => ({ ...t, createdAt: now, updatedAt: now }));
  await db.collection('tools').insertMany(toolDocs);
  console.log(`  ✅ ${toolDocs.length} tools inserted.`);

  // --- Seed users into authusers ---
  console.log('👤 Seeding users into authusers...');
  for (const data of USERS) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    await db.collection('authusers').insertOne({
      username: data.username.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      userType: data.userType,
      subscription: {
        plan: data.subscriptionPlan,
        status: 'active',
        startDate: now,
        features: data.subscriptionPlan === 'premium' || data.userType === 'pro'
          ? ['basic_tools', 'ai_analysis', 'url_shortener', 'pro_tools']
          : ['basic_tools', 'ai_analysis', 'url_shortener'],
      },
      emailVerified: true,
      isActive: true,
      securityQuestions: [],
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✅ User created: ${data.email} (${data.role}, ${data.userType}, ${data.subscriptionPlan})`);
  }

  await mongoose.disconnect();
  console.log('🎉 Seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
