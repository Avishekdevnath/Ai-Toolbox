const fs = require('fs');
const path = require('path');

// Tool configurations
const tools = [
  { slug: 'swot-analysis', name: 'SWOT Analysis', action: 'generate_swot_analysis' },
  { slug: 'finance-advisor', name: 'Finance Advisor', action: 'generate_finance_advice' },
  { slug: 'diet-planner', name: 'Diet Planner', action: 'generate_diet_plan' },
  { slug: 'price-tracker', name: 'Price Tracker', action: 'track_price' },
  { slug: 'age-calculator', name: 'Age Calculator', action: 'calculate_age' },
  { slug: 'quote-generator', name: 'Quote Generator', action: 'generate_quote' },
  { slug: 'resume-reviewer', name: 'Resume Reviewer', action: 'review_resume' },
  { slug: 'mock-interviewer', name: 'Mock Interviewer', action: 'start_mock_interview' },
  { slug: 'job-interviewer', name: 'Job Interviewer', action: 'start_job_interview' },
  { slug: 'qr-generator', name: 'QR Code Generator', action: 'generate_qr' },
  { slug: 'password-generator', name: 'Password Generator', action: 'generate_password' },
  { slug: 'tip-calculator', name: 'Tip Calculator', action: 'calculate_tip' },
  { slug: 'word-counter', name: 'Word Counter', action: 'count_words' },
  { slug: 'unit-converter', name: 'Unit Converter', action: 'convert_units' },
  { slug: 'url-shortener', name: 'URL Shortener', action: 'shorten_url' }
];

function generateEnhancedTrackingAPI(tool) {
  return `import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEnhancedUserId } from '@/lib/userTracking';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const userId = getEnhancedUserId(request);
    
    // Create a new usage record that matches the ToolUsage model schema
    await db.collection('toolusages').insertOne({
      userId: userId,
      toolSlug: '${tool.slug}',
      toolName: '${tool.name}',
      usageType: 'generate',
      metadata: {
        action: '${tool.action}',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        userAgent: request.headers.get('user-agent') || ''
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
}`;
}

function updateTrackingAPI(tool) {
  const filePath = `src/app/api/tools/${tool.slug}/track-usage/route.ts`;
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const newContent = generateEnhancedTrackingAPI(tool);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated user tracking in ${filePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Updating all tracking APIs with enhanced user tracking...\n');

let updatedCount = 0;
let totalCount = tools.length;

tools.forEach(tool => {
  if (updateTrackingAPI(tool)) {
    updatedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Updated: ${updatedCount}/${totalCount} tracking APIs`);
console.log(`ℹ️  Failed: ${totalCount - updatedCount} files`);

if (updatedCount > 0) {
  console.log('\n🎉 Enhanced user tracking has been implemented!');
  console.log('📝 All tracking APIs now use:');
  console.log('   - IP address + User Agent based user identification');
  console.log('   - Consistent user IDs across sessions');
  console.log('   - Enhanced metadata tracking');
  console.log('   - Better unique user counting in admin dashboard');
} else {
  console.log('\n❌ No files were updated. Please check the file paths.');
} 