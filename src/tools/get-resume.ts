import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getResume } from "../lib/db/resume";
import { getUserIdFromExtra } from "../lib/get-user-id";


// Define the schema for tool parameters
export const schema = {
  resumeId: z.string().uuid().describe("The UUID of the resume to fetch"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "get-resume",
  description: "Get a specific resume by its ID with all related data (work history, projects, achievements)",
  annotations: {
    title: "Get Resume by ID",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation with API key validation
export default async ({ resumeId }: InferSchema<typeof schema>, extra?: any) => {
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
  // Fetch the resume with all related data
  const resume = await getResume(resumeId);

  // Check if resume exists
  if (!resume) {
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
  if (resume.userId !== userId) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: "Access denied: You don't own this resume" }, null, 2),
        },
      ],
    };
  }

  // Return the complete resume data as JSON
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(resume, null, 2),
      },
    ],
  };
};

