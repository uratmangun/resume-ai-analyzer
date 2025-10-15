import { xmcpHandler, withAuth, VerifyToken } from "@xmcp/adapter";
import { createRemoteJWKSet, jwtVerify, decodeJwt } from "jose";
let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
const getJWKS = (issuer: string) => {
  if (!JWKS) {
    JWKS = createRemoteJWKSet(new URL(issuer.replace(/\/+$/, "") + "/.well-known/jwks.json"));
  }
  return JWKS;
};

const ensureTrailingSlash = (s: string) => (s.endsWith("/") ? s : s + "/");
const swapHttpScheme = (u: string) =>
  u.startsWith("http://")
    ? ("https://" + u.slice(7))
    : u.startsWith("https://")
    ? ("http://" + u.slice(8))
    : "";

/**
 * Verify the bearer token and return auth information
 * In a real implementation, this would validate against your auth service
 */
const dbg = (...args: any[]) => {
  if (process.env.DEBUG_MCP_AUTH === '1' || process.env.DEBUG_MCP_AUTH === 'true') {
    // eslint-disable-next-line no-console
    console.log('[mcp-auth]', ...args);
  }
};

const extractBearer = (req: Request, tokenArg?: string) => {
  if (tokenArg) return tokenArg;
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (h && /^Bearer\s+/.test(h)) return h.replace(/^Bearer\s+/i, "").trim();
  try {
    const url = new URL(req.url);
    const t = url.searchParams.get("access_token");
    if (t) return t;
  } catch {}
  return undefined;
};

