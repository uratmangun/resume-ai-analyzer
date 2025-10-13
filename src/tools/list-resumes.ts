import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { db } from "../lib/db";
import { resumes } from "../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserIdFromExtra } from "../lib/get-user-id";

// Define the schema for tool parameters
export const schema = {
  limit: z.number().optional().describe("Maximum number of resumes to return (default: 20)"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "list-resumes",
  description: "List all resumes for the authenticated user",
  annotations: {
    title: "List User Resumes",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation with API key validation
export default async ({ limit = 20 }: InferSchema<typeof schema>, extra?: any) => {
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
  // Fetch all resumes for the authenticated user
  const userResumes = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      name: resumes.name,
      email: resumes.email,
      github: resumes.github,
      description: resumes.description,
      createdAt: resumes.createdAt,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId!))
    .orderBy(desc(resumes.createdAt))
    .limit(limit);

  // Return raw data as JSON
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(userResumes, null, 2),
      },
    ],
  };
};

