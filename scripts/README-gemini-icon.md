# Gemini Icon Generator

This script generates AI-powered app icons using Google's Gemini AI model, specifically designed for Farcaster Mini Apps.

## Features

- 🎨 Generate clean, minimalist app icons using Google Gemini AI
- 📱 Optimized for Farcaster Mini App requirements
- 🎯 Automatically reads app name from `farcaster.json`
- 🗑️ Cleans up existing generated icons before creating new ones
- ✅ Auto-updates `farcaster.json` with the new icon URL
- 🎨 Follows project color guidelines (non-purple primary colors)

## Prerequisites

1. **Google Gemini API Key**: Get yours from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Environment Setup**: Add your API key to `.env`:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

## Installation

The required dependencies are already included in the project:
- `@google/genai` - Google Gemini AI SDK
- `mime` - MIME type detection
- `dotenv` - Environment variable loading

## Usage

### Basic Usage
Generate an icon based on your app name from `farcaster.json`:
```bash
node scripts/generate-gemini-icon.js
```

### Custom Prompt
Provide a custom prompt for icon generation:
```bash
node scripts/generate-gemini-icon.js "Create a blue minimalist icon with a rocket ship"
```

## How It Works

1. **Configuration Reading**: Reads app name from `public/.well-known/farcaster.json`
2. **Prompt Generation**: Creates an optimized prompt for icon generation
3. **AI Generation**: Uses Gemini 2.5 Flash Image Preview model
4. **File Management**: Saves generated icons to `public/images/`
5. **Config Update**: Updates `farcaster.json` with new icon URL

## Generated Files

Icons are saved with timestamp-based names:
```
public/images/gemini-icon-2025-01-20T10-30-45-123Z_0.png
```

## Prompt Template

The default prompt ensures icons are:
- Square format (1:1 aspect ratio)
- High contrast and readable at small sizes
- Modern and professional design
- Non-purple primary colors (following project guidelines)
- Suitable for mobile app icons

## Configuration Updates

The script automatically updates your `farcaster.json` file:
```json
{
  "miniapp": {
    "iconUrl": "https://your-domain.com/images/gemini-icon-[timestamp].png"
  }
}
```

## Model Information

- **Model**: `gemini-2.5-flash-image-preview`
- **Capabilities**: Text-to-image generation with high quality output
- **Response Format**: Base64 encoded images with MIME type detection

## Error Handling

The script handles common issues:
- Missing API key validation
- Rate limiting detection
- File system errors
- Invalid configuration files

## Output Example

```bash
🎨 Gemini Icon Generator for Farcaster Mini Apps
📱 App: Next.js Mini App
🤖 Model: gemini-2.5-flash-image-preview

🗑️  Clearing existing icon images...
   Deleted: gemini-icon-2025-01-20T09-15-30-456Z_0.png

🚀 Initializing Google Gemini AI...

🎨 Generating icon image with Gemini AI...
📝 Prompt: Create a clean, minimalist square app icon for "Next.js Mini App"...

💾 File public/images/gemini-icon-2025-01-20T10-30-45-123Z_0.png saved to file system.
✅ Generated 1 icon image(s) in 3.2s
✅ Updated farcaster.json with new icon URL

🎉 Icon generation complete!
   📁 Saved: public/images/gemini-icon-2025-01-20T10-30-45-123Z_0.png
   ✅ Updated: public/.well-known/farcaster.json
```

## Comparison with Flux Generator

| Feature | Gemini | Flux |
|---------|--------|------|
| **Provider** | Google AI | Together AI |
| **Model** | gemini-2.5-flash-image-preview | FLUX.1-schnell-Free |
| **Speed** | ~3-5 seconds | ~4-8 seconds |
| **Quality** | High detail, photorealistic | Artistic, stylized |
| **Cost** | Per request | Free tier available |
| **Dimensions** | Dynamic | Fixed 208x208 |

## Troubleshooting

### API Key Issues
```bash
❌ Error: GEMINI_API_KEY is not set.
   Please add your Gemini API key to your .env file.
```
**Solution**: Add `GEMINI_API_KEY=your_key` to your `.env` file

### Rate Limiting
```bash
⏰ Rate Limit: Please wait before making another request
```
**Solution**: Wait a few minutes before running the script again

### No Images Generated
**Possible Causes**:
- Invalid prompt
- API service issues
- Network connectivity problems

**Solution**: Try with a simpler prompt or check your internet connection

## Integration

This script integrates seamlessly with the existing Farcaster Mini App workflow:

1. Generate icon: `node scripts/generate-gemini-icon.js`
2. Generate other assets: `pnpm run generate:assets`
3. Deploy your app with the new icon

## Advanced Usage

### Batch Generation
Generate multiple variations by running the script multiple times with different prompts.

### Custom Styling
Modify the `generateIconPrompt()` function to customize the default prompt template.

### Integration with CI/CD
Add icon generation to your deployment pipeline for automated asset creation.
