import { type ResourceMetadata } from "xmcp";
import { baseURL } from "@/config/baseUrl";
export const metadata: ResourceMetadata = {
  name: "home",
  title: "Show Homepage URL",
  mimeType: "text/html+skybridge",
};
const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};
export default async function handler() {
   const html = await getAppsSdkCompatibleHtml(baseURL, "/mcp-ui");
  return `<html>${html}</html>`;
}
