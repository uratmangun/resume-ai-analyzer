import { db, schema } from './index';
import { eq } from 'drizzle-orm';

export type WorkHistoryEntry = {
  companyName: string;
  role: string;
  dateOfWork: string;
  description: string;
};

export type ProjectEntry = {
  projectName: string;
  projectUrl?: string;
  projectDescription: string;
};

export type AchievementEntry = {
  achievementName: string;
  achievementUrl?: string;
  achievementDescription: string;
};

export type NewResumePayload = {
  userId: string;
  title: string;
  name: string;
  email: string;
  github?: string;
  description?: string;
  workHistory: WorkHistoryEntry[];
  projects: ProjectEntry[];
  achievements: AchievementEntry[];
};

export async function createResume(data: NewResumePayload) {
  const [resume] = await db
    .insert(schema.resumes)
    .values({
      userId: data.userId,
      title: data.title,
      name: data.name,
      email: data.email,
      github: data.github,
      description: data.description,
    })
    .returning({ id: schema.resumes.id });

  const resumeId = resume.id;

  const insertWork = data.workHistory.map((entry) =>
    db.insert(schema.workHistory).values({
      resumeId,
      companyName: entry.companyName,
      role: entry.role,
      dateOfWork: entry.dateOfWork,
      description: entry.description,
    })
  );
  const insertProjects = data.projects.map((entry) =>
    db.insert(schema.projects).values({
      resumeId,
      projectName: entry.projectName,
      projectUrl: entry.projectUrl,
      projectDescription: entry.projectDescription,
    })
  );
  const insertAchievements = data.achievements.map((entry) =>
    db.insert(schema.achievements).values({
      resumeId,
      achievementName: entry.achievementName,
      achievementUrl: entry.achievementUrl,
      achievementDescription: entry.achievementDescription,
    })
  );

  await Promise.all([...insertWork, ...insertProjects, ...insertAchievements]);

  return resumeId;
}

export async function updateResume(id: string, data: NewResumePayload) {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.resumes)
      .set({
        title: data.title,
        name: data.name,
        email: data.email,
        github: data.github,
        description: data.description,
        updatedAt: new Date(),
      })
      .where(eq(schema.resumes.id, id));

    // Replace related collections with the new payload values
    await tx.delete(schema.workHistory).where(eq(schema.workHistory.resumeId, id));
    await tx.delete(schema.projects).where(eq(schema.projects.resumeId, id));
    await tx.delete(schema.achievements).where(eq(schema.achievements.resumeId, id));

    if (data.workHistory.length > 0) {
      const inserts = data.workHistory.map((entry) =>
        tx.insert(schema.workHistory).values({
          resumeId: id,
          companyName: entry.companyName,
          role: entry.role,
          dateOfWork: entry.dateOfWork,
          description: entry.description,
        })
      );
      await Promise.all(inserts);
    }

    if (data.projects.length > 0) {
      const inserts = data.projects.map((entry) =>
        tx.insert(schema.projects).values({
          resumeId: id,
          projectName: entry.projectName,
          projectUrl: entry.projectUrl,
          projectDescription: entry.projectDescription,
        })
      );
      await Promise.all(inserts);
    }

    if (data.achievements.length > 0) {
      const inserts = data.achievements.map((entry) =>
        tx.insert(schema.achievements).values({
          resumeId: id,
          achievementName: entry.achievementName,
          achievementUrl: entry.achievementUrl,
          achievementDescription: entry.achievementDescription,
        })
      );
      await Promise.all(inserts);
    }
  });

  return id;
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
    workHistory: work.map((w) => ({
      id: w.id,
      companyName: w.companyName,
      role: w.role,
      dateOfWork: w.dateOfWork,
      description: w.description,
    })),
    projects: proj.map((p) => ({
      id: p.id,
      projectName: p.projectName,
      projectUrl: p.projectUrl,
      projectDescription: p.projectDescription,
    })),
    achievements: ach.map((a) => ({
      id: a.id,
      achievementName: a.achievementName,
      achievementUrl: a.achievementUrl,
      achievementDescription: a.achievementDescription,
    })),
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

export async function deleteResume(id: string) {
  await db.transaction(async (tx) => {
    await tx.delete(schema.workHistory).where(eq(schema.workHistory.resumeId, id));
    await tx.delete(schema.projects).where(eq(schema.projects.resumeId, id));
    await tx.delete(schema.achievements).where(eq(schema.achievements.resumeId, id));
    await tx.delete(schema.resumes).where(eq(schema.resumes.id, id));
  });
}
