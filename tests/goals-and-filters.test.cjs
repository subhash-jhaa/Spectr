const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const context = { exports: {}, Date, URLSearchParams, Error, console: { error() {} }, require: name => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, context);
  return context.exports;
}
const properties = load('lib/custom-events.ts');
test('event property validation rejects sensitive keys, nested payloads and oversized values', () => {
  for (const value of [null, [], { email: 'a' }, { user_id: 'a' }, { token: 'a' }, { x: {} }, { x: Infinity }, { x: 'a'.repeat(201) }, Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`key${i}`, i]))]) assert.equal(properties.eventProperties(value), null);
  assert.deepEqual(JSON.parse(JSON.stringify(properties.eventProperties({ plan: 'free', downloads: 3, success: true }))), { plan: 'free', downloads: 3, success: true });
});
const history = load('lib/history-range.ts');
test('date controls display the exact previous UTC period and comparison toggles hide metric badges', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { DateControls } = load('components/dashboard/date-controls.tsx', { '@/lib/history-range': history });
  const html = renderToStaticMarkup(React.createElement(DateControls, { days: 7, customRange: { start: '2026-01-30', end: '2026-02-02' }, compare: true, onPreset() {}, onCustom() {}, onCompare() {} }));
  assert.match(html, /type="date"/); assert.match(html, /2026-01-26 to 2026-01-29/);
  const passthrough = ({ children }) => React.createElement('div', null, children);
  const { OverviewMetrics } = load('components/dashboard/overview-metrics.tsx', {
    '@/components/ui/card': { Card: passthrough }, '@/components/dashboard/formater': { formatInteger: value => String(value) },
    '@/components/dashboard/delta': { Delta: ({ children }) => React.createElement('span', { 'data-comparison': 'yes' }, children), DeltaIcon: () => null, DeltaValue: ({ suffix }) => React.createElement('span', null, suffix) },
  });
  const data = { visitors: { current: 3, prior: 2, delta: 50, isNew: false }, pageViews: { current: 4, prior: 2, delta: 100, isNew: false }, bounceRate: { current: 25, prior: 50, delta: -25, isNew: false } };
  const render = compare => renderToStaticMarkup(React.createElement(OverviewMetrics, { data, compare }));
  assert.equal((render(true).match(/data-comparison/g) || []).length, 3);
  assert.match(render(true), / pp/);
  assert.equal((render(false).match(/data-comparison/g) || []).length, 0);
  assert.match(render(false), /25%/);
});
const json = (body, status = 200) => Response.json(body, { status });
test('an empty custom-date chart uses the selected dates instead of today', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const wrap = ({ children }) => React.createElement('div', null, children);
  let series;
  const { VisitorsChart } = load('components/dashboard/visitors-chart.tsx', {
    '@/components/dashboard/formater': { formatInteger: value => String(value) },
    '@/components/ui/card': Object.fromEntries(['Card', 'CardContent', 'CardDescription', 'CardHeader', 'CardTitle'].map(name => [name, wrap])),
    '@/components/ui/chart': { ChartContainer: wrap, ChartTooltip: () => null, ChartTooltipContent: () => null },
    '@/components/dashboard/delta': { Delta: wrap, DeltaIcon: () => null, DeltaValue: () => null },
    recharts: { AreaChart: ({ data }) => { series = data; return null; }, Area: () => null, CartesianGrid: () => null, XAxis: () => null },
  });
  renderToStaticMarkup(React.createElement(VisitorsChart, { days: 4, data: [], rangeStart: '2026-01-30', compare: false }));
  assert.deepEqual(Array.from(series, row => row.month), ['Jan 30', 'Jan 31', 'Feb 1', 'Feb 2']);
  assert.ok(series.every(row => row.pageViews === 0 && row.visitors === 0));
});
function eventRoute({ bot = false, enabled = true, anchor = true } = {}) {
  const writes = [];
  const route = load('app/api/events/route.ts', {
    '@/lib/custom-events': properties,
    '@/lib/prisma': { prisma: { project: { findUnique: async () => ({ id: 'project-a' }) }, event: { findFirst: async args => { assert.equal(args.where.projectId, 'project-a'); assert.equal(args.where.sessionId, 'session-a'); return anchor ? { source: 'Google' } : null; } }, $executeRaw: async (strings, ...values) => { writes.push({ sql: strings.join('?'), values }); return 1; } } },
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: request => request.json() },
    '@/lib/api-utils': { createErrorResponse: (error, status) => json({ error }, status), createSuccessResponse: json, getClientIP: () => 'Unknown', handleCorsPreflight() {} },
    '@/lib/traffic-filters': { isKnownBot: () => bot, botFilteringEnabled: async () => enabled },
  });
  return { route, writes };
}
const payload = { projectId: 'project-a', eventId: 'action-a', eventName: 'signup_completed', sessionId: 'session-a', pageViewId: 'pageview-a', occurredAt: Date.now(), properties: { plan: 'free' } };
const request = data => new Request('https://example.com/api/events', { method: 'POST', body: JSON.stringify(data) });
test('custom ingestion filters bots, requires an anchor, and retains retry identity without pageview writes', async () => {
  const filtered = eventRoute({ bot: true });
  assert.equal((await filtered.route.POST(request(payload))).status, 200); assert.equal(filtered.writes.length, 0);
  const missing = eventRoute({ anchor: false }); assert.equal((await missing.route.POST(request(payload))).status, 409); assert.equal(missing.writes.length, 0);
  const allowed = eventRoute({ bot: true, enabled: false });
  for (let i = 0; i < 2; i++) assert.equal((await allowed.route.POST(request(payload))).status, 200);
  assert.equal(allowed.writes.length, 2);
  assert.ok(allowed.writes.every(write => write.sql.includes('ON CONFLICT ("projectId", "eventId") DO NOTHING')));
  assert.equal(allowed.writes[0].values[2], payload.eventId);
  assert.equal(allowed.writes[0].values.at(-1).getTime(), payload.occurredAt);
  for (const data of [{ ...payload, eventName: '' }, { ...payload, properties: { password: 'x' } }, { ...payload, occurredAt: Date.now() + 600000 }]) assert.equal((await allowed.route.POST(request(data))).status, 400);
});
test('owner-only filter and goal operations reject anonymous and other-project access', async () => {
  for (const [user, owns, status] of [[null, false, 401], [{ id: 'other' }, false, 404]]) {
    const access = load('lib/project-access.ts', {
      '@/lib/api-utils': { getAuthenticatedUser: async () => user }, '@/lib/prisma': { prisma: { project: { findFirst: async () => owns ? { id: 'project-a' } : null } } }, '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }) },
    });
    const mocks = { '@/lib/project-access': access, '@/lib/history-range': history, '@/lib/custom-events': properties, '@/queries/goals': { goalStats: () => assert.fail('Unauthorized read') }, '@/lib/traffic-filters': { botFilteringEnabled: () => assert.fail('Unauthorized read') }, '@/lib/prisma': { prisma: { $executeRaw: () => assert.fail('Unauthorized write') } }, '@/lib/request-limits': { readJsonBody: request => request.json() } };
    const context = { params: Promise.resolve({ id: 'project-a' }) };
    for (const file of ['goals', 'filters']) {
      const route = load(`app/api/stats/project/[id]/${file}/route.ts`, mocks);
      assert.equal((await route.GET({ nextUrl: new URL('https://example.com?days=7') }, context)).status, status);
      const method = file === 'goals' ? 'POST' : 'PATCH';
      assert.equal((await route[method](request({ name: 'Signup', eventName: 'signup', filterBots: false }), context)).status, status);
      if (route.DELETE) assert.equal((await route.DELETE({ nextUrl: new URL('https://example.com?goalId=goal-a') }, context)).status, status);
    }
  }
});
