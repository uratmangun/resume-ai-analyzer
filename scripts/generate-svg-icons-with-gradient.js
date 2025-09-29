#!/usr/bin/env node

require('dotenv/config');
const { join } = require('path');
const {
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  readFileSync,
} = require('fs');

/**
 * SVG Icon Generation Script with Gradient Colors
 *
 * This script generates random SVG icons with gradient colors:
 * - Original SVG icon (768x512px)
 * - Icon: Resized to 208x208px 
 * - Splash: Resized to 200x200px
 *
 * Usage:
 *   node scripts/generate-svg-icons-with-gradient.js
 */

// Generation configuration
const GENERATION_CONFIG = {
  betweenImages: 1, // Delay between each icon generation
  initialWait: 0, // Initial wait before starting generation
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

// Original SVG dimensions
const ORIGINAL_DIMENSIONS = {
  width: 768,
  height: 512,
};

/**
 * Sleep utility function to add delays between generations
 * @param {number} seconds - Number of seconds to wait
 */
async function sleep(seconds) {
  if (seconds > 0) {
    console.log(`⏳ Waiting ${seconds}s...`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}

/**
 * Generate random hex color
 * @returns {string} - Random hex color
 */
function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Generate random HSL color for better gradient combinations
 * @returns {string} - Random HSL color
 */
function getRandomHSLColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
  const lightness = Math.floor(Math.random() * 30) + 40; // 40-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate timestamp-based filename
 * @param {string} type - The image type (original, icon, splash)
 * @param {string} prefix - The filename prefix (svg-icon)
 * @returns {string} - The generated filename
 */
function generateFilename(type, prefix = "svg-icon") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${type}-${timestamp}`;
}

/**
 * Get random SVG icon shape
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {string} gradientId - Gradient ID for the fill
 * @returns {string} - SVG shape element
 */
function getRandomSVGShape(width, height, gradientId) {
  const shapes = [
    // Circle
    () => `<circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height) * 0.3}" fill="url(#${gradientId})" />`,
    
    // Rectangle with rounded corners
    () => {
      const w = width * 0.6;
      const h = height * 0.6;
      const x = (width - w) / 2;
      const y = (height - h) / 2;
      const rx = Math.min(w, h) * 0.1;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${gradientId})" />`;
    },
    
    // Triangle (pointing up)
    () => {
      const size = Math.min(width, height) * 0.6;
      const centerX = width / 2;
      const centerY = height / 2;
      const topY = centerY - size / 3;
      const bottomY = centerY + size / 3;
      const leftX = centerX - size / 2;
      const rightX = centerX + size / 2;
      return `<polygon points="${centerX},${topY} ${leftX},${bottomY} ${rightX},${bottomY}" fill="url(#${gradientId})" />`;
    },
    
    // Diamond
    () => {
      const size = Math.min(width, height) * 0.6;
      const centerX = width / 2;
      const centerY = height / 2;
      const points = [
        [centerX, centerY - size/2],
        [centerX + size/2, centerY],
        [centerX, centerY + size/2],
        [centerX - size/2, centerY]
      ];
      return `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="url(#${gradientId})" />`;
    },
    
    // Heart shape
    () => {
      const size = Math.min(width, height) * 0.5;
      const centerX = width / 2;
      const centerY = height / 2;
      const path = `M${centerX},${centerY + size/4} 
                    C${centerX},${centerY - size/4} ${centerX - size/2},${centerY - size/4} ${centerX - size/2},${centerY} 
                    C${centerX - size/2},${centerY + size/4} ${centerX},${centerY + size/2} ${centerX},${centerY + size/2} 
                    C${centerX},${centerY + size/2} ${centerX + size/2},${centerY + size/4} ${centerX + size/2},${centerY}
                    C${centerX + size/2},${centerY - size/4} ${centerX},${centerY - size/4} ${centerX},${centerY + size/4} Z`;
      return `<path d="${path}" fill="url(#${gradientId})" />`;
    },
    
    // Star
    () => {
      const size = Math.min(width, height) * 0.4;
      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = size;
      const innerRadius = size * 0.4;
      const points = [];
      
      for (let i = 0; i < 5; i++) {
        // Outer point
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        points.push([
          centerX + outerRadius * Math.cos(outerAngle),
          centerY + outerRadius * Math.sin(outerAngle)
        ]);
        
        // Inner point
        const innerAngle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
        points.push([
          centerX + innerRadius * Math.cos(innerAngle),
          centerY + innerRadius * Math.sin(innerAngle)
        ]);
      }
      
      return `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="url(#${gradientId})" />`;
    },
    
    // Hexagon
    () => {
      const size = Math.min(width, height) * 0.4;
      const centerX = width / 2;
      const centerY = height / 2;
      const points = [];
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push([
          centerX + size * Math.cos(angle),
          centerY + size * Math.sin(angle)
        ]);
      }
      
      return `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="url(#${gradientId})" />`;
    }
  ];
  
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  return randomShape();
}

