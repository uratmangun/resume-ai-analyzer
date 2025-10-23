import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getAppsSdkCompatibleHtml, baseURL } from "@/lib/apps-sdk-html";
import { getUserIdFromExtra } from "../lib/get-user-id";

// Define schemas for nested objects
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

// Define the schema for tool parameters
export const schema = {
  resumeId: z.string().uuid().describe("The UUID of the resume to edit"),
  name: z.string().optional().describe("Override name (optional)"),
  title: z.string().optional().describe("Override resume title (optional)"),
  email: z.string().email().optional().describe("Override email address (optional)"),
  github: z.string().url().optional().describe("Override GitHub profile URL (optional)"),
  description: z.string().optional().describe("Override professional summary (optional)"),
  workHistory: z.array(workHistorySchema).optional().describe("Override work history entries (optional)"),
  projects: z.array(projectSchema).optional().describe("Override project entries (optional)"),
  achievements: z.array(achievementSchema).optional().describe("Override achievement entries (optional)"),
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
  const { resumeId, name, title, email, github, description, workHistory, projects, achievements } = params;
  
  // Get the HTML for the get-resume page
  const html = await getAppsSdkCompatibleHtml(baseURL, "/resume-editor-interface");

  // Build structured content with resumeId and any override parameters
  const structuredContent: Record<string, unknown> = { resumeId };
  
  if (name !== undefined) structuredContent.name = name;
  if (title !== undefined) structuredContent.title = title;
  if (email !== undefined) structuredContent.email = email;
  if (github !== undefined) structuredContent.github = github;
  if (description !== undefined) structuredContent.description = description;
  if (workHistory !== undefined) structuredContent.workHistory = workHistory;
  if (projects !== undefined) structuredContent.projects = projects;
  if (achievements !== undefined) structuredContent.achievements = achievements;

  // Return HTML with structured content containing resumeId and optional overrides
  return {
    content: [
      {
        type: "text",
        text: `<html>${html}</html>`,
      },
    ],
    structuredContent,
  };
}
