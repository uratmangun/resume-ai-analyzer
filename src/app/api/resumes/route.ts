import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createResume, listResumes } from '@/lib/db/resume';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const resumeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  github: z.string().url().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  workHistory: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

type ResumeInput = z.infer<typeof resumeSchema>;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data: ResumeInput = resumeSchema.parse({
      ...json,
      // Ensure arrays are arrays even if missing
      workHistory: json.workHistory ?? [],
      projects: json.projects ?? [],
      achievements: json.achievements ?? [],
    });

    const id = await createResume({
      userId,
      name: data.name,
      email: data.email,
      github: (data.github && data.github.length > 0) ? data.github : undefined,
      description: (data.description && data.description.length > 0) ? data.description : undefined,
      workHistory: data.workHistory,
      projects: data.projects,
      achievements: data.achievements,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Error creating resume', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await listResumes(userId, 20);
    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error('Error listing resumes', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
