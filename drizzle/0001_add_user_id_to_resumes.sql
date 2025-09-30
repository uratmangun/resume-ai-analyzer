ALTER TABLE "resumes" ADD COLUMN "user_id" text;
-- Backfill existing rows to a non-null value
UPDATE "resumes" SET "user_id" = '' WHERE "user_id" IS NULL;
ALTER TABLE "resumes" ALTER COLUMN "user_id" SET NOT NULL;
