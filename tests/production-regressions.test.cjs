const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function load(file, mocks, env = {}) {
  const context = { exports: {}, process: { env }, Buffer, Date, setTimeout, clearTimeout, console: { error() {}, debug() {} }, URL,
    require(name) { if (name === '@/lib/traffic-filters' && !(name in mocks)) return { isKnownBot: () => false, botFilteringEnabled: async () => true }; return name in mocks ? mocks[name] : require(name); } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
const jsonResponse = (data, status = 200) => Response.json(data, { status });
const helpers = {
  createSuccessResponse: jsonResponse, createErrorResponse: (error, status) => jsonResponse({ error }, status),
  getClientIP: () => '203.0.113.9', getCountry: () => 'India', getCity: () => 'Unknown',
  debugLog() {}, validateProjectId: () => true,
};
function track(prisma) {
  return load('app/api/track/route.ts', {
    '@/lib/prisma': { prisma }, '@/lib/api-utils': helpers,
    '@/lib/broadcaster': { broadcastUpdate: async () => {} },
    '@/lib/tracking-health': { recordTrackingReceipt: async () => {} },
    '@/lib/source-classifier': { classifySource: () => 'Direct' },
    '../../../queries': { ProjectQueries: { findById: async () => ({ success: true, data: { id: 'project-a' } }) } },
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: r => r.json() },
  });
}
const payload = { projectId: 'project-a', sessionId: 'session-a', pageViewId: 'view-a', pageUrl: 'https://example.com/page?token=private#secret', referrer: 'https://ref.example/path?email=private' };
const request = data => new Request('https://spectr.example/api/track', { method: 'POST', body: JSON.stringify(data) });

test('pageviews store neither full IP nor URL query data and retries are idempotent', async () => {
  let calls = 0;
  const { POST } = track({ event: { upsert: async args => {
    calls++;
    assert.equal(args.create.ip, 'Unknown');
    assert.equal(args.create.pageUrl, 'https://example.com/page');
    assert.equal(args.create.referrer, 'https://ref.example/path');
    assert.deepEqual(Object.keys(args.update), []);
    assert.equal(args.where.projectId_pageViewId.pageViewId, 'view-a');
    return { id: 'event-a' };
  } } });
  assert.equal((await POST(request(payload))).status, 200);
  assert.equal((await POST(request(payload))).status, 200);
  assert.equal(calls, 2);
});

test('heartbeat updates only lastSeenAt, preserving pageview history', async () => {
  let updated = false;
  const { POST } = track({ event: {
    findFirst: async args => { assert.equal(args.where.pageViewId, 'view-a'); return { id: 'event-a' }; },
    update: async args => { assert.deepEqual(Object.keys(args.data), ['lastSeenAt']); updated = true; },
    create: () => assert.fail('Heartbeat must not create a pageview'),
  } });
  assert.equal((await POST(request({ ...payload, type: 'heartbeat' }))).status, 200);
  assert.ok(updated);
});

test('vitals updates reuse a sample without creating additional rows', async () => {
  let upserts = 0;
  const { POST } = load('app/api/vitals/route.ts', {
    '@/lib/prisma': { prisma: { project: { findUnique: async () => ({ id: 'project-a' }) }, $executeRaw: async (sql, ...values) => {
      upserts++;
      assert.equal(values[2], 'sample-a');
      assert.equal(values[7], 'https://example.com/page');
      assert.match(sql.join(''), /ON CONFLICT/);
      assert.doesNotMatch(sql.join('').split('DO UPDATE SET')[1], /createdAt/);
    } } },
    '@/lib/api-utils': {}, '@/lib/web-vitals-analytics': {},
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: r => r.json() },
  });
  for (const lcp of [1200, 1500]) assert.equal((await POST(request({ ...payload, sampleId: 'sample-a', lcp }))).status, 200);
  assert.equal(upserts, 2);
});

test('production rate limiting fails closed without Redis', async () => {
  const { checkRateLimit } = load('lib/request-limits.ts', {}, { NODE_ENV: 'production' });
  assert.equal((await checkRateLimit('ask', 'user-a', 10)).status, 503);
});

