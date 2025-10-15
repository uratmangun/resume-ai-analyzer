import { metadataCorsOptionsRequestHandler } from "@xmcp/adapter";
import { NextResponse } from "next/server";

const handler = async () => {
  const metadata = {
    resource: process.env.AUTH0_AUDIENCE || "urn:mcp",
    authorization_servers: [
      (process.env.AUTH0_ISSUER_BASE_URL || "").replace(/\/+$/, ""),
    ],
  };
  return NextResponse.json(metadata);
};

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
