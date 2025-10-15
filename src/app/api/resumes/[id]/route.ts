import auth0 from '@/lib/auth0';
import { NextResponse } from 'next/server';
import { getResume, updateResume, deleteResume } from '@/lib/db/resume';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const resume = await getResume(id);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Verify the resume belongs to the requesting user
    if (resume.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const workHistorySchema = z.object({
  companyName: z.string(),
  role: z.string(),
  dateOfWork: z.string(),
  description: z.string(),
});

const projectSchema = z.object({
  projectName: z.string(),
  projectUrl: z.string().optional(),
  projectDescription: z.string(),
});

const achievementSchema = z.object({
  achievementName: z.string(),
  achievementUrl: z.string().optional(),
  achievementDescription: z.string(),
});

const resumeSchema = z.object({
  title: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  github: z.string().url().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  workHistory: z.array(workHistorySchema).default([]),
  projects: z.array(projectSchema).default([]),
  achievements: z.array(achievementSchema).default([]),
});

type ResumeInput = z.infer<typeof resumeSchema>;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getResume(id);
    if (!existing) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const data: ResumeInput = resumeSchema.parse({
      ...json,
      workHistory: json.workHistory ?? [],
      projects: json.projects ?? [],
      achievements: json.achievements ?? [],
    });

    await updateResume(id, {
      userId,
      title: data.title,
      name: data.name,
      email: data.email,
      github: data.github && data.github.length > 0 ? data.github : undefined,
      description: data.description && data.description.length > 0 ? data.description : undefined,
      workHistory: data.workHistory.map((w) => ({
        companyName: w.companyName,
        role: w.role,
        dateOfWork: w.dateOfWork,
        description: w.description,
      })),
      projects: data.projects.map((p) => ({
        projectName: p.projectName,
        projectUrl: p.projectUrl,
        projectDescription: p.projectDescription,
      })),
      achievements: data.achievements.map((a) => ({
        achievementName: a.achievementName,
        achievementUrl: a.achievementUrl,
        achievementDescription: a.achievementDescription,
      })),
    });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getResume(id);
    if (!existing) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteResume(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
