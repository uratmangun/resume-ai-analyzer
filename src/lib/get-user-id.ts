import type { ToolExtraArguments } from "xmcp";

export function getUserIdFromExtra(extra?: ToolExtraArguments | Record<string, unknown> | null): string | null {
  const candidate = extra && typeof extra === "object" ? (extra as ToolExtraArguments).authInfo : undefined;
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
