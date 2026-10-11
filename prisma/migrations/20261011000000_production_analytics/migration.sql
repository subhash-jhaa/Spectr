ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "updatedAt" DROP NOT NULL;
CREATE TABLE IF NOT EXISTS "WebVital" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "lcp" DOUBLE PRECISION,
  "inp" DOUBLE PRECISION, "cls" DOUBLE PRECISION, "pageUrl" TEXT NOT NULL,
  "device" TEXT, "sampleId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebVital_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebVital_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE "WebVital" ADD COLUMN IF NOT EXISTS "sampleId" TEXT;
CREATE INDEX IF NOT EXISTS "WebVital_projectId_createdAt_idx" ON "WebVital"("projectId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "WebVital_projectId_sampleId_key" ON "WebVital"("projectId", "sampleId");
CREATE TABLE IF NOT EXISTS "AskQueryLog" (
  "id" TEXT NOT NULL, "siteId" TEXT NOT NULL, "question" TEXT NOT NULL,
  "templateUsed" TEXT, "pathTaken" TEXT NOT NULL, "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AskQueryLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AskQueryLog_siteId_createdAt_idx" ON "AskQueryLog"("siteId", "createdAt");
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);
UPDATE "Event" SET "lastSeenAt" = "timestamp" WHERE "lastSeenAt" IS NULL;
ALTER TABLE "Event" ALTER COLUMN "lastSeenAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ALTER COLUMN "lastSeenAt" SET NOT NULL;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "pageViewId" TEXT;
CREATE INDEX IF NOT EXISTS "Event_projectId_lastSeenAt_idx" ON "Event"("projectId", "lastSeenAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Event_projectId_pageViewId_key" ON "Event"("projectId", "pageViewId");
