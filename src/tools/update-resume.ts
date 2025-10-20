import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getResume, updateResume } from "../lib/db/resume";
import type { AchievementEntry, ProjectEntry, WorkHistoryEntry } from "../lib/db/resume";
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
  resumeId: z.string().uuid().describe("The UUID of the resume to update"),
  name: z.string().min(1).optional().describe("Full name (optional, will keep existing if not provided)"),
  title: z.string().optional().describe("Resume title (optional, will keep existing if not provided)"),
  email: z.string().email().optional().describe("Email address (optional, will keep existing if not provided)"),
  github: z.string().url().optional().describe("GitHub profile URL (optional, will keep existing if not provided)"),
  description: z.string().optional().describe("Professional summary (optional, will keep existing if not provided)"),
  workHistory: z.array(workHistorySchema).optional().describe("Array of work history entries (optional, will keep existing if not provided)"),
  projects: z.array(projectSchema).optional().describe("Array of project entries (optional, will keep existing if not provided)"),
  achievements: z.array(achievementSchema).optional().describe("Array of achievement entries (optional, will keep existing if not provided)"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "update-resume",
  description: "Update an existing resume with new data. Only updates the fields that are explicitly provided, preserving existing values for fields that are not included in the update.",
  annotations: {
    title: "Update Resume",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation with API key validation
export default async (params: InferSchema<typeof schema>, extra?: any) => {
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
  try {
    // First, check if the resume exists
    const existingResume = await getResume(params.resumeId);

    // Check if resume exists
    if (!existingResume) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Resume not found" }, null, 2),
          },
        ],
      };
    }

    // Verify that the resume belongs to the authenticated user
    if (existingResume.userId !== userId) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Access denied: You don't own this resume" }, null, 2),
          },
        ],
      };
    }

    // Merge new data with existing data - only update fields that are explicitly provided
    const updatedData = {
      userId: userId!,
      title: params.title !== undefined ? params.title : existingResume.title,
      name: params.name !== undefined ? params.name : existingResume.name,
      email: params.email !== undefined ? params.email : existingResume.email,
      github: params.github !== undefined 
        ? (params.github.trim().length > 0 ? params.github : undefined)
        : existingResume.github,
      description: params.description !== undefined
        ? (params.description.trim().length > 0 ? params.description : undefined)
        : existingResume.description,
      workHistory: [] as WorkHistoryEntry[],
      projects: [] as ProjectEntry[],
      achievements: [] as AchievementEntry[],
    };

    // Handle workHistory - use provided or keep existing
    if (params.workHistory !== undefined) {
      updatedData.workHistory = params.workHistory.filter((entry) =>
        entry.companyName.trim().length > 0 ||
        entry.role.trim().length > 0 ||
        entry.dateOfWork.trim().length > 0 ||
        entry.description.trim().length > 0
      ) as WorkHistoryEntry[];
    } else {
      updatedData.workHistory = existingResume.workHistory as WorkHistoryEntry[];
    }

    // Handle projects - use provided or keep existing
    if (params.projects !== undefined) {
      updatedData.projects = params.projects.filter((entry) =>
        entry.projectName.trim().length > 0 ||
        (entry.projectUrl && entry.projectUrl.trim().length > 0) ||
        entry.projectDescription.trim().length > 0
      ) as ProjectEntry[];
    } else {
      updatedData.projects = existingResume.projects as ProjectEntry[];
    }

    // Handle achievements - use provided or keep existing
    if (params.achievements !== undefined) {
      updatedData.achievements = params.achievements.filter((entry) =>
        entry.achievementName.trim().length > 0 ||
        (entry.achievementUrl && entry.achievementUrl.trim().length > 0) ||
        entry.achievementDescription.trim().length > 0
      ) as AchievementEntry[];
    } else {
      updatedData.achievements = existingResume.achievements as AchievementEntry[];
    }

    // Update the resume
    await updateResume(params.resumeId, updatedData);

    // Fetch the updated resume to return to the user
    const updatedResume = await getResume(params.resumeId);

    // Return success message with the updated resume
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "Resume updated successfully",
              resumeId: params.resumeId,
              resume: updatedResume,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: any) {
    // Handle any errors during resume update
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Failed to update resume",
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

