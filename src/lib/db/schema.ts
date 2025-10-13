import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  github: text('github'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workHistory = pgTable('work_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id, { onDelete: 'cascade' }),
  content: text('content'),
  companyName: text('company_name').notNull(),
  role: text('role').notNull(),
  dateOfWork: text('date_of_work').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id, { onDelete: 'cascade' }),
  content: text('content'),
  projectName: text('project_name').notNull(),
  projectUrl: text('project_url'),
  projectDescription: text('project_description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id, { onDelete: 'cascade' }),
  content: text('content'),
  achievementName: text('achievement_name').notNull(),
  achievementUrl: text('achievement_url'),
  achievementDescription: text('achievement_description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  lastUsed: timestamp('last_used'),
  createdAt: timestamp('created_at').defaultNow(),
});
