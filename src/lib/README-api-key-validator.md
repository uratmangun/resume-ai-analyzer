# API Key Validator Library

A reusable library for validating API keys in MCP tools.

## Features

- ✅ Validates API keys from request context
- ✅ Automatically updates `last_used` timestamp
- ✅ Returns user information on successful validation
- ✅ Provides consistent error messages
- ✅ Two usage patterns: wrapper and manual validation

## Usage

### Pattern 1: Using `requireApiKey` Wrapper (Recommended)

The simplest way to add API key validation to your tools:

```typescript
import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { requireApiKey } from "../lib/api-key-validator";

export const schema = {
  name: z.string().describe("User name"),
};

export const metadata: ToolMetadata = {
  name: "my-tool",
  description: "My awesome tool",
};

// Wrap your tool function with requireApiKey
export default requireApiKey(async ({ name }: InferSchema<typeof schema>, validation) => {
  // API key is already validated!
  // Access user info via validation.userId if needed
  
  return {
    content: [{ type: "text", text: `Hello, ${name}! Your user ID: ${validation.userId}` }],
  };
});
```

### Pattern 2: Manual Validation (Advanced)

For more control over the validation flow:

```typescript
import { validateApiKey } from "../lib/api-key-validator";

export default async function myTool({ name }: InferSchema<typeof schema>) {
  // Manually validate API key
  const validation = await validateApiKey();

  if (!validation.isValid) {
    return {
      content: [{ type: "text", text: validation.error }],
    };
  }

  // Continue with your tool logic
  const userId = validation.userId;
  const apiKey = validation.apiKey;
  
  return {
    content: [{ type: "text", text: `Authenticated as user: ${userId}` }],
  };
}
```

## API Reference

### `validateApiKey()`

Validates the API key from the current request context.

**Returns:** `Promise<ApiKeyValidationResult>`

```typescript
type ApiKeyValidationResult = {
  isValid: boolean;
  apiKey?: string;      // The validated API key
  userId?: string;      // The user ID associated with the key
  error?: string;       // Error message if validation failed
};
```

### `requireApiKey(toolFunction)`

A higher-order function that wraps your tool with automatic API key validation.

**Parameters:**
- `toolFunction`: Your tool function that receives parameters and validation result

**Returns:** Wrapped function that validates API key before execution

## How It Works

1. Extracts API key from request context (set via query parameter `?api-key=xxx`)
2. Queries the database to verify the key exists
3. Updates the `last_used` timestamp for analytics
4. Returns validation result with user information
5. Provides consistent error messages for invalid/missing keys

## Error Messages

- **Missing API key:** "API key doesn't exist. Please register and create your API key to use the MCP server."
- **Invalid API key:** "API key doesn't exist. Please register and create your API key to use the MCP server."

## Example: Creating a Protected Tool

```typescript
import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { requireApiKey } from "../lib/api-key-validator";

export const schema = {
  resumeId: z.string().describe("Resume ID to fetch"),
};

export const metadata: ToolMetadata = {
  name: "get-resume",
  description: "Fetch a resume by ID",
};

export default requireApiKey(async ({ resumeId }, validation) => {
  // Only authenticated users can access this
  const resume = await getResume(resumeId);
  
  // Optional: Check if user owns this resume
  if (resume.userId !== validation.userId) {
    return {
      content: [{ type: "text", text: "Access denied: You don't own this resume" }],
    };
  }
  
  return {
    content: [{ type: "text", text: JSON.stringify(resume, null, 2) }],
  };
});
```

