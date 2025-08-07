const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOOLS = [
  'swot-analysis',
  'finance-advisor', 
  'diet-planner',
  'price-tracker',
  'age-calculator',
  'quote-generator',
  'resume-reviewer',
  'mock-interviewer',
  'job-interviewer',
  'qr-generator',
  'password-generator',
  'tip-calculator',
  'word-counter',
  'unit-converter',
  'url-shortener'
];

// Check if tracking APIs exist
function checkTrackingAPIs() {
  console.log('🔍 Checking tracking API endpoints...\n');
  
  const missingAPIs = [];
  const existingAPIs = [];
  
  TEST_TOOLS.forEach(tool => {
    const apiPath = `src/app/api/tools/${tool}/track-usage/route.ts`;
    const fullPath = path.join(process.cwd(), apiPath);
    
    if (fs.existsSync(fullPath)) {
      existingAPIs.push(tool);
      console.log(`✅ ${tool} - API exists`);
    } else {
      missingAPIs.push(tool);
      console.log(`❌ ${tool} - API missing`);
    }
  });
  
  console.log(`\n📊 API Status: ${existingAPIs.length}/${TEST_TOOLS.length} APIs exist`);
  
  if (missingAPIs.length > 0) {
    console.log(`\n❌ Missing APIs: ${missingAPIs.join(', ')}`);
  }
  
  return { existingAPIs, missingAPIs };
}

// Check if tool components have tracking calls
function checkComponentTracking() {
  console.log('\n🔍 Checking component tracking calls...\n');
  
  const componentMap = {
    'swot-analysis': 'src/components/tools/SwotAnalysisTool.tsx',
    'finance-advisor': 'src/components/tools/finance/index.tsx',
    'diet-planner': 'src/components/tools/DietPlannerTool.tsx',
    'price-tracker': 'src/components/tools/ProductPriceTrackerTool.tsx',
    'age-calculator': 'src/components/tools/AgeCalculatorTool.tsx',
    'quote-generator': 'src/components/tools/QuoteGeneratorTool.tsx',
    'resume-reviewer': 'src/components/resume/ResumeReviewerTool.tsx',
    'mock-interviewer': 'src/components/interview/MockInterviewerTool.tsx',
    'job-interviewer': 'src/components/interview/JobInterviewerTool.tsx',
    'qr-generator': 'src/components/tools/QRGeneratorTool.tsx',
    'password-generator': 'src/components/tools/PasswordGeneratorTool.tsx',
    'tip-calculator': 'src/components/tools/TipCalculatorTool.tsx',
    'word-counter': 'src/components/tools/WordCounterTool.tsx',
    'unit-converter': 'src/components/tools/UnitConverterTool.tsx',
    'url-shortener': 'src/components/tools/URLShortenerTool.tsx'
  };
  
  const componentsWithTracking = [];
  const componentsWithoutTracking = [];
  
  Object.entries(componentMap).forEach(([tool, componentPath]) => {
    const fullPath = path.join(process.cwd(), componentPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  ${tool} - Component file not found: ${componentPath}`);
      componentsWithoutTracking.push(tool);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const trackingPattern = `fetch('/api/tools/${tool}/track-usage'`;
    
    if (content.includes(trackingPattern)) {
      componentsWithTracking.push(tool);
      console.log(`✅ ${tool} - Tracking call found`);
    } else {
      componentsWithoutTracking.push(tool);
      console.log(`❌ ${tool} - No tracking call found`);
    }
  });
  
  console.log(`\n📊 Component Status: ${componentsWithTracking.length}/${TEST_TOOLS.length} components have tracking`);
  
  if (componentsWithoutTracking.length > 0) {
    console.log(`\n❌ Components without tracking: ${componentsWithoutTracking.join(', ')}`);
  }
  
  return { componentsWithTracking, componentsWithoutTracking };
}

// Generate summary report
function generateReport(apiResults, componentResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TOOL TRACKING IMPLEMENTATION REPORT');
  console.log('='.repeat(60));
  
  const totalTools = TEST_TOOLS.length;
  const apisExist = apiResults.existingAPIs.length;
  const componentsTracked = componentResults.componentsWithTracking.length;
  
  console.log(`\n📊 Overall Status:`);
  console.log(`   • Total Tools: ${totalTools}`);
  console.log(`   • APIs Created: ${apisExist}/${totalTools} (${Math.round(apisExist/totalTools*100)}%)`);
  console.log(`   • Components Tracked: ${componentsTracked}/${totalTools} (${Math.round(componentsTracked/totalTools*100)}%)`);
  
  const fullyImplemented = apiResults.existingAPIs.filter(tool => 
    componentResults.componentsWithTracking.includes(tool)
  );
  
  console.log(`   • Fully Implemented: ${fullyImplemented.length}/${totalTools} (${Math.round(fullyImplemented.length/totalTools*100)}%)`);
  
  if (fullyImplemented.length === totalTools) {
    console.log('\n🎉 ALL TOOLS HAVE COMPLETE TRACKING IMPLEMENTATION!');
  } else {
    console.log('\n⚠️  SOME TOOLS NEED ATTENTION:');
    
    const missingAPIs = apiResults.missingAPIs;
    const missingTracking = componentResults.componentsWithoutTracking;
    
    if (missingAPIs.length > 0) {
      console.log(`   • Missing APIs: ${missingAPIs.join(', ')}`);
    }
    
    if (missingTracking.length > 0) {
      console.log(`   • Missing Component Tracking: ${missingTracking.join(', ')}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
console.log('🧪 Testing Tool Tracking Implementation...\n');

const apiResults = checkTrackingAPIs();
const componentResults = checkComponentTracking();
generateReport(apiResults, componentResults); 