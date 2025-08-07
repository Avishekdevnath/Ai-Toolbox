const fs = require('fs');
const path = require('path');

// List of tools that need tracking added
const toolsToUpdate = [
  {
    name: 'AgeCalculatorTool',
    file: 'src/components/tools/AgeCalculatorTool.tsx',
    trackingPoint: 'calculateAge',
    trackingCall: `// Track usage
        fetch('/api/tools/age-calculator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'QuoteGeneratorTool',
    file: 'src/components/tools/QuoteGeneratorTool.tsx',
    trackingPoint: 'generateQuote',
    trackingCall: `// Track usage
        fetch('/api/tools/quote-generator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'ResumeReviewerTool',
    file: 'src/components/resume/ResumeReviewerTool.tsx',
    trackingPoint: 'analyzeResume',
    trackingCall: `// Track usage
        fetch('/api/tools/resume-reviewer/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'MockInterviewerTool',
    file: 'src/components/interview/MockInterviewerTool.tsx',
    trackingPoint: 'startInterview',
    trackingCall: `// Track usage
        fetch('/api/tools/mock-interviewer/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'JobInterviewerTool',
    file: 'src/components/interview/JobInterviewerTool.tsx',
    trackingPoint: 'startInterview',
    trackingCall: `// Track usage
        fetch('/api/tools/job-interviewer/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'QRGeneratorTool',
    file: 'src/components/tools/QRGeneratorTool.tsx',
    trackingPoint: 'generateQR',
    trackingCall: `// Track usage
        fetch('/api/tools/qr-generator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'PasswordGeneratorTool',
    file: 'src/components/tools/PasswordGeneratorTool.tsx',
    trackingPoint: 'generatePassword',
    trackingCall: `// Track usage
        fetch('/api/tools/password-generator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'TipCalculatorTool',
    file: 'src/components/tools/TipCalculatorTool.tsx',
    trackingPoint: 'calculateTip',
    trackingCall: `// Track usage
        fetch('/api/tools/tip-calculator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  },
  {
    name: 'WordCounterTool',
    file: 'src/components/tools/WordCounterTool.tsx',
    trackingPoint: 'analyzeText',
    trackingCall: `// Track usage
        fetch('/api/tools/word-counter/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });`
  }
];

function addTrackingToFile(tool) {
  try {
    const filePath = path.join(process.cwd(), tool.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${tool.file}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if tracking is already added
    if (content.includes('/api/tools/')) {
      console.log(`✅ Tracking already exists in ${tool.name}`);
      return true;
    }
    
    // Find the function that needs tracking
    const functionRegex = new RegExp(`(const\\s+${tool.trackingPoint}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*{[^}]*})`, 's');
    const match = content.match(functionRegex);
    
    if (!match) {
      console.log(`⚠️  Function ${tool.trackingPoint} not found in ${tool.name}`);
      return false;
    }
    
    // Add tracking call before the closing brace of the function
    const updatedFunction = match[1].replace(
      /}$/,
      `  ${tool.trackingCall}\n}`
    );
    
    content = content.replace(match[1], updatedFunction);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added tracking to ${tool.name}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating ${tool.name}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🛠️  Adding tracking to tool components...\n');

let successCount = 0;
let totalCount = toolsToUpdate.length;

toolsToUpdate.forEach(tool => {
  if (addTrackingToFile(tool)) {
    successCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Successfully updated: ${successCount}/${totalCount} tools`);
console.log(`❌ Failed: ${totalCount - successCount} tools`);

if (successCount === totalCount) {
  console.log('\n🎉 All tool tracking has been successfully implemented!');
} else {
  console.log('\n⚠️  Some tools may need manual tracking implementation.');
} 