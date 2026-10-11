// Explicit PostgreSQL smoke test; all fixtures and updates roll back.
require('@next/env').loadEnvConfig(process.cwd());
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_GOALS_TEST');
function load(file, modules) {
  const context = { exports: {}, Date, Error, console, require: name => name in modules ? modules[name] : require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
async function verify(tx) {
  const user = await tx.user.create({ data: { email: `verify-${randomUUID()}@verification.invalid` } });
  const project = await tx.project.create({ data: { name: 'Temporary rollback verification', userId: user.id } });
  const modules = { '@/lib/prisma': { prisma: tx }, '@/lib/source-classifier': load('lib/source-classifier.ts', {}), '@/lib/channel-classifier': load('lib/channel-classifier.ts', {}) };
  const history = load('lib/history-range.ts', {}); modules['@/lib/history-range'] = history;
  const { EventQueries } = load('queries/event.ts', modules);
  const { goalStats } = load('queries/goals.ts', modules);
  const filters = load('lib/traffic-filters.ts', modules);
  const range = history.parseHistorySelection(new URLSearchParams('start=2026-01-30&end=2026-02-02'), new Date('2026-10-11'));
  const anchors = [];
  for (const [sessionId, source, timestamp] of [['google-session', 'Google', '2026-01-30T00:00:00Z'], ['google-session', 'Direct', '2026-01-31T12:00:00Z'], ['direct-session', 'Direct', '2026-02-02T23:59:59Z'], ['no-conversion', 'Google', '2026-02-01T12:00:00Z'], ['prior-session', 'Direct', '2026-01-29T23:59:59Z'], ['outside-session', 'Direct', '2026-02-03T00:00:00Z']]) {
    anchors.push(await tx.event.create({ data: { projectId: project.id, sessionId, pageViewId: randomUUID(), pageUrl: 'https://verification.invalid/page', referrer: '', source, userAgent: 'Mozilla/5.0', ip: 'Unknown', country: 'Unknown', city: 'Unknown', timestamp: new Date(timestamp), lastSeenAt: new Date(timestamp) } }));
  }
  const goalId = randomUUID();
  await tx.$executeRaw`INSERT INTO "Goal" ("id", "projectId", "name", "eventName") VALUES (${goalId}, ${project.id}, 'Signup', 'signup_completed')`;
  for (const [anchorIndex, timestamp] of [[0, '2026-01-30T01:00:00Z'], [0, '2026-01-30T02:00:00Z'], [2, '2026-02-02T23:59:59Z'], [5, '2026-02-03T00:00:00Z']]) {
    const anchor = anchors[anchorIndex];
    const eventId = randomUUID();
    for (let retry = 0; retry < 2; retry++) await tx.$executeRaw`INSERT INTO "CustomEvent" ("id", "projectId", "eventId", "eventName", "sessionId", "pageViewId", "source", "timestamp") VALUES (${randomUUID()}, ${project.id}, ${eventId}, 'signup_completed', ${anchor.sessionId}, ${anchor.pageViewId}, ${anchor.source}, ${new Date(timestamp)}) ON CONFLICT ("projectId", "eventId") DO NOTHING`;
  }
  const goals = await goalStats(project.id, range);
  assert.equal(goals.length, 1); assert.equal(goals[0].sessions, 3); assert.equal(goals[0].convertedSessions, 2); assert.equal(goals[0].conversions, 3); assert.equal(goals[0].conversionRate, 66.67);
  assert.equal(goals[0].sources.find(row => row.source === 'Google').conversionRate, 50);
  assert.equal(goals[0].sources.find(row => row.source === 'Direct').conversionRate, 100);
  const daily = await EventQueries.getDailyStats(project.id, range);
  assert.equal(daily.success, true); assert.equal(daily.data.length, 4); assert.equal(daily.data.reduce((sum, row) => sum + row.pageViews, 0), 4);
  const overview = await EventQueries.getOverviewMetrics(project.id, range);
  assert.equal(overview.success, true); assert.equal(overview.data.pageViews.current, 4); assert.equal(overview.data.pageViews.prior, 1);
  for (const method of ['getCountryStats', 'getReferrerStats', 'getPageStats', 'getBrowserStats', 'getDeviceStats', 'getSourceStats', 'getAudienceMix']) assert.equal((await EventQueries[method](project.id, range)).success, true, method);
  assert.equal((await EventQueries.getReferrerBreakdown(project.id, 'source', range)).success, true);
  assert.equal(await filters.botFilteringEnabled(project.id), true);
  await tx.$executeRaw`UPDATE "Project" SET "filterBots" = FALSE WHERE "id" = ${project.id}`;
  assert.equal(await filters.botFilteringEnabled(project.id), false);
  assert.equal(filters.isKnownBot('Googlebot/2.1'), true); assert.equal(filters.isKnownBot('Mozilla/5.0'), false);
  const response = (body, status = 200) => Response.json(body, { status });
  const goalRoute = load('app/api/stats/project/[id]/goals/route.ts', {
    ...modules, '@/lib/prisma': { prisma: new Proxy(tx, { get: (target, key) => key === '$transaction' ? callback => callback(tx) : target[key] }) },
    '@/lib/project-access': { ownedProject: async () => ({ id: project.id }), privateJson: response },
    '@/lib/request-limits': { readJsonBody: request => request.json() }, '@/lib/custom-events': load('lib/custom-events.ts', {}), '@/queries/goals': { goalStats },
  });
  const context = { params: Promise.resolve({ id: project.id }) };
  const goalRequest = () => new Request('https://verification.invalid/goals', { method: 'POST', body: JSON.stringify({ name: 'Download', eventName: 'download' }) });
  assert.equal((await goalRoute.POST(goalRequest(), context)).status, 201);
  assert.equal((await goalRoute.POST(goalRequest(), context)).status, 409);
  const actionRoute = load('app/api/events/route.ts', {
    ...modules, '@/lib/custom-events': load('lib/custom-events.ts', {}), '@/lib/traffic-filters': filters,
    '@/lib/request-limits': { readJsonBody: request => request.json(), checkRateLimit: async () => ({ status: 200 }) },
    '@/lib/api-utils': { createSuccessResponse: response, createErrorResponse: (error, status) => response({ error }, status), getClientIP: () => 'Unknown', handleCorsPreflight() {} },
  });
  const eventId = randomUUID();
  const action = { projectId: project.id, eventId, eventName: 'download', sessionId: anchors[0].sessionId, pageViewId: anchors[0].pageViewId, occurredAt: Date.now() };
  for (let retry = 0; retry < 2; retry++) assert.equal((await actionRoute.POST(new Request('https://verification.invalid/events', { method: 'POST', body: JSON.stringify(action) }))).status, 200);
  const stored = await tx.$queryRaw`SELECT COUNT(*)::int AS count FROM "CustomEvent" WHERE "projectId" = ${project.id} AND "eventId" = ${eventId}`;
  assert.equal(stored[0].count, 1);
  throw rollback;
}
(async () => {
  try { try { await prisma.$transaction(verify, { timeout: 45000 }); } catch (error) { if (error !== rollback) throw error; }
    console.log('PASS: PostgreSQL goal conversion rates, source attribution, duplicate events, custom ranges, all reports, prior comparison and filter toggles. Fixtures rolled back.');
  } catch (error) { console.error('Goals/range verification failed:', error.code || error.message || error.name); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
})();
