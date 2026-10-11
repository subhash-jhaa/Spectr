ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "filterBots" BOOLEAN NOT NULL DEFAULT TRUE;
CREATE TABLE IF NOT EXISTS "Goal" (
  "id" TEXT PRIMARY KEY, "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL, "eventName" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("projectId", "eventName")
);
CREATE TABLE IF NOT EXISTS "CustomEvent" (
  "id" TEXT PRIMARY KEY, "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "eventId" TEXT NOT NULL, "eventName" TEXT NOT NULL, "sessionId" TEXT NOT NULL,
  "pageViewId" TEXT NOT NULL, "source" TEXT NOT NULL, "properties" JSONB NOT NULL DEFAULT '{}',
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("projectId", "eventId")
);
CREATE INDEX IF NOT EXISTS "CustomEvent_projectId_timestamp_eventName_idx" ON "CustomEvent" ("projectId", "timestamp", "eventName");