/**
 * Generate gradient definition
 * @param {string} gradientId - Unique gradient ID
 * @returns {string} - SVG gradient definition
 */
function generateGradient(gradientId) {
  const color1 = getRandomHSLColor();
  const color2 = getRandomHSLColor();
  const color3 = getRandomHSLColor();
  
  // Random gradient direction
  const directions = [
    { x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, // diagonal
    { x1: "0%", y1: "0%", x2: "100%", y2: "0%" },   // horizontal
    { x1: "0%", y1: "0%", x2: "0%", y2: "100%" },   // vertical
    { x1: "0%", y1: "100%", x2: "100%", y2: "0%" }, // diagonal reverse
  ];
  
  const direction = directions[Math.floor(Math.random() * directions.length)];
  
  // Choose between 2 or 3 color gradient
  const useThreeColors = Math.random() > 0.5;
  
  if (useThreeColors) {
    return `
    <linearGradient id="${gradientId}" x1="${direction.x1}" y1="${direction.y1}" x2="${direction.x2}" y2="${direction.y2}">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${color2};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color3};stop-opacity:1" />
    </linearGradient>`;
  } else {
    return `
    <linearGradient id="${gradientId}" x1="${direction.x1}" y1="${direction.y1}" x2="${direction.x2}" y2="${direction.y2}">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>`;
  }
}

/**
 * Generate random SVG icon with gradient
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {string} - Complete SVG string
 */
function generateRandomSVGIcon(width, height) {
  const gradientId = `gradient-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const gradient = generateGradient(gradientId);
  const shape = getRandomSVGShape(width, height, gradientId);
  
  // Random background color (subtle)
  const bgColors = [
    'transparent',
    '#f8fafc', '#f1f5f9', '#e2e8f0', // light grays
    '#fefce8', '#fef3c7', '#fde68a', // light yellows
    '#ecfdf5', '#d1fae5', '#a7f3d0', // light greens
    '#eff6ff', '#dbeafe', '#bfdbfe', // light blues
  ];
  const backgroundColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradient}
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${shape}
</svg>`;
}

/**
 * Save SVG to file
 * @param {string} svgContent - SVG content
 * @param {string} filename - Filename without extension
 * @param {Object} dimensions - Width and height
 * @returns {Object} - Result with filename and filepath
 */
function saveSVGToFile(svgContent, filename, dimensions) {
  try {
    const imagesDir = join(process.cwd(), "public/images");

    // Ensure images directory exists
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    const filepath = join(imagesDir, `${filename}.svg`);
    writeFileSync(filepath, svgContent, 'utf8');

    console.log(
      `💾 Saved SVG icon: ${filename}.svg (${dimensions.width}x${dimensions.height})`,
    );
    
    return {
      filename: `${filename}.svg`,
      filepath,
      content: svgContent,
    };
  } catch (error) {
    console.error(`❌ Failed to save SVG: ${error.message}`);
    throw error;
  }
}

/**
 * Clears all existing SVG icon files from the public/images directory
 */
function clearExistingSVGIcons() {
  const imagesDir = join(process.cwd(), "public/images");

  if (!existsSync(imagesDir)) {
    return;
  }

  const files = readdirSync(imagesDir);
  const svgFiles = files.filter(
    (file) =>
      (file.startsWith("svg-icon-original-") ||
        file.startsWith("svg-icon-icon-") ||
        file.startsWith("svg-icon-splash-")) &&
      file.endsWith(".svg"),
  );

  if (svgFiles.length > 0) {
    console.log("🗑️  Clearing existing SVG icon files...");
    svgFiles.forEach((file) => {
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
 * Updates the farcaster.json file with SVG icon URLs
 * @param {string} domain - The domain to use for URLs
 * @param {string} iconFilename - The icon filename
 * @param {string} splashFilename - The splash filename
 * @param {string} imageFilename - The main image filename
 */
function updateFarcasterConfigWithSVGIcons(domain, iconFilename, splashFilename, imageFilename) {
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

    // Get domain URL
    const baseUrl = `https://${domain}`;

    // Update SVG URLs
    if (config.miniapp) {
      if (iconFilename) {
        config.miniapp.iconUrl = `${baseUrl}/images/${iconFilename}`;
      }
      if (splashFilename) {
        config.miniapp.splashImageUrl = `${baseUrl}/images/${splashFilename}`;
      }
      if (imageFilename) {
        config.miniapp.imageUrl = `${baseUrl}/images/${imageFilename}`;
      }

      // Update home URL to match domain
      config.miniapp.homeUrl = baseUrl;
      config.miniapp.webhookUrl = `${baseUrl}/api/webhook`;
    }

    // Write updated config
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("✅ Updated farcaster.json with new SVG icon URLs");
  } catch (error) {
    console.error("❌ Error updating farcaster.json:", error.message);
  }
}

/**
 * Generate SVG icons with different sizes
 * @param {string} type - The icon type (original, icon, splash)
 * @returns {Promise<Object>} - The generation results
 */
async function generateSVGIconWithSizes(type) {
  const startTime = Date.now();
  console.log(`\n🎨 Generating ${type} SVG icon...`);

  try {
    // Generate original SVG (768x512)
    const originalFilename = generateFilename("original", "svg-icon");
    const originalSVG = generateRandomSVGIcon(ORIGINAL_DIMENSIONS.width, ORIGINAL_DIMENSIONS.height);
    const originalResult = saveSVGToFile(originalSVG, originalFilename, ORIGINAL_DIMENSIONS);

    // Generate icon size SVG (208x208)
    console.log(`\n🔄 Creating icon size: ${ICON_DIMENSIONS.width}x${ICON_DIMENSIONS.height}px`);
    const iconFilename = generateFilename("icon", "svg-icon");
    const iconSVG = generateRandomSVGIcon(ICON_DIMENSIONS.width, ICON_DIMENSIONS.height);
    const iconResult = saveSVGToFile(iconSVG, iconFilename, ICON_DIMENSIONS);

    // Generate splash size SVG (200x200)
    console.log(`\n🔄 Creating splash size: ${SPLASH_DIMENSIONS.width}x${SPLASH_DIMENSIONS.height}px`);
    const splashFilename = generateFilename("splash", "svg-icon");
    const splashSVG = generateRandomSVGIcon(SPLASH_DIMENSIONS.width, SPLASH_DIMENSIONS.height);
    const splashResult = saveSVGToFile(splashSVG, splashFilename, SPLASH_DIMENSIONS);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`✅ Generated ${type} SVG icons in ${duration}s`);

    return {
      original: originalResult.filename,
      icon: iconResult.filename,
      splash: splashResult.filename,
    };
  } catch (error) {
    console.error(`❌ Failed to generate ${type} SVG icons:`, error.message);
    throw error;
  }
}

/**
 * Generate SVG icons with retry logic
 * @param {string} type - The icon type
 * @param {number} maxAttempts - Maximum number of retry attempts (default: 3)
 * @param {number} retryDelaySeconds - Delay between retries in seconds (default: 2)
 * @returns {Promise<Object>} - The generation result
 */
async function generateSVGIconWithRetry(
  type,
  maxAttempts = 3,
  retryDelaySeconds = 2,
) {
  const failures = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 Attempt ${attempt}/${maxAttempts} for ${type} SVG icon generation`);

    try {
      const result = await generateSVGIconWithSizes(type);

      if (attempt > 1) {
        console.log(`🎉 SVG icon generation successful on attempt ${attempt}!`);
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
      };

      failures.push(failureInfo);

      console.error(`❌ Attempt ${attempt}/${maxAttempts} failed at ${timestamp}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Type: ${type}`);

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${retryDelaySeconds} seconds before retry...`);
        await sleep(retryDelaySeconds);
      } else {
        console.error(`💥 All ${maxAttempts} attempts failed for ${type} SVG icon generation`);
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
 * Main SVG icon generation function
 */
async function generateSVGIcons() {
  try {
    console.log("🎨 SVG Icon Generator with Gradient Colors");
    console.log("🌈 Generating random SVG icons with beautiful gradients...");

    console.log("\n🎯 Generating SVG icons in multiple sizes...");
    console.log(`   📱 Original: ${ORIGINAL_DIMENSIONS.width}x${ORIGINAL_DIMENSIONS.height}px`);
    console.log(`   🖼️  Icon: ${ICON_DIMENSIONS.width}x${ICON_DIMENSIONS.height}px`);
    console.log(`   🚀 Splash: ${SPLASH_DIMENSIONS.width}x${SPLASH_DIMENSIONS.height}px`);

    // Clear existing SVG icons
    clearExistingSVGIcons();

    console.log(`\n📝 Generation Parameters:`);
    console.log("=".repeat(50));
    console.log(`🎨 Icon Type: Random SVG with gradient colors`);
    console.log(`🖼️  Original: ${ORIGINAL_DIMENSIONS.width}x${ORIGINAL_DIMENSIONS.height}px`);
    console.log(`🎯 Icon: ${ICON_DIMENSIONS.width}x${ICON_DIMENSIONS.height}px`);
    console.log(`🚀 Splash: ${SPLASH_DIMENSIONS.width}x${SPLASH_DIMENSIONS.height}px`);
    console.log("=".repeat(50));

    console.log("\n⏳ Generating SVG icons with retry logic...");
    const overallStartTime = Date.now();

    // Generate SVG icons with retry logic (3 attempts, 2-second delay)
    const iconResult = await generateSVGIconWithRetry("gradient");

    const overallEndTime = Date.now();
    const totalDuration = ((overallEndTime - overallStartTime) / 1000).toFixed(1);

    // Print final results
    if (iconResult.success) {
      // Update farcaster.json with new SVG URLs
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || process.env.SCREENSHOT_URL;
      if (appDomain) {
        // Remove https:// if present to get clean domain
        const cleanDomain = appDomain.replace(/^https?:\/\//, '');
        updateFarcasterConfigWithSVGIcons(
          cleanDomain,
          iconResult.result.icon,
          iconResult.result.splash,
          iconResult.result.original,
        );
      }

      console.log("\n🎉 SVG icon generation complete!");
      console.log(`   📁 Original: public/images/${iconResult.result.original}`);
      console.log(`   📁 Icon: public/images/${iconResult.result.icon}`);
      console.log(`   📁 Splash: public/images/${iconResult.result.splash}`);
      console.log(`   ⏱️  Total time: ${totalDuration}s`);
      if (appDomain) {
        console.log("   ✅ Updated: public/.well-known/farcaster.json");
      }
      console.log("\n🌈 Each icon features beautiful gradient colors!");
      console.log("🎨 Icons include various shapes: circles, rectangles, triangles, diamonds, hearts, stars, and hexagons");
    } else {
      // Complete failure
      console.log("\n💥 SVG icon generation failed completely!");
      console.log(`   ⏱️  Total time: ${totalDuration}s`);
      console.log("\n📋 Complete failure summary:");
      iconResult.failures.forEach((failure) => {
        console.log(`   ❌ ${failure.type} attempt ${failure.attempt} at ${failure.timestamp}:`);
        console.log(`      ${failure.error}`);
      });

      throw new Error("All SVG icon generation attempts failed. See detailed logs above.");
    }
  } catch (error) {
    console.error("\n❌ Error generating SVG icons:");
    console.error("💥", error.message);
    process.exit(1);
  }
}

// Run the script when executed directly
if (require.main === module) {
  generateSVGIcons().catch(console.error);
}

module.exports = {
  generateSVGIconWithSizes,
  generateSVGIconWithRetry,
  generateRandomSVGIcon,
  clearExistingSVGIcons,
  generateSVGIcons,
  saveSVGToFile,
  generateGradient,
  getRandomSVGShape,
  updateFarcasterConfigWithSVGIcons,
};
