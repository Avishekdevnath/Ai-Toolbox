const fs = require('fs');
const path = require('path');

// Tool configurations with their slugs and names
const tools = [
  { slug: 'swot-analysis', name: 'SWOT Analysis' },
  { slug: 'finance-advisor', name: 'Finance Advisor' },
  { slug: 'diet-planner', name: 'Diet Planner' },
  { slug: 'price-tracker', name: 'Price Tracker' },
  { slug: 'age-calculator', name: 'Age Calculator' },
  { slug: 'quote-generator', name: 'Quote Generator' },
  { slug: 'resume-reviewer', name: 'Resume Reviewer' },
  { slug: 'mock-interviewer', name: 'Mock Interviewer' },
  { slug: 'job-interviewer', name: 'Job Interviewer' },
  { slug: 'qr-generator', name: 'QR Code Generator' },
  { slug: 'password-generator', name: 'Password Generator' },
  { slug: 'tip-calculator', name: 'Tip Calculator' },
  { slug: 'word-counter', name: 'Word Counter' },
  { slug: 'unit-converter', name: 'Unit Converter' },
  { slug: 'url-shortener', name: 'URL Shortener' }
];

function generateTrackingAPI(tool) {
  return `import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Create a new usage record that matches the ToolUsage model schema
    await db.collection('toolusages').insertOne({
      userId: 'anonymous', // For now, use anonymous since we don't have user auth
      toolSlug: '${tool.slug}',
      toolName: '${tool.name}',
      usageType: 'generate',
      metadata: {
        action: 'generate_${tool.slug.replace('-', '_')}',
        timestamp: new Date()
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
}`;
}

function fixTrackingAPI(tool) {
  const filePath = `src/app/api/tools/${tool.slug}/track-usage/route.ts`;
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const newContent = generateTrackingAPI(tool);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed tracking structure in ${filePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing tracking API document structure...\n');

let fixedCount = 0;
let totalCount = tools.length;

tools.forEach(tool => {
  if (fixTrackingAPI(tool)) {
    fixedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixedCount}/${totalCount} tracking APIs`);
console.log(`ℹ️  Failed: ${totalCount - fixedCount} files`);

if (fixedCount > 0) {
  console.log('\n🎉 Tracking APIs have been fixed!');
  console.log('📝 All tracking APIs now create documents that match the ToolUsage model schema.');
  console.log('🔍 The admin dashboard should now show usage data correctly.');
} else {
  console.log('\n❌ No files were updated. Please check the file paths.');
} 