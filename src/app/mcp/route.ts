import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { xmcpHandler, withAuth, VerifyToken } from "@xmcp/adapter";

const verifyToken: VerifyToken = async (req: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;
  const clerkAuth = await auth({ acceptsToken: "oauth_token" as const });
  return verifyClerkToken(clerkAuth as any, bearerToken);
};

const options = {
  verifyToken,
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
};

const handler = withAuth(xmcpHandler, options);

// Explicit OPTIONS/HEAD handlers to help with CORS/preflight and avoid 405 for common probes.
export async function OPTIONS() {
  const allowed = "GET, POST, OPTIONS, HEAD";
  return new Response(null, {
    status: 204,
    headers: {
      Allow: allowed,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": allowed,
      "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    },
  });
}

export async function HEAD() {
  const allowed = "GET, POST, OPTIONS, HEAD";
  return new Response(null, {
    status: 204,
    headers: {
      Allow: allowed,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// GET: Only forward to XMCP when using Server-Sent Events; otherwise return a helpful message.
export async function GET(req: Request) {
  const accept = req.headers.get("accept") || "";

  // XMCP GET over HTTP uses SSE. If not requesting SSE, provide guidance instead of 405.
  if (accept.includes("text/event-stream")) {
    // Forward to the authenticated XMCP handler (will enforce Bearer/OAuth requirements).
    // @ts-expect-error Next.js allows a second context arg; we don't need it here.
    return handler(req);
  }

  return new Response(
    JSON.stringify(
      {
        ok: true,
        endpoint: "/mcp",
        message:
          "This is the MCP endpoint. Use GET with Accept: text/event-stream for SSE, or POST application/json per MCP HTTP transport.",
        requiresAuth: true,
        authMetadata: "/.well-known/oauth-authorization-server",
        resourceMetadata: "/.well-known/oauth-protected-resource/mcp",
        methods: ["GET (SSE)", "POST"],
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

// POST: Forward directly to the authenticated XMCP handler.
export { handler as POST };
