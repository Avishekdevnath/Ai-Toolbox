const fs = require('fs');
const path = require('path');

// List of all tracking API files that need to be fixed
const trackingAPIs = [
  'src/app/api/tools/swot-analysis/track-usage/route.ts',
  'src/app/api/tools/finance-advisor/track-usage/route.ts',
  'src/app/api/tools/diet-planner/track-usage/route.ts',
  'src/app/api/tools/price-tracker/track-usage/route.ts',
  'src/app/api/tools/age-calculator/track-usage/route.ts',
  'src/app/api/tools/quote-generator/track-usage/route.ts',
  'src/app/api/tools/resume-reviewer/track-usage/route.ts',
  'src/app/api/tools/mock-interviewer/track-usage/route.ts',
  'src/app/api/tools/job-interviewer/track-usage/route.ts',
  'src/app/api/tools/qr-generator/track-usage/route.ts',
  'src/app/api/tools/password-generator/track-usage/route.ts',
  'src/app/api/tools/tip-calculator/track-usage/route.ts',
  'src/app/api/tools/word-counter/track-usage/route.ts',
  'src/app/api/tools/unit-converter/track-usage/route.ts',
  'src/app/api/tools/url-shortener/track-usage/route.ts'
];

function fixTrackingCollection(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace 'tool_usage' with 'toolusages' to match the ToolUsage model
    const updatedContent = content.replace(
      /db\.collection\('tool_usage'\)/g,
      "db.collection('toolusages')"
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed collection name in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed in ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing tracking API collection names...\n');

let fixedCount = 0;
let totalCount = trackingAPIs.length;

trackingAPIs.forEach(filePath => {
  if (fixTrackingCollection(filePath)) {
    fixedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixedCount}/${totalCount} files`);
console.log(`ℹ️  No changes needed: ${totalCount - fixedCount} files`);

if (fixedCount > 0) {
  console.log('\n🎉 Collection names have been fixed!');
  console.log('📝 All tracking APIs now use the correct "toolusages" collection.');
} else {
  console.log('\nℹ️  All files already have the correct collection names.');
} 