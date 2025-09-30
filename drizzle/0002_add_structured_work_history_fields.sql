-- Add new columns to work_history table
ALTER TABLE "work_history" ADD COLUMN "company_name" text;
ALTER TABLE "work_history" ADD COLUMN "role" text;
ALTER TABLE "work_history" ADD COLUMN "date_of_work" text;
ALTER TABLE "work_history" ADD COLUMN "description" text;

-- Make content nullable as we're replacing it with structured fields
ALTER TABLE "work_history" ALTER COLUMN "content" DROP NOT NULL;

-- Backfill empty values for existing rows (if any)
UPDATE "work_history" SET "company_name" = '', "role" = '', "date_of_work" = '', "description" = '' WHERE "company_name" IS NULL;

-- Set new columns as NOT NULL
ALTER TABLE "work_history" ALTER COLUMN "company_name" SET NOT NULL;
ALTER TABLE "work_history" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "work_history" ALTER COLUMN "date_of_work" SET NOT NULL;
ALTER TABLE "work_history" ALTER COLUMN "description" SET NOT NULL;
