-- Add new columns to projects table
ALTER TABLE "projects" ADD COLUMN "project_name" text;
ALTER TABLE "projects" ADD COLUMN "project_url" text;
ALTER TABLE "projects" ADD COLUMN "project_description" text;

-- Make content nullable as we're replacing it with structured fields
ALTER TABLE "projects" ALTER COLUMN "content" DROP NOT NULL;

-- Backfill empty values for existing rows (if any)
UPDATE "projects" SET "project_name" = '', "project_description" = '' WHERE "project_name" IS NULL;

-- Set new columns as NOT NULL (except project_url which is optional)
ALTER TABLE "projects" ALTER COLUMN "project_name" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "project_description" SET NOT NULL;
