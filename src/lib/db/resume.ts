import { db, schema } from './index';
import { eq } from 'drizzle-orm';

export type NewResumePayload = {
  userId: string;
  name: string;
  email: string;
  github?: string;
  description?: string;
  workHistory: string[];
  projects: string[];
  achievements: string[];
};

export async function createResume(data: NewResumePayload) {
  const [resume] = await db
    .insert(schema.resumes)
    .values({
      userId: data.userId,
      name: data.name,
      email: data.email,
      github: data.github,
      description: data.description,
    })
    .returning({ id: schema.resumes.id });

  const resumeId = resume.id;

  const insertWork = data.workHistory.map((content) =>
    db.insert(schema.workHistory).values({ resumeId, content })
  );
  const insertProjects = data.projects.map((content) =>
    db.insert(schema.projects).values({ resumeId, content })
  );
  const insertAchievements = data.achievements.map((content) =>
    db.insert(schema.achievements).values({ resumeId, content })
  );

  await Promise.all([...insertWork, ...insertProjects, ...insertAchievements]);

  return resumeId;
}

export async function getResume(id: string) {
  const [resume] = await db.select().from(schema.resumes).where(eq(schema.resumes.id, id));
  if (!resume) return null;

  const [work, proj, ach] = await Promise.all([
    db.select().from(schema.workHistory).where(eq(schema.workHistory.resumeId, id)),
    db.select().from(schema.projects).where(eq(schema.projects.resumeId, id)),
    db.select().from(schema.achievements).where(eq(schema.achievements.resumeId, id)),
  ]);

  return {
    ...resume,
    workHistory: work.map((w) => w.content),
    projects: proj.map((p) => p.content),
    achievements: ach.map((a) => a.content),
  };
}

export async function listResumes(userId: string, limit = 20) {
  const rows = await db
    .select()
    .from(schema.resumes)
    .where(eq(schema.resumes.userId, userId))
    .orderBy(schema.resumes.createdAt)
    .limit(limit);
  return rows;
}
