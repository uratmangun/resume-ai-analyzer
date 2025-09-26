#!/usr/bin/env node

require('dotenv/config');
const { join } = require('path');
const {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} = require('fs');

// Get script directory for relative imports
// Note: __filename and __dirname are available in CommonJS by default

/**
 * Screenshot Generation Script for Farcaster Mini Apps
 *
 * This script generates:
 * - Embed: Screenshot (768x512px viewport)
 * Environment variables are automatically loaded from .env file using dotenv.
 *
 * Usage:
 *   node scripts/generate-screenshots.js
 *   NEXT_PUBLIC_APP_DOMAIN=your-domain.ngrok.app node scripts/generate-screenshots.js
 */

// Generation delays (in seconds)
const GENERATION_DELAYS = {
  betweenImages: 2, // Delay between each screenshot
  initialWait: 0, // Initial wait before starting generation
};

// Screenshot configuration
const SCREENSHOT_CONFIG = {
  baseUrl: process.env.BROWSERLESS_API_URL,
  delay: 2, // seconds between screenshots
};

/**
 * Sleep utility function to add delays between API calls
 * @param {number} seconds - Number of seconds to wait
 */
async function sleep(seconds) {
  if (seconds > 0) {
    console.log(`⏳ Waiting ${seconds}s to respect rate limits...`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}

/**
 * Ensure URL has proper protocol
 * @param {string} url - URL to check
 * @returns {string} - URL with https:// protocol
 */
function ensureProtocol(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

// Screenshot viewport dimensions (larger for better quality)
const SCREENSHOT_VIEWPORTS = {
  embed: {
    width: 768, // 3:2 ratio, multiple of 16
    height: 512,
  },
};

/**
 * Take a screenshot using the browserless API
 * @param {string} url - URL to screenshot
 * @param {Object} viewport - Viewport dimensions {width, height}
 * @param {string} filename - The output filename
 * @returns {Promise<string>} - The generated screenshot filename
 */
async function takeScreenshot(url, viewport, filename) {
  console.log(
    `📸 Taking screenshot with viewport ${viewport.width}x${viewport.height}...`,
  );

  try {
    const fullUrl = ensureProtocol(url);
    console.log(`🔗 Using browserless API: ${SCREENSHOT_CONFIG.baseUrl}`);

    // Prepare request body
    const requestBody = {
      url: fullUrl+"?skip=true",
      setExtraHTTPHeaders: {
        "ngrok-skip-browser-warning": "true"
      },
      gotoOptions: { waitUntil: "networkidle2" },
      viewport: viewport,
   
    };

    console.log(`📋 Request options: ${JSON.stringify(requestBody, null, 2)}`);

    // Make API request
    const apiUrl = `${SCREENSHOT_CONFIG.baseUrl}/screenshot?token=dawdawdwa`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    // Check if response is actually an image
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      const errorText = await response.text();
      throw new Error(
        `Expected image response, got ${contentType}\n${errorText}`,
      );
    }

    // Get image data and save directly to images directory
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const outputDir = join(process.cwd(), "public", "images");

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = join(outputDir, filename);
    writeFileSync(outputPath, imageBuffer);

    console.log(
      `✅ Screenshot saved: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`,
    );
    return filename;
  } catch (error) {
    console.error("❌ Screenshot failed:", error.message);
    throw error;
  }
}

/**
 * Generate timestamp-based filename
 * @param {string} type - The image type (embed, splash)
 * @param {string} prefix - The filename prefix (screenshot)
 * @returns {string} - The generated filename
 */
function generateFilename(type, prefix = "screenshot") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${type}-${timestamp}.png`;
}

/**
 * Clears all existing screenshot images from the public/images directory
 */
function clearExistingScreenshots() {
  const imagesDir = join(process.cwd(), "public/images");

  if (!existsSync(imagesDir)) {
    return;
  }

  const files = readdirSync(imagesDir);
  const screenshotFiles = files.filter(
    (file) => file.startsWith("screenshot-embed-") && file.endsWith(".png"),
  );

  if (screenshotFiles.length > 0) {
    console.log("🗑️  Clearing existing screenshot images...");
    screenshotFiles.forEach((file) => {
      const filePath = join(imagesDir, file);
      try {
        unlinkSync(filePath);
        console.log(`   Deleted: ${file}`);
      } catch (error) {
        console.warn(`   Failed to delete: ${file}`);
      }
    });
  }
}

/**
 * Generate a single screenshot with specific viewport
 * @param {string} url - The URL to screenshot
 * @param {Object} viewport - The viewport dimensions {width, height}
 * @param {string} type - The image type (embed, splash)
 * @returns {Promise<Object>} - The screenshot result with filename
 */
async function generateSingleScreenshot(url, viewport, type) {
  const startTime = Date.now();
  console.log(
    `\n📸 Taking ${type} screenshot (${viewport.width}x${viewport.height})...`,
  );
  console.log(`🌐 URL: ${url}`);

  try {
    const filename = generateFilename(type, "screenshot");
    await takeScreenshot(url, viewport, filename);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`✅ Generated ${type} screenshot in ${duration}s: ${filename}`);
    return { filename: filename };
  } catch (error) {
    console.error(`❌ Failed to generate ${type} screenshot:`, error.message);
    throw error;
  }
}

/**
 * Generate a screenshot with retry logic
 * @param {string} url - The URL to screenshot
 * @param {Object} viewport - The viewport dimensions {width, height}
 * @param {string} type - The image type (embed, splash)
 * @param {number} maxAttempts - Maximum number of retry attempts (default: 3)
 * @param {number} retryDelaySeconds - Delay between retries in seconds (default: 5)
 * @returns {Promise<Object>} - The screenshot result with filename or error summary
 */
async function generateScreenshotWithRetry(
  url,
  viewport,
  type,
  maxAttempts = 3,
  retryDelaySeconds = 5,
) {
  const failures = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(
      `\n🔄 Attempt ${attempt}/${maxAttempts} for ${type} screenshot`,
    );

    try {
      const result = await generateSingleScreenshot(url, viewport, type);

      if (attempt > 1) {
        console.log(`🎉 Screenshot successful on attempt ${attempt}!`);
      }

      return {
        success: true,
        result: result,
        attempts: attempt,
        failures: failures,
      };
    } catch (error) {
      const failureInfo = {
        attempt: attempt,
        timestamp: timestamp,
        error: error.message,
        type: type,
        viewport: `${viewport.width}x${viewport.height}`,
      };

      failures.push(failureInfo);

      console.error(
        `❌ Attempt ${attempt}/${maxAttempts} failed at ${timestamp}:`,
      );
      console.error(`   Error: ${error.message}`);
      console.error(`   Type: ${type} (${viewport.width}x${viewport.height})`);

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${retryDelaySeconds} seconds before retry...`);
        await sleep(retryDelaySeconds);
      } else {
        console.error(
          `💥 All ${maxAttempts} attempts failed for ${type} screenshot`,
        );
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    result: null,
    attempts: maxAttempts,
    failures: failures,
  };
}

