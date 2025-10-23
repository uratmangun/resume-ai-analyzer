import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getAppsSdkCompatibleHtml, baseURL } from "@/lib/apps-sdk-html";
import { getUserIdFromExtra } from "../lib/get-user-id";
// Define the schema for tool parameters
export const schema = {
  resumeId: z.string().uuid().describe("The UUID of the resume to view"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "view-resume",
  description: "Open resume viewer UI to display an existing resume in read-only mode",
  annotations: {
    title: "View Resume",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    openai: {
      toolInvocation: {
        invoking: "Opening resume viewer",
        invoked: "Resume viewer ready",
      },
      widgetAccessible: true,
      resultCanProduceWidget: true,
    },
  },
};

// Tool implementation
export default async function handler(params: InferSchema<typeof schema>, extra?: any) {
  const userId = getUserIdFromExtra(extra);
  if (!userId) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: "Unauthorized: Missing user identity" }, null, 2),
        },
      ],
    };
  }
  const { resumeId } = params;
  
  // Get the HTML for the view-resume page
  const html = await getAppsSdkCompatibleHtml(baseURL, "/view-resume");

  // Return HTML with structured content containing resumeId
  return {
    content: [
      {
        type: "text",
        text: `<html>${html}</html>`,
      },
    ],
    structuredContent: { resumeId },
  };
}