const verifyToken: VerifyToken = async (req: Request, bearerToken?: string) => {
  const token = extractBearer(req, bearerToken);
  if (!token) {
    dbg('no bearer token');
    return undefined;
  }

  // TODO: Replace with actual token verification logic
  // This is just an example implementation
  try {
    // First, decode the JWT without verification to see the actual issuer claim
    const decoded = decodeJwt(token);
    const actualIssuer = decoded.iss as string | undefined;
    
    dbg('decoded JWT iss claim:', actualIssuer);
    
    if (!actualIssuer) {
      dbg('no iss claim in token');
      return undefined;
    }
    
    // Get the issuer base (without trailing slash) for JWKS URL
    const issuerBase = actualIssuer.replace(/\/+$/, "");
    
    // Verify using the EXACT issuer from the token
    dbg('verifying with exact issuer:', actualIssuer);
    const { payload } = await jwtVerify(token, getJWKS(issuerBase), {
      issuer: actualIssuer, // Use the exact issuer from the token
      clockTolerance: 60,
    });

    // Build accepted audiences: configured API identifier and/or the MCP resource URL(s)
    const configuredAudience = (process.env.AUTH0_AUDIENCE || "").trim();
    const appBase = (process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || "").replace(/\/+$/, "");
    const mcpResource = appBase ? `${appBase}/mcp` : "";
    const altConfigured = configuredAudience ? swapHttpScheme(configuredAudience) : "";
    const altMcpResource = mcpResource ? swapHttpScheme(mcpResource) : "";
    // Add dynamic entries derived from the incoming request origin to support tunnels
    // Derive origin from URL, and also from forwarded headers (tunnel/reverse proxy)
    let origin = "";
    try {
      origin = new URL(req.url).origin.replace(/\/+$/, "");
    } catch {}
    const xfProto = (req.headers.get("x-forwarded-proto") || "").split(",")[0]?.trim();
    const xfHost = (req.headers.get("x-forwarded-host") || "").split(",")[0]?.trim();
    const forwardedOrigin = xfProto && xfHost ? `${xfProto}://${xfHost}`.replace(/\/+$/, "") : "";
    const originMcp = origin ? `${origin}/mcp` : "";
    const originPr = origin ? `${origin}/.well-known/oauth-protected-resource` : "";
    const originPrMcp = origin ? `${origin}/.well-known/oauth-protected-resource/mcp` : "";
    const altOrigin = origin ? swapHttpScheme(origin) : "";
    const altForwardedOrigin = forwardedOrigin ? swapHttpScheme(forwardedOrigin) : "";
    const altOriginMcp = originMcp ? swapHttpScheme(originMcp) : "";
    const altOriginPr = originPr ? swapHttpScheme(originPr) : "";
    const altOriginPrMcp = originPrMcp ? swapHttpScheme(originPrMcp) : "";
    const acceptedAudiences = new Set(
      [
        configuredAudience,
        configuredAudience.replace(/\/+$/, ""),
        configuredAudience ? ensureTrailingSlash(configuredAudience) : "",
        altConfigured,
        altConfigured ? ensureTrailingSlash(altConfigured.replace(/\/+$/, "")) : "",
        mcpResource,
        mcpResource ? ensureTrailingSlash(mcpResource) : "",
        altMcpResource,
        altMcpResource ? ensureTrailingSlash(altMcpResource) : "",
        // Internal origin
        origin,
        origin ? ensureTrailingSlash(origin) : "",
        altOrigin,
        altOrigin ? ensureTrailingSlash(altOrigin) : "",
        // Forwarded (external) origin
        forwardedOrigin,
        forwardedOrigin ? ensureTrailingSlash(forwardedOrigin) : "",
        altForwardedOrigin,
        altForwardedOrigin ? ensureTrailingSlash(altForwardedOrigin) : "",
        originMcp,
        originMcp ? ensureTrailingSlash(originMcp) : "",
        altOriginMcp,
        altOriginMcp ? ensureTrailingSlash(altOriginMcp) : "",
        forwardedOrigin ? `${forwardedOrigin}/mcp` : "",
        forwardedOrigin ? ensureTrailingSlash(`${forwardedOrigin}/mcp`) : "",
        altForwardedOrigin ? `${altForwardedOrigin}/mcp` : "",
        altForwardedOrigin ? ensureTrailingSlash(`${altForwardedOrigin}/mcp`) : "",
        originPr,
        originPr ? ensureTrailingSlash(originPr) : "",
        altOriginPr,
        altOriginPr ? ensureTrailingSlash(altOriginPr) : "",
        originPrMcp,
        originPrMcp ? ensureTrailingSlash(originPrMcp) : "",
        altOriginPrMcp,
        altOriginPrMcp ? ensureTrailingSlash(altOriginPrMcp) : "",
        forwardedOrigin ? `${forwardedOrigin}/.well-known/oauth-protected-resource` : "",
        forwardedOrigin ? ensureTrailingSlash(`${forwardedOrigin}/.well-known/oauth-protected-resource`) : "",
        altForwardedOrigin ? `${altForwardedOrigin}/.well-known/oauth-protected-resource` : "",
        altForwardedOrigin ? ensureTrailingSlash(`${altForwardedOrigin}/.well-known/oauth-protected-resource`) : "",
        forwardedOrigin ? `${forwardedOrigin}/.well-known/oauth-protected-resource/mcp` : "",
        forwardedOrigin ? ensureTrailingSlash(`${forwardedOrigin}/.well-known/oauth-protected-resource/mcp`) : "",
        altForwardedOrigin ? `${altForwardedOrigin}/.well-known/oauth-protected-resource/mcp` : "",
        altForwardedOrigin ? ensureTrailingSlash(`${altForwardedOrigin}/.well-known/oauth-protected-resource/mcp`) : "",
      ].filter(Boolean)
    );

    const audClaim = payload.aud as string | string[] | undefined;
    const audOk = Array.isArray(audClaim)
      ? audClaim.some((a) => acceptedAudiences.has(a))
      : typeof audClaim === "string"
      ? acceptedAudiences.has(audClaim)
      : // If no audience configured and no app base, accept (last resort) — but prefer explicit audiences
        acceptedAudiences.size === 0;
    if (!audOk) {
      dbg('aud mismatch', { aud: payload.aud, accepted: Array.from(acceptedAudiences) });
      return undefined;
    }

    const scopeStr = (payload.scope as string) || "";
    const scopes = Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : scopeStr
      ? scopeStr.split(" ")
      : [];
    const clientId = (payload.azp || payload.client_id || "") as string;
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;

    return {
      token,
      clientId,
      scopes,
      expiresAt,
    };
  } catch (e: any) {
    dbg('jwtVerify error', e?.message || e);
    return undefined;
  }
};

const options = {
  verifyToken,
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
};

const handler = withAuth(xmcpHandler, options);

export { handler as GET, handler as POST };
