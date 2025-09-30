-- Add title column to resumes table
ALTER TABLE "resumes" ADD COLUMN "title" text;

-- Backfill existing rows with a default title
UPDATE "resumes" SET "title" = 'My Resume' WHERE "title" IS NULL;

-- Set title as NOT NULL
ALTER TABLE "resumes" ALTER COLUMN "title" SET NOT NULL;
