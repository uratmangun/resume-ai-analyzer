import { baseURL } from "@/config/baseUrl";

export const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

export { baseURL };
