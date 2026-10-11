# Production release

Before deploying the application:

1. Back up the database. Run `npx prisma migrate deploy` against staging first, then production. The new migration adds WebVital, AskQueryLog, event activity timestamps, and sample/pageview uniqueness. For databases previously managed with db push, reconcile migration history and inspect schema differences first; do not reset a production database.
2. Generate the client with `npx prisma generate`, then build and deploy. Apply the database migration before serving the new tracker.
3. Set valid UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Production ingestion and AI return 503 if shared rate limiting cannot run. Configure the hosting proxy to overwrite client-IP headers so callers cannot forge rate-limit identifiers.
4. Rotate INTERNAL_SHARED_SECRET in both the application and the AI service if the previously hardcoded test credential was used. The repository no longer supplies a fallback. Credential rotation must happen in the actual service environment; deleting source does not revoke it.
5. Review and run scripts/redact-historical-ips.sql after backup to remove full IPs already stored. New events store Unknown in the legacy IP column and use random tab sessions. Audit any retained URLs or UTM values from historical collection for personal data.
6. Verify OAuth login, project creation/deletion, anonymous and cross-user vitals access, pageviews/heartbeats, vitals samples, and AI responses on staging. Paid plans are explicitly coming soon and cannot be purchased.

Pageview timestamp is immutable; lastSeenAt is used for live activity. The tracker sends pageViewId for retry deduplication and sampleId for vitals updates. Old cached trackers cannot provide these identifiers and may still overcount until their cache expires.

Audience Mix now describes single-page versus multi-page sessions. Returning people cannot be measured with tab-scoped sessions; the legacy API field names are preserved for compatibility only.
