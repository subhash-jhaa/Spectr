-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'Direct';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_projectId_timestamp_idx" ON "Event"("projectId", "timestamp");
CREATE INDEX IF NOT EXISTS "Event_projectId_source_idx" ON "Event"("projectId", "source");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
