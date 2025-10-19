import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getAppsSdkCompatibleHtml, baseURL } from "@/lib/apps-sdk-html";

// Define the schema for tool parameters
export const schema = {
  resumeId: z.string().uuid().describe("The UUID of the resume to edit"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "resume-editor-interface",
  description: "Open resume editor UI for editing an existing resume",
  annotations: {
    title: "Edit Resume",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    openai: {
      toolInvocation: {
        invoking: "Opening resume editor",
        invoked: "Resume editor ready",
      },
      widgetAccessible: true,
      resultCanProduceWidget: true,
    },
  },
};

// Tool implementation
export default async function handler({ resumeId }: InferSchema<typeof schema>) {
  // Get the HTML for the get-resume page
  const html = await getAppsSdkCompatibleHtml(baseURL, "/resume-editor-interface");

  // Return HTML with structured content containing just the resumeId
  return {
    content: [
      {
        type: "text",
        text: `<html>${html}</html>`,
      },
    ],
    structuredContent: {
      resumeId,
    },
  };
}
