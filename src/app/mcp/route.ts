import { xmcpHandler } from "@xmcp/adapter";
import { NextRequest } from "next/server";
import { AsyncLocalStorage } from "async_hooks";

// Create AsyncLocalStorage for request context
export const requestContext = new AsyncLocalStorage<{
  apiKey?: string | null;
}>();

export async function GET(request: NextRequest) {
  // Extract query parameters
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("api-key");
  
  // Run handler within context
  return requestContext.run({ apiKey }, async () => {
    return await xmcpHandler(request);
  });
}

export async function POST(request: NextRequest) {
  // Extract query parameters
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("api-key");
  
  // Run handler within context
  return requestContext.run({ apiKey }, async () => {
    return await xmcpHandler(request);
  });
}