/**
 * Updates the farcaster.json file with the screenshot URLs
 * @param {string} domain - The NEXT_PUBLIC_APP_DOMAIN to use
 * @param {object} screenshotFilenames - Object containing filenames for embed and splash screenshots
 */
function updateFarcasterConfig(domain, screenshotFilenames) {
  try {
    const configPath = join(process.cwd(), "public/.well-known/farcaster.json");

    if (!existsSync(configPath)) {
      console.warn(
        "⚠️  Warning: farcaster.json file not found, skipping update",
      );
      return;
    }

    const configContent = readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);

    // Update screenshot URLs with the provided domain
    const baseUrl = `https://${domain}`;

    if (config.miniapp) {
      if (screenshotFilenames.embed) {
        config.miniapp.imageUrl = `${baseUrl}/images/${screenshotFilenames.embed}`;
      }

      // Update home URL to match domain
      config.miniapp.homeUrl = baseUrl;
      config.miniapp.webhookUrl = `${baseUrl}/api/webhook`;
    }

    // Write updated config
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(
      "✅ Updated farcaster.json with new screenshot URLs and domain",
    );
  } catch (error) {
    console.error("❌ Error updating farcaster.json:", error.message);
  }
}

/**
 * Main screenshot generation function
 */
async function generateScreenshots() {
  try {
    // Check for app domain (required for screenshots)
    const appDomain = process.env.SCREENSHOT_URL;
    if (!appDomain) {
      console.error("❌ Error: SCREENSHOT_URL is not set.");
      console.error("   Please add your app domain to your .env file.");
      console.error("   Example: SCREENSHOT_URL=your-domain.ngrok.app");
      process.exit(1);
    }

    // Check for browserless API URL
    if (!SCREENSHOT_CONFIG.baseUrl) {
      console.error("❌ Error: BROWSERLESS_API_URL is not set.");
      console.error(
        "   Please add your browserless API URL to your .env file.",
      );
      process.exit(1);
    }

    console.log("📸 Screenshot Generator for Farcaster Mini Apps");
    console.log(`🌐 Taking screenshots of: ${appDomain}`);

    console.log("\n🎯 Generating screenshots for your Mini App...");
    console.log("   📱 Embed: Screenshot (768x512px viewport)");

    // Clear existing screenshots
    clearExistingScreenshots();

    console.log(`\n📝 Generation Parameters:`);
    console.log("=".repeat(50));
    console.log(`🔗 Screenshot URL: ${appDomain}`);
    console.log(
      `🖼️  Embed: ${SCREENSHOT_VIEWPORTS.embed.width}x${SCREENSHOT_VIEWPORTS.embed.height}px (Screenshot)`,
    );
    console.log("=".repeat(50));

    console.log("\n⏳ Generating images with retry logic...");
    const overallStartTime = Date.now();

    // Generate screenshots with retry logic (3 attempts, 5-second delay)
    const embedResult = await generateScreenshotWithRetry(
      appDomain,
      SCREENSHOT_VIEWPORTS.embed,
      "embed",
    );

    // Check results and handle failures
    const successfulScreenshots = {};
    const allFailures = [];

    if (embedResult.success) {
      successfulScreenshots.embed = embedResult.result.filename;
      console.log(
        `✅ Embed screenshot succeeded after ${embedResult.attempts} attempt(s)`,
      );
    } else {
      console.error(
        `💥 Embed screenshot failed after ${embedResult.attempts} attempts`,
      );
      allFailures.push(...embedResult.failures);
    }

    const overallEndTime = Date.now();
    const totalDuration = ((overallEndTime - overallStartTime) / 1000).toFixed(
      1,
    );

    // Print final results
    if (embedResult.success) {
      // Successful - update config and show success
      updateFarcasterConfig(
        process.env.NEXT_PUBLIC_APP_DOMAIN,
        successfulScreenshots,
      );

      console.log("\n🎉 Screenshot generation complete!");
      console.log(`   📁 Embed: public/images/${successfulScreenshots.embed}`);
      console.log(`   ⏱️  Total time: ${totalDuration}s`);
      console.log("   ✅ Updated: public/.well-known/farcaster.json");
    } else if (Object.keys(successfulScreenshots).length > 0) {
      // Partial success
      updateFarcasterConfig(
        process.env.NEXT_PUBLIC_APP_DOMAIN,
        successfulScreenshots,
      );

      console.log("\n⚠️  Partial screenshot generation complete:");
      Object.entries(successfulScreenshots).forEach(([type, filename]) => {
        console.log(`   ✅ ${type}: public/images/${filename}`);
      });
      console.log(`   ⏱️  Total time: ${totalDuration}s`);
      console.log("   ✅ Updated: public/.well-known/farcaster.json (partial)");

      // Show failure summary
      console.log("\n💥 Failures summary:");
      allFailures.forEach((failure) => {
        console.log(
          `   ❌ ${failure.type} attempt ${failure.attempt} at ${failure.timestamp}:`,
        );
        console.log(`      ${failure.error}`);
      });
    } else {
      // Complete failure
      console.log("\n💥 Screenshot generation failed completely!");
      console.log(`   ⏱️  Total time: ${totalDuration}s`);
      console.log("\n📋 Complete failure summary:");
      allFailures.forEach((failure) => {
        console.log(
          `   ❌ ${failure.type} (${failure.viewport}) attempt ${failure.attempt} at ${failure.timestamp}:`,
        );
        console.log(`      ${failure.error}`);
      });

      throw new Error(
        "All screenshot generation attempts failed. See detailed logs above.",
      );
    }
  } catch (error) {
    console.error("\n❌ Error generating screenshots:");
    console.error("💥", error.message);
    process.exit(1);
  }
}

// Run the script when executed directly
if (require.main === module) {
  generateScreenshots().catch(console.error);
}

module.exports = {
  generateSingleScreenshot,
  generateScreenshotWithRetry,
  takeScreenshot,
  clearExistingScreenshots,
  updateFarcasterConfig,
  generateScreenshots,
};