test('development fallback enforces request counts', async () => {
  const { checkRateLimit } = load('lib/request-limits.ts', {}, { NODE_ENV: 'development' });
  assert.equal((await checkRateLimit('ask', 'user-a', 1)).status, 200);
  assert.equal((await checkRateLimit('ask', 'user-a', 1)).status, 429);
});

test('body reader rejects malformed, oversized, and non-object payloads', async () => {
  const { readJsonBody } = load('lib/request-limits.ts', {});
  for (const body of ['not json', '[]', 'null', JSON.stringify({ question: 'x'.repeat(17000) })]) await assert.rejects(readJsonBody(new Request('https://spectr.example', { method: 'POST', body })));
});

test('tracker separates pageviews, reloads, heartbeats, and session expiry', async () => {
  const stored = new Map();
  let now = 10000000;
  let sequence = 0;
  function run() {
    const sent = [];
    const timers = [];
    const intervals = [];
    const listeners = {};
    const window = { location: { href: 'https://example.com/page' }, addEventListener() {} };
    const context = {
      window, document: { currentScript: { src: 'https://spectr.example/track.js', getAttribute: name => name === 'data-site' ? 'project-a' : null }, readyState: 'complete', hidden: false, referrer: '', addEventListener: (name, fn) => { listeners[name] = fn; } },
      navigator: { language: 'en', userAgent: 'test' },
      sessionStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
      Date: { now: () => now }, Math, Intl, URL, URLSearchParams, crypto: { randomUUID: () => `random-${++sequence}` },
      history: { pushState() {}, replaceState() {} },
      fetch: (url, args) => { sent.push(JSON.parse(args.body)); return Promise.resolve({ ok: true, status: 200 }); },
      setInterval: fn => intervals.push(fn), setTimeout: fn => timers.push(fn), console,
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/track.js'), 'utf8'), context);
    return { sent, timers, intervals, context };
  }
  const first = run();
  await new Promise(done => setImmediate(done));
  assert.equal(first.sent[0].type, 'pageview');
  const view = first.sent[0].pageViewId;
  const session = first.sent[0].sessionId;
  now += 30000;
  first.intervals[0]();
  assert.equal(first.sent[1].type, 'heartbeat');
  assert.equal(first.sent[1].pageViewId, view);
  const reload = run();
  assert.equal(reload.sent[0].type, 'pageview');
  assert.notEqual(reload.sent[0].pageViewId, view);
  assert.equal(reload.sent[0].sessionId, session);
  now += 31 * 60000;
  reload.intervals[0]();
  assert.equal(reload.sent[1].type, 'pageview');
  assert.notEqual(reload.sent[1].sessionId, session);
  reload.context.window.location.href = 'https://example.com/next';
  reload.context.history.pushState();
  reload.timers.pop()();
  assert.equal(reload.sent[2].type, 'pageview');
});

test('vitals cache reuses project results and keeps projects separate', async () => {
  const queried = [];
  const { getP75Vitals } = load('lib/web-vitals-analytics.ts', {
    '@/lib/prisma': { prisma: { $queryRaw: async (strings, projectId) => {
      queried.push(projectId);
      return [{ lcp_p75: 1200, inp_p75: null, cls_p75: 0, count: 24 }];
    } } },
    'next/cache': { unstable_cache: (query, keys, options) => {
      assert.equal(options.revalidate, 30);
      const cache = new Map();
      return async (...args) => {
        const key = JSON.stringify(args);
        if (!cache.has(key)) cache.set(key, await query(...args));
        return cache.get(key);
      };
    } },
  });
  const data = await getP75Vitals('project-a', 28);
  assert.equal(data.inp, null);
  assert.equal(data.totalSamples, 24);
  await getP75Vitals('project-a', 28);
  await getP75Vitals('project-b', 28);
  assert.deepEqual(queried, ['project-a', 'project-b']);
});

test('vitals database failures remain errors instead of empty successful samples', async () => {
  const { getP75Vitals } = load('lib/web-vitals-analytics.ts', {
    '@/lib/prisma': { prisma: { $queryRaw: async () => { throw new Error('Database unavailable'); } } },
    'next/cache': { unstable_cache: query => query },
  });
  await assert.rejects(getP75Vitals('project-a'), /Database unavailable/);
});
