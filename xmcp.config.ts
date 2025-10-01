import { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  stdio: false, // Disable STDIO (CLI) transport
  experimental: {
    adapter: "nextjs",
  },
};

export default config;
