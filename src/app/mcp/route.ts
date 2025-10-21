import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { xmcpHandler, withAuth, VerifyToken } from "@xmcp/adapter";

/**
 * Verify the bearer token and return auth information
 * In a real implementation, this would validate against your auth service
 */
const verifyToken: VerifyToken = async (req: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;

  // TODO: Replace with actual token verification logic
  // This is just an example implementation
  const clerkAuth = await auth({ acceptsToken: "oauth_token" as const });
  return verifyClerkToken(clerkAuth as any, bearerToken);
};

const options = {
  verifyToken,
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
};

const handler = withAuth(xmcpHandler, options);

export { handler as GET, handler as POST };