# Tracking health and reliable delivery

The project dashboard's **Settings & Setup** tab includes Tracking health.
It reports the last activity received, the last reported tracker version, and
whether events arrived in the past five minutes. **No recent events** is not
a claim that an installation is broken. Older events remain visible using
the database when the thirty-day Redis receipt has expired.

Enter the full website URL, prepare an installation test, and open its link.
The link contains a random, project-bound token that expires in five minutes.
Tracker 2.0.0 sends a separate test event and returns before pageview, heartbeat,
or Web Vitals collection. The dashboard polls the test result. A test passes
only when the installed script reaches Spectr with that token. Redirects must
preserve the `spectr_test` query parameter. An older cached script does not
support this test and can still send ordinary analytics; reload after its cache
expires before testing. The test browser tab remains excluded while it uses
the test URL; remove that parameter to resume normal tracking.

Production requires the existing `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` configuration. Receipts and test state use shared
Redis with expiry; development without Redis uses a bounded in-memory store.
The health panel itself requires no schema migration. Test endpoints require authentication and
project ownership and return private, non-cacheable responses. URLs are not
fetched by the server or stored in health receipts.

Pageviews retry network errors, HTTP 408, 429, and 5xx responses. Each queued
delivery has at most four attempts with approximately 1s, 3s, and 10s backoff and jitter.
`Retry-After` can extend that delay and is exposed through CORS. Reconnecting
does not bypass the saved retry deadline. Pending
pageviews are bounded to twenty and expire after ten minutes. An online event
can resume a pending delivery within those limits. Other HTTP errors are not
retried. Requests time out after eight seconds in browsers with AbortController.

Every retry reuses the original pageview ID, occurrence timestamp, and payload.
The server uses the existing unique project/pageview index for deduplication,
and delayed arrivals retain their original analytics time and initial activity
time. Heartbeats start after the pageview is acknowledged. A missing pageview
heartbeat returns HTTP 409 so the tracker can recover using the original
pageview. Heartbeats are not queued, and they bypass repeated geolocation.

The delivery queue lives in memory, so closing or reloading a tab can lose
pending deliveries. Beacon fallback is best effort and cannot confirm delivery.
These limits are intentional; this implementation does not promise lossless
tracking or persist visitor URL payloads in browser storage.

Health receipt writes have a one-second Redis request timeout and a 1.2-second
upper bound before returning the tracking response. They are best effort after a successful database write. A
health-store failure cannot make a committed pageview fail or duplicate it.
The health panel reports unavailable when its shared store cannot be read.
Background polling waits for its in-flight request rather than cancelling
responses that take longer than the five-second test polling interval.

Web Vitals snapshots carry increasing sample revisions. Apply migration
`20261011010000_vitals_sample_revision` before serving this tracker. PostgreSQL
atomically accepts only newer revisions, preventing late or duplicate snapshots
from overwriting accepted measurements. Legacy clients use revision zero and
cannot overwrite versioned samples. Missing metrics do not erase known values.
Vitals reporting accepts only integer ranges from 1 to 90 days (default 28).
Run `node scripts/verify-vitals-order.cjs` explicitly against a migrated database
with at least one project to verify ordering; its test samples are rolled back.

Validation: `npm test`, `npm run lint`, `npx tsc --noEmit`, and an isolated build
with `SPECTR_BUILD_DIR=.next-verify`. Before release, perform a browser test on
an owned website, including an offline/online transition and an installation
test, and confirm normal counts are unchanged by the test visit.
