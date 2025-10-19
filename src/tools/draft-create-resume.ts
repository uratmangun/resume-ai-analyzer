import { type ToolMetadata } from "xmcp";
import { getAppsSdkCompatibleHtml, baseURL } from "@/lib/apps-sdk-html";
import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define schemas for nested objects (same as create-resume)
const workHistorySchema = z.object({
  companyName: z.string().describe("Company name"),
  role: z.string().describe("Job role/position"),
  dateOfWork: z.string().describe("Date range of employment (e.g. 'Jan 2020 - Dec 2022')"),
  description: z.string().describe("Job responsibilities and achievements"),
});

const projectSchema = z.object({
  projectName: z.string().describe("Project name"),
  projectUrl: z.string().optional().describe("Project URL (optional)"),
  projectDescription: z.string().describe("Project description"),
});

const achievementSchema = z.object({
  achievementName: z.string().describe("Achievement name"),
  achievementUrl: z.string().optional().describe("Achievement URL (optional)"),
  achievementDescription: z.string().describe("Achievement description"),
});

// Define the schema for tool parameters (same as create-resume)
export const schema = {
  name: z.string().min(1).describe("Full name (required)"),
  title: z.string().optional().default("Untitled Resume").describe("Resume title (default: 'Untitled Resume')"),
  email: z.string().email().optional().default("").describe("Email address (optional but recommended)"),
  github: z.string().url().optional().describe("GitHub profile URL (optional)"),
  description: z.string().optional().describe("Professional summary (optional)"),
  workHistory: z.array(workHistorySchema).optional().default([]).describe("Array of work history entries (optional)"),
  projects: z.array(projectSchema).optional().default([]).describe("Array of project entries (optional)"),
  achievements: z.array(achievementSchema).optional().default([]).describe("Array of achievement entries (optional)"),
};

export const metadata: ToolMetadata = {
  name: "draft-create-resume",
  description: "Show resume creation form in ChatGPT with pre-filled data",
  _meta: {
    openai: {
      toolInvocation: {
        invoking: "Opening resume form",
        invoked: "Resume form ready",
      },
      widgetAccessible: true,
      resultCanProduceWidget: true,
    },
  },
};

export default async function handler(params: InferSchema<typeof schema>) {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/draft-create-resume");

  return {
    content: [
      {
        type: "text",
        text: `<html>${html}</html>`,
      },
    ],
    structuredContent: params,
  };
}
