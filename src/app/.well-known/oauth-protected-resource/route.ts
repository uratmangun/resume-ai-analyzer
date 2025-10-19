import { metadataCorsOptionsRequestHandler } from "@xmcp/adapter";
import { NextResponse } from "next/server";

const handler = async (req: Request) => {
  // Build the resource URL dynamically from the request
  const appBase = (process.env.APP_BASE_URL || process.env.VERCEL_URL || "").replace(/\/+$/, "");
  let resourceUrl = appBase ? `${appBase}/mcp` : "http://localhost:3000/mcp";
  
  // If we have forwarded headers (tunnel/reverse proxy), use those
  const xfProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const xfHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (xfProto && xfHost) {
    resourceUrl = `${xfProto}://${xfHost}/mcp`;
  } else {
    // Otherwise try to derive from the request URL
    try {
      const url = new URL(req.url);
      resourceUrl = `${url.origin}/mcp`;
    } catch {}
  }
  
  const metadata = {
    resource: resourceUrl,
    authorization_servers: [
      (process.env.AUTH0_ISSUER_BASE_URL || "").replace(/\/+$/, ""),
    ],
  };
  return NextResponse.json(metadata);
};

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
