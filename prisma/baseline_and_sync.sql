-- Spectr Database Baseline & Synchronization Script
-- Safe to execute against Supabase / Neon / PostgreSQL without losing any data.

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure User table has emailVerified column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);

-- 3. Ensure Event table has all UTM, source, and attribution columns
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'Direct';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS "Event_projectId_timestamp_idx" ON "Event"("projectId", "timestamp");
CREATE INDEX IF NOT EXISTS "Event_projectId_source_idx" ON "Event"("projectId", "source");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
