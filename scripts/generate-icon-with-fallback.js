#!/usr/bin/env node

require('dotenv/config');
const { spawn } = require('child_process');
const { join } = require('path');

// Get script directory for relative imports
// Note: __filename and __dirname are available in CommonJS by default

/**
 * Icon Generation Script with Fallback Strategy
 * 
 * This script attempts to generate icons using multiple fallback strategies:
 * 1. First try: Gemini AI icon generation (generate-gemini-icon.js)
 * 2. Final fallback: Screenshot-based icons (generate-screenshots-with-resize.js)
 * 
 * Usage:
 *   node scripts/generate-icon-with-fallback.js
 */

/**
 * Execute a script and return a promise that resolves/rejects based on exit code
 * @param {string} scriptPath - Path to the script to execute
 * @param {string} scriptName - Display name for logging
 * @returns {Promise<void>} - Resolves if script succeeds, rejects if it fails
 */
function executeScript(scriptPath, scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting ${scriptName}...`);
    console.log(`📄 Script: ${scriptPath}`);
    
    const scriptProcess = spawn("node", [scriptPath], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    scriptProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully!`);
        resolve();
      } else {
        console.error(`❌ ${scriptName} failed with exit code ${code}`);
        reject(new Error(`${scriptName} failed with exit code ${code}`));
      }
    });

    scriptProcess.on("error", (error) => {
      console.error(`❌ Failed to start ${scriptName}:`, error.message);
      reject(error);
    });
  });
}

/**
 * Main function that implements the fallback strategy
 */
async function generateIconWithFallback() {
  const startTime = Date.now();
  
  console.log("🎨 Icon Generation with Fallback Strategy");
  console.log("=" .repeat(50));
  console.log("Strategy:");
  console.log("1️⃣  Try Gemini AI icon generation");
  console.log("2️⃣  Final fallback to screenshot-based icons");
  console.log("=" .repeat(50));

  const scripts = [
    {
      path: join(__dirname, "generate-gemini-icon.js"),
      name: "Gemini AI Icon Generation", 
      description: "AI-generated icons using Gemini model"
    },
    {
      path: join(__dirname, "generate-screenshots-with-resize.js"),
      name: "Screenshot-based Icon Generation",
      description: "Icons generated from website screenshots"
    }
  ];

  let successfulScript = null;
  let errors = [];

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    
    try {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🔄 Attempt ${i + 1}/${scripts.length}: ${script.name}`);
      console.log(`📝 ${script.description}`);
      console.log(`${"=".repeat(60)}`);
      
      await executeScript(script.path, script.name);
      
      successfulScript = script;
      console.log(`\n🎉 SUCCESS! ${script.name} completed successfully!`);
      break;
      
    } catch (error) {
      errors.push({
        script: script.name,
        error: error.message,
        attempt: i + 1
      });
      
      console.error(`\n💥 ${script.name} failed: ${error.message}`);
      
      // If this isn't the last script, show fallback message
      if (i < scripts.length - 1) {
        const nextScript = scripts[i + 1];
        console.log(`\n⏭️  Falling back to: ${nextScript.name}`);
        console.log(`   ${nextScript.description}`);
      }
    }
  }

  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(1);

  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 FINAL RESULTS");
  console.log(`${"=".repeat(60)}`);

  if (successfulScript) {
    console.log(`✅ Icon generation completed successfully!`);
    console.log(`🎯 Method used: ${successfulScript.name}`);
    console.log(`⏱️  Total time: ${totalDuration}s`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Previous attempts that failed:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.script}: ${error.error}`);
      });
    }
  } else {
    console.log(`❌ All icon generation methods failed!`);
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`\n📋 Error Summary:`);
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.script}:`);
      console.log(`      ${error.error}`);
    });
    
    throw new Error("All icon generation methods failed. Please check the logs above for details.");
  }
}

// Run the script when executed directly
if (require.main === module) {
  generateIconWithFallback().catch((error) => {
    console.error("\n💥 Icon generation failed completely:");
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { generateIconWithFallback, executeScript };
