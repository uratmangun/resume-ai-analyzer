import { metadataCorsOptionsRequestHandler } from "@xmcp/adapter";

const corsHandler = metadataCorsOptionsRequestHandler();

const handler = async () => {
  const issuer = (process.env.AUTH0_ISSUER_BASE_URL || "").replace(/\/+$/, "");
  if (!issuer) {
    return new Response("Missing AUTH0_ISSUER_BASE_URL", { status: 500 });
  }
  const url = issuer + "/.well-known/openid-configuration";
  const upstream = await fetch(url, { headers: { accept: "application/json" } });
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
};

export { handler as GET, corsHandler as OPTIONS };
