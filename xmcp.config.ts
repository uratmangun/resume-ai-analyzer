import { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: {
    debug: false,
  },
  stdio: false, // Disable STDIO (CLI) transport
  experimental: {
    adapter: "nextjs",
  },
};

export default config;
