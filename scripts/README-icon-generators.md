# Icon Generator Scripts Comparison

This project includes two AI-powered icon generation scripts for creating Farcaster Mini App icons. Each uses different AI providers and has unique strengths.

## Quick Start

```bash
# Using Flux (Together AI)
pnpm run generate:icon:flux
# or
node scripts/generate-flux-icon.js

# Using Gemini (Google AI)
pnpm run generate:icon:gemini
# or
node scripts/generate-gemini-icon.js
```

## Script Comparison

| Feature | Flux Generator | Gemini Generator |
|---------|----------------|------------------|
| **Provider** | Together AI | Google AI |
| **Model** | FLUX.1-schnell-Free | gemini-2.5-flash-image-preview |
| **API Key** | `TOGETHER_API_KEY` | `GEMINI_API_KEY` |
| **Speed** | ~4-8 seconds | ~3-5 seconds |
| **Style** | Artistic, stylized | High detail, photorealistic |
| **Dimensions** | Fixed 208x208px | Dynamic (square format) |
| **Free Tier** | Available | Per-request pricing |
| **File Naming** | `flux-icon-[timestamp].png` | `gemini-icon-[timestamp]_0.png` |

## When to Use Each

### Use Flux Generator When:
- ✅ You want artistic, stylized icons
- ✅ You need consistent 208x208px dimensions
- ✅ You prefer the Together AI ecosystem
- ✅ You want to use the free tier
- ✅ You need fast, reliable generation

### Use Gemini Generator When:
- ✅ You want photorealistic, high-detail icons
- ✅ You prefer Google's AI capabilities
- ✅ You need flexible image dimensions
- ✅ You want cutting-edge AI technology
- ✅ You're already using Google AI services

## Setup Requirements

### Flux Generator Setup
1. Get API key from [Together AI](https://api.together.xyz/settings/api-keys)
2. Add to `.env`: `TOGETHER_API_KEY=your_key_here`
3. Run: `pnpm run generate:icon:flux`

### Gemini Generator Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Run: `pnpm run generate:icon:gemini`

## Common Features

Both scripts automatically:
- 📱 Read app name from `farcaster.json`
- 🗑️ Clear existing generated icons
- 💾 Save icons to `public/images/`
- ✅ Update `farcaster.json` with new icon URL
- 🎨 Follow non-purple color guidelines
- 📐 Generate square format icons
- ⚡ Support custom prompts via CLI arguments

## Usage Examples

### Basic Usage
```bash
# Generate with default app name prompt
pnpm run generate:icon:flux
pnpm run generate:icon:gemini
```

### Custom Prompts
```bash
# Flux with custom prompt
node scripts/generate-flux-icon.js "minimalist blue tech icon"

# Gemini with custom prompt
node scripts/generate-gemini-icon.js "clean geometric logo with teal accent"
```

## Output Examples

### Flux Output
```
🎨 Flux Icon Generator for Farcaster Mini Apps
📱 App: Next.js Mini App
🖼️  Dimensions: 208x208px

🗑️  Clearing existing icon images...
🚀 Initializing Together AI client...
🎨 Generating icon image (208x208)...
✅ Generated icon image in 5.2s: flux-icon-2025-01-20T10-30-45-123Z.png
✅ Updated farcaster.json with new icon URL
```

### Gemini Output
```
🎨 Gemini Icon Generator for Farcaster Mini Apps
📱 App: Next.js Mini App
🤖 Model: gemini-2.5-flash-image-preview

🗑️  Clearing existing icon images...
🚀 Initializing Google Gemini AI...
🎨 Generating icon image with Gemini AI...
💾 File saved to file system.
✅ Generated 1 icon image(s) in 3.8s
✅ Updated farcaster.json with new icon URL
```

## Integration with Workflow

Both scripts integrate seamlessly with your development workflow:

1. **Generate Icon**: Choose either Flux or Gemini
2. **Generate Other Assets**: `pnpm run generate:assets`
3. **Deploy**: Your new icon is ready!

## Troubleshooting

### Common Issues

#### API Key Not Set
```bash
❌ Error: [API_KEY] is not set.
```
**Solution**: Add the appropriate API key to your `.env` file

#### Rate Limiting
```bash
⏰ Rate Limit: Please wait before making another request
```
**Solution**: Wait a few minutes before retrying

#### No Images Generated
**Possible Causes**:
- Invalid prompt
- Network issues
- API service down

**Solution**: Try a simpler prompt or check connectivity

### Getting Help

- **Flux Issues**: Check [Together AI Documentation](https://docs.together.ai/)
- **Gemini Issues**: Check [Google AI Documentation](https://ai.google.dev/docs)
- **Script Issues**: Review the individual README files in this directory

## Best Practices

1. **Test Both**: Try both generators to see which style fits your app
2. **Custom Prompts**: Experiment with specific prompts for better results
3. **Backup**: Keep successful icons before generating new ones
4. **Monitor Usage**: Keep track of API usage and costs
5. **Color Guidelines**: Both scripts follow the project's non-purple color preference

## File Structure

```
scripts/
├── generate-flux-icon.js       # Together AI Flux generator
├── generate-gemini-icon.js     # Google Gemini generator
├── README-gemini-icon.md       # Detailed Gemini docs
└── README-icon-generators.md   # This comparison guide

public/images/
├── flux-icon-[timestamp].png     # Flux generated icons
└── gemini-icon-[timestamp]_0.png # Gemini generated icons
```

## Future Enhancements

Potential improvements for both scripts:
- Batch generation with multiple variations
- Icon size optimization for different platforms
- Integration with design systems
- A/B testing capabilities
- Automated icon validation
