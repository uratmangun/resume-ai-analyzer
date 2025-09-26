#!/usr/bin/env node

require('dotenv/config');
const Together = require('together-ai');
const { Jimp } = require('jimp');
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
 * Flux Icon Generation Script for Farcaster Mini Apps
 *
 * This script generates AI-powered icons using the Flux API.
 * Environment variables are automatically loaded from .env file using dotenv.
 *
 * Usage:
 *   node scripts/generate-flux-icon.js
 *   node scripts/generate-flux-icon.js [prompt]
 */

// Flux API configuration
const FLUX_MODEL = {
  id: "black-forest-labs/FLUX.1-schnell-Free",
  displayName: "FLUX.1-schnell (Free)",
  defaultSteps: 4, // Fast generation with good quality
};

// Icon dimensions (square format, optimized for Farcaster)
const ICON_DIMENSIONS = {
  width: 208,
  height: 208,
};

// Splash dimensions (square format, 200x200 for Farcaster splash)
const SPLASH_DIMENSIONS = {
  width: 200,
  height: 200,
};

/**
 * Generate timestamp-based filename
 * @param {string} type - The image type (icon)
 * @param {string} prefix - The filename prefix (flux)
 * @returns {string} - The generated filename
 */
function generateFilename(type, prefix = "flux") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${type}-${timestamp}.png`;
}

/**
 * Clears all existing icon images from the public/images directory
 */
function clearExistingIcons() {
  const imagesDir = join(process.cwd(), "public/images");

  if (!existsSync(imagesDir)) {
    return;
  }

  const files = readdirSync(imagesDir);
  const iconFiles = files.filter(
    (file) =>
      (file.startsWith("flux-icon-") || file.startsWith("flux-splash-")) &&
      file.endsWith(".png"),
  );

  console.log("🗑️  Clearing existing icon and splash images...");
  iconFiles.forEach((file) => {
    const filePath = join(imagesDir, file);
    try {
      unlinkSync(filePath);
      console.log(`   Deleted: ${file}`);
    } catch (error) {
      console.warn(`   Failed to delete: ${file}`);
    }
  });
}

/**
 * Downloads and saves an image from base64 data to the public/images directory
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} filename - Filename to save the image as
 * @param {boolean} isBase64 - Whether the data is base64 encoded (default: false for URL)
 */
async function downloadAndSaveImage(base64Data, filename, isBase64 = false) {
  try {
    let buffer;

    if (isBase64) {
      // Handle base64 data from Flux API
      buffer = Buffer.from(base64Data, "base64");
    } else {
      // Handle URL (fallback for other image sources)
      const response = await fetch(base64Data);
      if (!response.ok) {
        throw new Error(
          `Failed to download image: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const imagesDir = join(process.cwd(), "public/images");

    // Ensure images directory exists
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = join(imagesDir, filename);
    writeFileSync(filePath, buffer);
    console.log(`💾 Image saved: ${filename}`);

    return { filename, filePath, buffer };
  } catch (error) {
    console.error(`❌ Failed to save image: ${error.message}`);
    throw error;
  }
}

/**
 * Resizes an image buffer using Jimp and saves it
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {string} filename - Filename to save the resized image as
 * @param {Object} dimensions - Target dimensions {width, height}
 * @returns {Promise<Object>} - The result with filename and filepath
 */
