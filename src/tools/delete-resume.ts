import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { getResume, deleteResume } from "../lib/db/resume";

// Define the schema for tool parameters
export const schema = {
  resumeId: z.string().uuid().describe("The UUID of the resume to delete"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "delete-resume",
  description: "Delete a specific resume by its ID",
  annotations: {
    title: "Delete Resume",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
  },
};

// Tool implementation with API key validation
export default async ({ resumeId }: InferSchema<typeof schema>, extra?: any) => {
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
  // First, check if the resume exists
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

  // Delete the resume
  await deleteResume(resumeId);

  // Return success message
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: true,
            message: "Resume deleted successfully",
            deletedResumeId: resumeId,
            resumeTitle: resume.title,
          },
          null,
          2
        ),
      },
    ],
  };
};

