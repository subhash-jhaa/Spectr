# Traffic filters, custom events, and reporting dates

Settings & Setup → Traffic filters shows whether known-bot exclusion is active. It defaults to on and applies to new pageviews, custom events, and Web Vitals. Detection uses recognized user-agent patterns; it cannot detect every disguised bot. Changing the setting does not rewrite historical data.

To exclude internal visits, enter your tracked website URL and open **Exclude this browser** in each browser used by your team. The website displays a confirmation. The tracker stores a project-specific exclusion flag on that website's origin in localStorage, with sessionStorage as a fallback when persistent storage is unavailable. Exclusion stops pageviews, heartbeats, custom events, and vitals. It does not store IP addresses. The dashboard cannot read another website's browser storage; the confirmation on the tracked site reports that browser's status. Clearing storage removes the exclusion. Open **Enable tracking again**, then a normal page, to resume. The configuration-link page itself never records analytics. Tracker 2.1.1 allows an explicit installation probe in an excluded browser without recording analytics or changing the exclusion setting.

## Custom actions and goals

After the tracking script has loaded, call this only when the action succeeds:

```js
window.spectr?.track('signup_completed', { plan: 'free' });
window.spectr?.track('form_submitted', { form: 'contact' });
window.spectr?.track('download', { file: 'product-guide' });
```

The API returns `true` when an action enters the delivery queue, not when the server confirms it. Missing scripts, excluded browsers, installation tests, unavailable fetch, invalid event names, and invalid properties produce `false` (optional chaining returns undefined if the script is absent). Actions are instrumented by the website owner; the tracker does not automatically inspect forms or downloads.

Names must start with a letter and contain up to 64 letters, digits, underscores, dots, colons, or hyphens. Properties allow at most ten short keys with scalar string (200 characters maximum), finite number, or boolean values. Common sensitive keys are rejected. Never send personal data or secrets under any key. Properties are stored for each event; this release groups reports by event name and traffic source, not by property.

Add the matching event name in **Events & conversion goals** on the overview. Up to 50 goals are supported per project, with one goal per event name. Removing a goal keeps recorded events; adding it again includes matching retained events.

Conversion rate is distinct sessions with at least one matching event divided by tracked sessions in the selected period. Repeated actions increase event totals without increasing converted-session totals. Source attribution uses the session's first pageview within the selected period. Only sessions with a pageview in that period contribute; sessions are browser-tab sessions, not identified people. Events stay separate from pageviews and do not inflate traffic or change bounce calculations.

Delivery waits for the anchor pageview's acknowledgement, retries temporary failures with the original ID and timestamp, and handles missing anchors with a recoverable conflict. PostgreSQL enforces uniqueness per project and event ID. The in-memory queue is bounded to 20 entries, four total attempts, and ten minutes. Closing the page or browser can still lose pending events. Custom events use `/api/events`; a custom `data-api` tracking proxy must forward the sibling `/events` path too.

## Dates and comparison

The date dropdown retains 7/15/30 days and adds native calendar inputs. Custom dates include both selected dates, support 1–366 days, start no earlier than 2000-01-01, and end today or earlier. Reports use UTC midnight at the start and midnight after the final day as an exclusive end. Empty chart days are zero-filled.

**Compare with previous period** toggles the overview and chart comparison badges. The previous period has the same number of calendar days and ends immediately before the selected start. The controls show its dates. Relative changes apply to visitors/pageviews; bounce-rate changes use percentage points. A period containing today is incomplete. Live visitors and the separate Web Vitals window keep their own time windows.

Daily, pages, countries, referrers, sources, browsers, devices, audience, referrer breakdown, goals, and CSV exports use the same selected range. CSV exports keep the existing supported reports; goal CSV export is not included.

## Deployment and verification

Apply `prisma/migrations/20261011020000_goals_and_filters/migration.sql` before deploying code and regenerate the Prisma client as part of installation. Use the project's established migration process; do not reset the database. The migration adds the filter flag, Goal table, CustomEvent table, uniqueness constraints, and report index. Tracker version 2.1.0 is required for browser exclusions and custom actions; existing script installations get it when the hosted script cache refreshes.

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, and `npm run build`. With configured database access, `node scripts/verify-goals-and-ranges.cjs` verifies actual PostgreSQL date boundaries, source conversion rates, idempotency, reporting SQL, and filter toggles in a transaction that rolls back every fixture.
