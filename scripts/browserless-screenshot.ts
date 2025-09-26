#!/usr/bin/env node

import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

/**
 * Browserless.io Screenshot Script
 * 
 * Converts the curl command to take screenshots using browserless.io API
 * 
 * Usage:
 *   npx tsx scripts/browserless-screenshot.ts [url] [output-filename]
 *   pnpm exec tsx scripts/browserless-screenshot.ts [url] [output-filename]
 * 
 * Examples:
 *   npx tsx scripts/browserless-screenshot.ts
 *   npx tsx scripts/browserless-screenshot.ts https://google.com google-homepage
 *   npx tsx scripts/browserless-screenshot.ts https://github.com github-page.png
 */

interface GotoOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
}

interface ScreenshotRequestBody {
  url: string;
  gotoOptions?: GotoOptions;
  viewport?: {
    width: number;
    height: number;
  };
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
}

interface ScreenshotOptions {
  url: string;
  filename?: string;
  gotoOptions?: GotoOptions;
  viewport?: { width: number; height: number };
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
}

class BrowserlessScreenshot {
  private apiToken: string;
  private baseUrl: string;
  private outputDir: string;

  constructor(apiToken?: string, baseUrl: string = process.env.BROWSERLESS_API_URL as string) {
    this.apiToken = apiToken || process.env.BROWSERLESS_API_TOKEN || '';
    this.baseUrl = baseUrl;
    this.outputDir = join(process.cwd(), 'public', 'screenshots');
    this.ensureOutputDir();
  }

  /**
   * Ensure screenshots output directory exists
   */
  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created screenshots directory: ${this.outputDir}`);
    }
  }

  /**
   * Generate timestamp-based filename
   */
  private generateFilename(url: string, customName?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const domain = customName || new URL(url).hostname.replace(/[^a-z0-9]/gi, '-');
    const extension = customName?.includes('.') ? '' : '.png';
    return `${domain}-${timestamp}${extension}`;
  }

  /**
   * Validate API token
   */
  private validateApiToken(): void {
    if (!this.apiToken) {
      console.error('❌ Missing Browserless API token');
      console.error('\n💡 To fix this:');
      console.error('   1. Set BROWSERLESS_API_TOKEN in your .env file');
      console.error('   2. Or pass the token as a parameter');
      console.error('   3. Get your token from: https://browserless.io');
      throw new Error('Missing Browserless API token');
    }
  }

  /**
   * Take screenshot using browserless.io API
   */
  async takeScreenshot(options: ScreenshotOptions): Promise<{
    success: boolean;
    path?: string;
    filename?: string;
    url: string;
    error?: string;
  }> {
    try {
    //   this.validateApiToken();

      const {
        url,
        filename,
        gotoOptions = { waitUntil: 'networkidle2' },
        viewport = { 
          width: parseInt(process.env.SCREENSHOT_VIEWPORT_WIDTH || '1920'), 
          height: parseInt(process.env.SCREENSHOT_VIEWPORT_HEIGHT || '1080') 
        },
        fullPage = true,
        type = 'png',
        quality = 90
      } = options;

      console.log(`📸 Taking screenshot of: ${url}`);
      console.log(`🔗 Using browserless.io API endpoint: ${this.baseUrl}`);

      // Prepare request body
      const requestBody: ScreenshotRequestBody = {
        url,
        gotoOptions,
        viewport,
        // fullPage,
        // type,
        ...(type === 'jpeg' && { quality })
      };

      console.log('📋 Request options:', JSON.stringify(requestBody, null, 2));

      // Make API request
      const apiUrl = `${this.baseUrl}/screenshot?token=dawdawdwa`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        const errorText = await response.text();
        throw new Error(`Expected image response, got ${contentType}\n${errorText}`);
      }

      // Get image data
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      // Generate filename
      const outputFilename = filename || this.generateFilename(url);
      const outputPath = join(this.outputDir, outputFilename);

      // Save screenshot
      writeFileSync(outputPath, imageBuffer);

      console.log(`✅ Screenshot saved successfully!`);
      console.log(`📁 Location: ${outputPath}`);
      console.log(`📊 Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      console.log(`🔗 Relative path: /screenshots/${outputFilename}`);

      return {
        success: true,
        path: outputPath,
        filename: outputFilename,
        url
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Screenshot failed:', errorMessage);

      if (errorMessage.includes('401')) {
        console.log('💡 Check your Browserless API token - it might be invalid or expired');
      } else if (errorMessage.includes('403')) {
        console.log('💡 API quota might be exceeded or token lacks permissions');
      } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        console.log('💡 Network connectivity issue - check your internet connection');
      }

      return {
        success: false,
        url: options.url,
        error: errorMessage
      };
    }
  }

  /**
   * Take multiple screenshots with batch processing
   */
  async takeMultipleScreenshots(urls: string[]): Promise<Array<{
    success: boolean;
    path?: string;
    filename?: string;
    url: string;
    error?: string;
  }>> {
    const results = [];
    
    console.log(`📊 Starting batch screenshot process for ${urls.length} URLs`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n📸 Processing ${i + 1}/${urls.length}: ${url}`);
      
      const result = await this.takeScreenshot({ url });
      results.push(result);
      
      // Add delay between screenshots to respect rate limits
      if (i < urls.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next screenshot...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Default URL and custom filename from arguments
  const url = args[0] || 'https://example.com';
  const customFilename = args[1];
  
  console.log('🎬 Browserless.io Screenshot Tool');
  console.log('=' .repeat(50));
  console.log(`🎯 Target URL: ${url}`);
  if (customFilename) {
    console.log(`📝 Custom filename: ${customFilename}`);
  }
  console.log('');

  const screenshotter = new BrowserlessScreenshot();
  
  try {
    const result = await screenshotter.takeScreenshot({
      url,
      filename: customFilename
    });
    
    if (result.success) {
      console.log('\n🎉 Screenshot completed successfully!');
      console.log(`📁 Location: ${result.path}`);
      console.log(`🌐 URL captured: ${result.url}`);
    } else {
      console.error('\n💥 Screenshot process failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Unexpected error occurred');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    
    if (process.env.DEBUG) {
      console.error('\n🐛 Full error details:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

// Run the script when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BrowserlessScreenshot };
export type { ScreenshotOptions, GotoOptions, ScreenshotRequestBody };
