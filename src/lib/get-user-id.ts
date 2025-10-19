import type { ToolExtraArguments } from "xmcp";

/**
 * Decode JWT token without verification to extract the payload
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getUserIdFromExtra(extra?: ToolExtraArguments | Record<string, unknown> | null): string | null {
  // Try to get authInfo from extra
  const candidate = extra && typeof extra === "object" ? (extra as ToolExtraArguments).authInfo : undefined;
  
  // First, try to extract userId from the JWT token in authInfo
  if (candidate && typeof candidate === "object" && "token" in candidate) {
    const token = candidate.token;
    if (typeof token === "string" && token.length > 0) {
      const payload = decodeJwtPayload(token);
      if (payload && typeof payload.sub === "string" && payload.sub.length > 0) {
        return payload.sub;
      }
    }
  }
  
  // Fallback: Try the old method for backward compatibility
  const authUserId = typeof candidate?.extra === "object" && candidate?.extra !== null
    ? (candidate.extra as Record<string, unknown>).userId
    : undefined;
  if (typeof authUserId === "string" && authUserId.length > 0) {
    return authUserId;
  }
  
  const fallbackUserId = (extra as Record<string, unknown> | undefined)?.extra;
  if (fallbackUserId && typeof (fallbackUserId as Record<string, unknown>).userId === "string") {
    const value = (fallbackUserId as Record<string, unknown>).userId as string;
    return value.length > 0 ? value : null;
  }
  
  return null;
}