async function resizeAndSaveImage(imageBuffer, filename, dimensions) {
  try {
    const imagesDir = join(process.cwd(), "public/images");

    // Ensure images directory exists
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    // Resize image using Jimp
    const image = await Jimp.read(imageBuffer);
    const resizedImage = image.resize({
      w: dimensions.width,
      h: dimensions.height,
    });
    const resizedBuffer = await resizedImage.getBuffer("image/png");

    const filePath = join(imagesDir, filename);
    writeFileSync(filePath, resizedBuffer);
    console.log(
      `🔄 Resized image saved: ${filename} (${dimensions.width}x${dimensions.height}px)`,
    );

    return { filename, filePath };
  } catch (error) {
    console.error(`❌ Failed to resize and save image: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a single image using the Together AI API
 * @param {Together} together - The Together AI client instance
 * @param {string} prompt - The image generation prompt
 * @param {Object} dimensions - The image dimensions {width, height}
 * @param {string} type - The image type (icon or splash)
 * @returns {Promise<Object>} - The generation result with filename
 */
async function generateImage(together, prompt, dimensions, type) {
  const startTime = Date.now();
  console.log(
    `\n🎨 Generating ${type} image (${dimensions.width}x${dimensions.height})...`,
  );
  console.log(`📝 Prompt: ${prompt}`);

  try {
    const response = await together.images.create({
      model: FLUX_MODEL.id,
      prompt: prompt,
      width: dimensions.width,
      height: dimensions.height,
      steps: FLUX_MODEL.defaultSteps,
      n: 1,
      seed: Math.floor(Math.random() * 1000000),
      response_format: "b64_json",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data received from API");
    }

    const imageData = response.data[0];
    if (!imageData.b64_json) {
      throw new Error("No base64 image data in response");
    }

    // Generate filename with timestamp
    const filename = generateFilename(type, "flux");
    const result = await downloadAndSaveImage(
      imageData.b64_json,
      filename,
      true,
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(
      `✅ Generated ${type} image in ${duration}s: ${result.filename}`,
    );
    return result;
  } catch (error) {
    console.error(`❌ Failed to generate ${type} image:`, error.message);
    throw error;
  }
}

/**
 * Generate icon using the Together AI API
 * @param {Together} together - The Together AI client instance
 * @param {string} prompt - The image generation prompt
 * @param {Object} dimensions - The image dimensions {width, height}
 * @returns {Promise<Object>} - The generation result with filename
 */
async function generateIcon(together, prompt, dimensions = ICON_DIMENSIONS) {
  return generateImage(together, prompt, dimensions, "icon");
}

/**
 * Reads and parses the Farcaster configuration file to extract app name
 * @returns {string} - The app name from farcaster.json
 */
function getAppNameFromConfig() {
  try {
    const configPath = join(process.cwd(), "public/.well-known/farcaster.json");
    const configContent = readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    return config.miniapp?.name || "Mini App";
  } catch (error) {
    console.warn(
      "⚠️  Warning: Could not read app name from farcaster.json, using default",
    );
    return "Mini App";
  }
}

/**
 * Generate icon prompt based on app name
 * @param {string} appName - The app name
 * @returns {string} - The generated prompt
 */
function generateIconPrompt(appName) {
  return `Create a clean, minimalist square app icon for "${appName}". The icon should be:
- Modern and professional design
- 1:1 aspect ratio (square format)
- High contrast colors that work well at small sizes
- Simple, geometric shapes or clean typography
- Suitable for a mobile app icon
- No complex details that become unclear when scaled down
- If text is included, make it bold and highly readable`;
}

/**
 * Updates the farcaster.json file with the generated image URLs
 * @param {string} iconFilename - The icon filename
 * @param {string} splashFilename - The splash filename
 */
function updateFarcasterConfigWithImages(iconFilename, splashFilename) {
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

    // Get domain from existing config or environment
    const domain = config.miniapp?.homeUrl
      ? new URL(config.miniapp.homeUrl).origin
      : `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`;

    // Update URLs
    if (config.miniapp) {
      if (iconFilename) {
        config.miniapp.iconUrl = `${domain}/images/${iconFilename}`;
      }
      if (splashFilename) {
        config.miniapp.splashImageUrl = `${domain}/images/${splashFilename}`;
      }
    }

    // Write updated config
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("✅ Updated farcaster.json with new image URLs");
  } catch (error) {
    console.error("❌ Error updating farcaster.json:", error.message);
  }
}

/**
 * Main function to generate Flux icon and resize it for splash
 */
async function main() {
  try {
    // Validate API key
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.error("❌ Error: TOGETHER_API_KEY is not set.");
      console.error(
        "   Please add your Together AI API key to your .env file.",
      );
      console.error(
        "   Get your API key from: https://api.together.xyz/settings/api-keys",
      );
      process.exit(1);
    }

    // Get app name and generate prompt
    const appName = getAppNameFromConfig();
    const customPrompt = process.argv[2]; // Allow custom prompt as argument
    const iconPrompt = customPrompt || generateIconPrompt(appName);
    console.log("🎨 Flux Icon Generator");
    console.log(`📱 App: ${appName}`);
    console.log(
      `🖼️  Icon: ${ICON_DIMENSIONS.width}x${ICON_DIMENSIONS.height}px`,
    );
    console.log(
      `🚀 Splash: ${SPLASH_DIMENSIONS.width}x${SPLASH_DIMENSIONS.height}px (resized from icon)`,
    );

    // Clear existing images
    clearExistingIcons();

    // Initialize Together AI client
    console.log("\n🚀 Initializing Together AI client...");
    const together = new Together({ apiKey });

    console.log(`\n📝 Model: ${FLUX_MODEL.displayName}`);

    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`\n🔄 Attempt ${attempt}/${MAX_RETRIES}`);

        // Generate icon
        console.log(
          `\n📐 Icon Dimensions: ${ICON_DIMENSIONS.width}x${ICON_DIMENSIONS.height}px`,
        );
        const iconResult = await generateIcon(
          together,
          iconPrompt,
          ICON_DIMENSIONS,
        );

        // Resize icon for splash
        console.log(
          `\n🔄 Resizing icon to splash dimensions: ${SPLASH_DIMENSIONS.width}x${SPLASH_DIMENSIONS.height}px`,
        );
        const splashFilename = generateFilename("splash", "flux");
        const splashResult = await resizeAndSaveImage(
          iconResult.buffer,
          splashFilename,
          SPLASH_DIMENSIONS,
        );

        // Update farcaster.json with new images
        updateFarcasterConfigWithImages(
          iconResult.filename,
          splashResult.filename,
        );

        console.log("\n🎉 Image generation complete!");
        console.log(`   📁 Icon: public/images/${iconResult.filename}`);
        console.log(`   📁 Splash: public/images/${splashResult.filename}`);
        console.log("   ✅ Updated: public/.well-known/farcaster.json");

        // Success! Exit the retry loop
        return;
      } catch (error) {
        lastError = error;
        console.error(`\n❌ Attempt ${attempt}/${MAX_RETRIES} failed:`);
        console.error("💥", error.message);

        if (attempt < MAX_RETRIES) {
          let waitTime = 2000; // Base wait time of 2 seconds

          if (
            error.message.includes("429") ||
            error.message.includes("rate limit")
          ) {
            waitTime = 105000; // Wait 105 seconds for rate limit errors
            console.error("⏰ Rate Limit: Waiting 105 seconds before retry...");
          } else {
            console.error(
              `⏳ Waiting ${waitTime / 1000} seconds before retry...`,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries exhausted
    console.error(`\n❌ All ${MAX_RETRIES} attempts failed. Final error:`);
    console.error("💥", lastError.message);

    if (
      lastError.message.includes("429") ||
      lastError.message.includes("rate limit")
    ) {
      console.error("⏰ Rate Limit: Please wait before making another request");
    }

    process.exit(1);
  } catch (error) {
    console.error("\n❌ Error generating images:");
    console.error("💥", error.message);

    if (error.message.includes("429") || error.message.includes("rate limit")) {
      console.error("⏰ Rate Limit: Please wait before making another request");
    }

    process.exit(1);
  }
}

// Run the script when executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateIcon,
  generateImage,
  generateIconPrompt,
  getAppNameFromConfig,
  clearExistingIcons,
  downloadAndSaveImage,
  resizeAndSaveImage,
  updateFarcasterConfigWithImages,
};
