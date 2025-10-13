import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { createResume, getResume } from "../lib/db/resume";
import type { WorkHistoryEntry, ProjectEntry, AchievementEntry } from "../lib/db/resume";

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
  name: z.string().min(1).describe("Full name (required)"),
  title: z.string().optional().default("Untitled Resume").describe("Resume title (default: 'Untitled Resume')"),
  email: z.string().email().optional().default("").describe("Email address (optional but recommended)"),
  github: z.string().url().optional().describe("GitHub profile URL (optional)"),
  description: z.string().optional().describe("Professional summary (optional)"),
  workHistory: z.array(workHistorySchema).optional().default([]).describe("Array of work history entries (optional)"),
  projects: z.array(projectSchema).optional().default([]).describe("Array of project entries (optional)"),
  achievements: z.array(achievementSchema).optional().default([]).describe("Array of achievement entries (optional)"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "create-resume",
  description: "Create a new resume with work history, projects, and achievements. Only name is required, all other fields are optional.",
  annotations: {
    title: "Create Resume",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

// Tool implementation with API key validation
export default async (params: InferSchema<typeof schema>, extra?: any) => {
  const userId: string | undefined = extra?.extra?.userId;
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
  try {
    // Filter out empty entries from arrays (matching frontend behavior)
    const filteredWorkHistory = (params.workHistory || []).filter((entry) =>
      entry.companyName.trim().length > 0 ||
      entry.role.trim().length > 0 ||
      entry.dateOfWork.trim().length > 0 ||
      entry.description.trim().length > 0
    );

    const filteredProjects = (params.projects || []).filter((entry) =>
      entry.projectName.trim().length > 0 ||
      (entry.projectUrl && entry.projectUrl.trim().length > 0) ||
      entry.projectDescription.trim().length > 0
    );

    const filteredAchievements = (params.achievements || []).filter((entry) =>
      entry.achievementName.trim().length > 0 ||
      (entry.achievementUrl && entry.achievementUrl.trim().length > 0) ||
      entry.achievementDescription.trim().length > 0
    );

    // Create the resume
    const resumeId = await createResume({
      userId: userId!,
      title: params.title || "Untitled Resume",
      name: params.name,
      email: params.email || "",
      github: params.github && params.github.trim().length > 0 ? params.github : undefined,
      description: params.description && params.description.trim().length > 0 ? params.description : undefined,
      workHistory: filteredWorkHistory as unknown as WorkHistoryEntry[],
      projects: filteredProjects as unknown as ProjectEntry[],
      achievements: filteredAchievements as unknown as AchievementEntry[],
    });

    // Fetch the complete resume to return to the user
    const createdResume = await getResume(resumeId);

    // Return success message with the created resume
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "Resume created successfully",
              resumeId,
              resume: createdResume,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: any) {
    // Handle any errors during resume creation
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Failed to create resume",
              details: error?.message || "Unknown error",
            },
            null,
            2
          ),
        },
      ],
    };
  }
};

