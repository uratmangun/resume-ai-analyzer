-- Add new columns to achievements table
ALTER TABLE "achievements" ADD COLUMN "achievement_name" text;
ALTER TABLE "achievements" ADD COLUMN "achievement_url" text;
ALTER TABLE "achievements" ADD COLUMN "achievement_description" text;

-- Make content nullable as we're replacing it with structured fields
ALTER TABLE "achievements" ALTER COLUMN "content" DROP NOT NULL;

-- Backfill empty values for existing rows (if any)
UPDATE "achievements" SET "achievement_name" = '', "achievement_description" = '' WHERE "achievement_name" IS NULL;

-- Set new columns as NOT NULL (except achievement_url which is optional)
ALTER TABLE "achievements" ALTER COLUMN "achievement_name" SET NOT NULL;
ALTER TABLE "achievements" ALTER COLUMN "achievement_description" SET NOT NULL;
