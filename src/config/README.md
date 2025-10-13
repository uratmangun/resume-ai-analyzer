# Farcaster Configuration

## Overview

This directory contains the shared Farcaster configuration that is used by both the API route and build scripts.

## File Structure

- **`farcaster.json`** - The source of truth for Farcaster miniapp configuration

## How It Works

### API Route
The Next.js API route at `/.well-known/farcaster.json` reads from this config file:
- **Route**: `/src/app/.well-known/farcaster.json/route.ts`
- **Endpoint**: `https://yourdomain.com/.well-known/farcaster.json`
- **Caching**: 1 hour cache for optimal performance

### Build Scripts
All deployment and generation scripts write to this config file:
- `scripts/generate-farcaster-account-association.js` - Updates account association and domain URLs
- `scripts/generate-svg-icons-with-gradient.js` - Updates icon and splash image URLs
- `scripts/generate-gemini-icon.js` - Updates icon URLs
- `scripts/generate-openrouter-icon.js` - Updates icon URLs
- `scripts/generate-flux-icon.js` - Updates icon URLs
- `scripts/generate-screenshots.js` - Updates screenshot URLs
- `scripts/generate-screenshots-with-resize.js` - Updates screenshot URLs

## Configuration Schema

```json
{
  "accountAssociation": {
    "header": "base64-encoded-header",
    "payload": "base64-encoded-payload",
    "signature": "base64-encoded-signature"
  },
  "miniapp": {
    "version": "1",
    "name": "Your App Name",
    "iconUrl": "https://yourdomain.com/images/icon.png",
    "homeUrl": "https://yourdomain.com",
    "imageUrl": "https://yourdomain.com/images/screenshot.png",
    "buttonTitle": "Launch App",
    "splashImageUrl": "https://yourdomain.com/images/splash.png",
    "splashBackgroundColor": "#0ea5e9",
    "webhookUrl": "https://yourdomain.com/api/webhook",
    "subtitle": "Your subtitle",
    "description": "Your description",
    "primaryCategory": "productivity",
    "tags": ["tag1", "tag2"]
  }
}
```

## Why This Approach?

### Previous Setup (Static File)
- Configuration was in `public/.well-known/farcaster.json`
- Served as a static file
- Scripts could directly read/write to it

### Current Setup (API Route + Config File)
- Configuration is in `src/config/farcaster.json`
- Served via Next.js API route at `/.well-known/farcaster.json`
- Scripts read/write to the config file
- API route dynamically reads from the config file

### Benefits
1. **Dynamic Updates**: Changes to the config are immediately reflected in the API
2. **Build-time Safety**: Config can be validated during build
3. **Caching Control**: Fine-grained control over cache headers
4. **Type Safety**: Can add TypeScript types for the config
5. **Middleware Support**: Can add authentication or rate limiting if needed
6. **Vercel/Cloudflare Compatible**: Works with serverless deployments

## Updating Configuration

### Manual Updates
Edit `src/config/farcaster.json` directly and the changes will be reflected at the API endpoint.

### Script Updates
Run any of the generation scripts and they will automatically update this file:

```bash
# Update account association
node scripts/generate-farcaster-account-association.js generate

# Update icons
node scripts/generate-svg-icons-with-gradient.js

# Update screenshots
node scripts/generate-screenshots.js
```

## Testing

Test the API endpoint locally:
```bash
curl http://localhost:3000/.well-known/farcaster.json
```

Test in production:
```bash
curl https://yourdomain.com/.well-known/farcaster.json
```

## Important Notes

1. **Do not delete this file** - It's required for the API route to function
2. **Keep the schema valid** - Invalid JSON will cause the API to return a fallback config
3. **Commit changes** - This file should be committed to version control
4. **CI/CD Integration** - GitHub Actions workflows automatically update this file during deployment
