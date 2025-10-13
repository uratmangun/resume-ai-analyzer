import { db } from "./db";
import { apiKeys } from "./db/schema";
import { eq } from "drizzle-orm";

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
  const apiKey = undefined as string | undefined;

  // Check if API key is provided
  if (!apiKey) {
    return {
      isValid: false,
      error: "API key doesn't exist. Please register and create your API key to use the MCP server.",
    };
  }

  // Short-circuit: API key auth deprecated in favor of OAuth
  return {
    isValid: false,
    error: "API key auth is disabled. Use OAuth access token.",
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

