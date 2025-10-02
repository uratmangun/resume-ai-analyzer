import { db } from "./db";
import { apiKeys } from "./db/schema";
import { eq } from "drizzle-orm";
import { requestContext } from "../app/mcp/route";

export type ApiKeyValidationResult = {
  isValid: boolean;
  apiKey?: string;
  userId?: string;
  error?: string;
};

/**
 * Validates the API key from the request context
 * @returns Validation result with API key details or error message
 */
export async function validateApiKey(): Promise<ApiKeyValidationResult> {
  // Access the API key from request context
  const context = requestContext.getStore();
  const apiKey = context?.apiKey;

  // Check if API key is provided
  if (!apiKey) {
    return {
      isValid: false,
      error: "API key doesn't exist. Please register and create your API key to use the MCP server.",
    };
  }

  // Validate API key against database
  const [existingKey] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, apiKey))
    .limit(1);

  if (!existingKey) {
    return {
      isValid: false,
      error: "API key doesn't exist. Please register and create your API key to use the MCP server.",
    };
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsed: new Date() })
    .where(eq(apiKeys.key, apiKey));

  return {
    isValid: true,
    apiKey: existingKey.key,
    userId: existingKey.userId,
  };
}

/**
 * Middleware-like wrapper for tools that require API key validation
 * @param toolFunction The tool function to execute if API key is valid
 * @returns Wrapped function that validates API key before execution
 */
export function requireApiKey<T extends Record<string, any>, R>(
  toolFunction: (params: T, validation: ApiKeyValidationResult) => Promise<R>
) {
  return async (params: T): Promise<R> => {
    const validation = await validateApiKey();

    if (!validation.isValid) {
      return {
        content: [{ type: "text", text: validation.error }],
      } as R;
    }

    return toolFunction(params, validation);
  };
}

