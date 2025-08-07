#!/usr/bin/env node

/**
 * Project Checklist Updater
 * Senior SDE Level Project Management Tool
 * 
 * Usage: node scripts/update-checklist.js [command]
 * Commands:
 *   - update-progress: Update progress percentages
 *   - add-task: Add a new task
 *   - mark-complete: Mark a task as complete
 *   - generate-report: Generate progress report
 */

const fs = require('fs');
const path = require('path');

const CHECKLIST_PATH = path.join(__dirname, '..', 'PROJECT_CHECKLIST.txt');

// Utility functions
function readChecklist() {
  try {
    return fs.readFileSync(CHECKLIST_PATH, 'utf8');
  } catch (error) {
    console.error('❌ Error reading checklist:', error.message);
    process.exit(1);
  }
}

function writeChecklist(content) {
  try {
    fs.writeFileSync(CHECKLIST_PATH, content);
    console.log('✅ Checklist updated successfully');
  } catch (error) {
    console.error('❌ Error writing checklist:', error.message);
    process.exit(1);
  }
}

function updateProgress() {
  const content = readChecklist();
  
  // Update last modified date
  const updatedContent = content.replace(
    /Last Updated: \d{4}-\d{2}-\d{2}/,
    `Last Updated: ${new Date().toISOString().split('T')[0]}`
  );
  
  writeChecklist(updatedContent);
  console.log('📅 Updated last modified date');
}

function addTask(taskType, description) {
  const content = readChecklist();
  const taskLine = `- [🔴] ${description}`;
  
  let updatedContent;
  switch (taskType.toLowerCase()) {
    case 'critical':
      updatedContent = content.replace(
        /## 🔴 CRITICAL ISSUES \(IMMEDIATE ATTENTION\)\n/,
        `## 🔴 CRITICAL ISSUES (IMMEDIATE ATTENTION)\n- [🔴] ${description}\n`
      );
      break;
    case 'pending':
      updatedContent = content.replace(
        /## 🔴 PENDING TASKS\n/,
        `## 🔴 PENDING TASKS\n- [🔴] ${description}\n`
      );
      break;
    default:
      console.error('❌ Invalid task type. Use: critical, pending');
      process.exit(1);
  }
  
  writeChecklist(updatedContent);
  console.log(`✅ Added ${taskType} task: ${description}`);
}

function markComplete(description) {
  const content = readChecklist();
  const updatedContent = content.replace(
    new RegExp(`- \\[🔴\\] ${description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    `- [✅] ${description}`
  );
  
  writeChecklist(updatedContent);
  console.log(`✅ Marked as complete: ${description}`);
}

function generateReport() {
  const content = readChecklist();
  
  // Count tasks by status
  const completed = (content.match(/- \[✅\]/g) || []).length;
  const inProgress = (content.match(/- \[🟡\]/g) || []).length;
  const notStarted = (content.match(/- \[🔴\]/g) || []).length;
  const total = completed + inProgress + notStarted;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  console.log('\n📊 PROJECT PROGRESS REPORT');
  console.log('========================');
  console.log(`✅ Completed: ${completed}`);
  console.log(`🟡 In Progress: ${inProgress}`);
  console.log(`🔴 Not Started: ${notStarted}`);
  console.log(`📈 Overall Progress: ${progress}%`);
  console.log(`📅 Last Updated: ${new Date().toISOString().split('T')[0]}`);
  
  // Extract critical issues
  const criticalMatch = content.match(/## 🔴 CRITICAL ISSUES.*?(?=## |$)/s);
  if (criticalMatch) {
    const criticalIssues = criticalMatch[0].match(/- \[🔴\].*/g) || [];
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`  ${issue.replace('- [🔴] ', '')}`);
      });
    }
  }
}

// Main execution
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'update-progress':
    updateProgress();
    break;
  case 'add-task':
    if (args.length < 2) {
      console.error('❌ Usage: node scripts/update-checklist.js add-task <type> <description>');
      process.exit(1);
    }
    addTask(args[0], args.slice(1).join(' '));
    break;
  case 'mark-complete':
    if (args.length < 1) {
      console.error('❌ Usage: node scripts/update-checklist.js mark-complete <description>');
      process.exit(1);
    }
    markComplete(args.join(' '));
    break;
  case 'generate-report':
    generateReport();
    break;
  default:
    console.log(`
🎯 Project Checklist Manager
============================

Usage: node scripts/update-checklist.js [command]

Commands:
  update-progress              Update last modified date
  add-task <type> <desc>      Add new task (type: critical, pending)
  mark-complete <desc>        Mark task as complete
  generate-report             Generate progress report

Examples:
  node scripts/update-checklist.js add-task critical "Fix build errors"
  node scripts/update-checklist.js mark-complete "Fix build errors"
  node scripts/update-checklist.js generate-report
    `);
}

console.log('\n📝 Remember to commit your changes!'); 