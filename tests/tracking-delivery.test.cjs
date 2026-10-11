const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function load(file, mocks, env = {}, DateClass = Date) {
  const context = { exports: {}, process: { env }, Error, Buffer, Date: DateClass, URL, setTimeout, clearTimeout, console: { error() {}, debug() {} },
    require(name) { if (name === '@/lib/traffic-filters' && !(name in mocks)) return { isKnownBot: () => false, botFilteringEnabled: async () => true }; return name in mocks ? mocks[name] : require(name); } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
const settle = () => new Promise(resolve => setImmediate(resolve));
function browser(responses, search = '', configure = () => {}) {
  let now = 10000000, id = 0;
  const timers = new Map(), sent = [], intervals = [], listeners = {};
  const context = {
    window: { location: { href: `https://example.com/page${search}`, search }, addEventListener: (name, fn) => listeners[name] = fn },
    document: { currentScript: { src: 'https://spectr.example/track.js', getAttribute: () => 'project-a' }, readyState: 'complete', hidden: false, referrer: '', addEventListener() {} },
    navigator: { language: 'en', userAgent: 'test' }, sessionStorage: { getItem: () => null, setItem() {} },
    Date: { now: () => now }, Math, Intl, URL, URLSearchParams, AbortController, crypto: { randomUUID: () => `view-${++id}` },
    history: { pushState() {}, replaceState() {} }, console,
    fetch: (url, options) => { sent.push(JSON.parse(options.body)); const result = responses.shift() ?? 200; if (typeof result === 'function') return result(options); return result instanceof Error ? Promise.reject(result) : Promise.resolve({ ok: result >= 200 && result < 300, status: result, headers: { get: () => result === 429 ? '60' : null } }); },
    setTimeout(fn, delay) { const key = ++id; timers.set(key, { fn, delay }); return key; }, clearTimeout: key => timers.delete(key),
    setInterval: fn => intervals.push(fn),
  };
  // Persistent session mock, matching a real browser.
  const storage = new Map();
  context.sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  configure(context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/track.js'), 'utf8'), context);
  return { sent, timers, intervals, listeners, context, advance(milliseconds) { now += milliseconds; }, nextTimer() { const [key, timer] = timers.entries().next().value; timers.delete(key); now += timer.delay; timer.fn(); } };
}
test('browser exclusion persists, suppresses all tracking, and include links resume only on normal pages', async () => {
  const storage = new Map();
  const configure = context => { context.localStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }; };
  const excluded = browser([], '?spectr_exclude=project-a', configure);
  assert.equal(excluded.context.window.spectr.isExcluded(), true);
  assert.equal(excluded.sent.length, 0); assert.equal(excluded.intervals.length, 0);
  const reload = browser([], '', configure);
  assert.equal(reload.context.window.spectr.track('signup'), false); assert.equal(reload.sent.length, 0);
  const included = browser([], '?spectr_include=project-a', configure);
  assert.equal(included.context.window.spectr.isExcluded(), false); assert.equal(included.sent.length, 0);
  const normal = browser([200], '', configure); await settle(); assert.equal(normal.sent.length, 1);
  normal.context.window.spectr.optOut(); normal.advance(30000); normal.intervals[0]();
  assert.equal(normal.context.window.spectr.track('signup'), false); assert.equal(normal.sent.length, 1);
});

test('custom actions wait for their pageview, use separate IDs, and retry a frozen payload', async () => {
  let accept;
  const b = browser([() => new Promise(resolve => { accept = resolve; }), 503, 200, 200]);
  const properties = { plan: 'free' };
  assert.equal(b.context.window.spectr.track('signup_completed', properties), true);
  properties.plan = 'changed';
  assert.equal(b.sent.length, 1);
  accept({ ok: true }); await settle();
  assert.equal(b.sent[1].type, 'custom'); assert.equal(b.sent[1].properties.plan, 'free');
  assert.equal(b.sent[1].pageViewId, b.sent[0].pageViewId);
  assert.equal(b.context.window.spectr.track('download'), true); await settle();
  assert.notEqual(b.sent[1].eventId, b.sent[2].eventId);
  b.nextTimer(); await settle(); assert.deepEqual(b.sent[3], b.sent[1]);
  for (const props of [null, [], { nested: {} }, { email: 'x' }, { user_id: 'x' }, { x: Infinity }]) assert.equal(b.context.window.spectr.track('bad', props), false);
});

test('network failure retries the same pageview and timestamp before heartbeats start', async () => {
  const b = browser([new Error('offline'), 200]);
  await settle();
  b.advance(30000);
  b.intervals[0]();
  assert.equal(b.sent.length, 1);
  b.nextTimer(); await settle();
  assert.equal(b.sent.length, 2);
  assert.deepEqual(b.sent[1], b.sent[0]);
  b.listeners.online(); await settle();
  assert.equal(b.sent.length, 2);
  b.advance(30000); b.intervals[0](); await settle();
  assert.equal(b.sent[2].type, 'heartbeat');
  assert.equal(b.sent[2].pageViewId, b.sent[0].pageViewId);
});
test('429 honors Retry-After and temporary failures stop after four attempts', async () => {
  const b = browser([429, 503, 500, 503]);
  await settle();
  assert.ok([...b.timers.values()][0].delay >= 60000);
  for (let i = 0; i < 3; i++) { b.nextTimer(); await settle(); }
  b.listeners.online(); await settle();
  assert.equal(b.sent.length, 4);
  assert.equal(b.timers.size, 0);
  assert.ok(b.sent.every(event => event.pageViewId === b.sent[0].pageViewId));
});
test('permanent errors are not retried', async () => {
  for (const status of [400, 401, 403, 404, 413]) {
    const b = browser([status]); await settle(); b.listeners.online(); await settle();
    assert.equal(b.sent.length, 1); assert.equal(b.timers.size, 0);
  }
});
test('installation URL sends only a test event and starts no heartbeat', async () => {
  const b = browser([200], '?spectr_test=12345678-1234-1234-1234-123456789abc'); await settle();
  assert.equal(b.sent.length, 1); assert.equal(b.sent[0].type, 'test');
  assert.equal(b.sent[0].trackerVersion, '2.1.1'); assert.equal(b.intervals.length, 0);
});

test('an excluded browser can run an installation probe without recording analytics or changing exclusion', async () => {
  const b = browser([200], '?spectr_test=12345678-1234-1234-1234-123456789abc', context => {
    context.localStorage = { getItem: () => '1', setItem: () => assert.fail('Probe must preserve exclusion') };
  });
  await settle();
  assert.equal(b.sent.length, 1); assert.equal(b.sent[0].type, 'test');
  assert.equal(b.context.window.spectr.isExcluded(), true);
  assert.equal(b.context.window.spectr.track('signup'), false);
  assert.equal(b.intervals.length, 0);
});

const response = (data, status = 200) => Response.json(data, { status });
const health = load('lib/tracking-health.ts', {}, { NODE_ENV: 'development' });
function track(prisma, healthMocks = health, trafficMocks = { isKnownBot: () => false, botFilteringEnabled: async () => true }) {
  return load('app/api/track/route.ts', {
    '@/lib/prisma': { prisma }, '@/lib/tracking-health': healthMocks, '@/lib/traffic-filters': trafficMocks,
    '@/lib/api-utils': { createSuccessResponse: response, createErrorResponse: (error, status) => response({ error }, status),
      getClientIP: () => 'Unknown', getCountry: () => 'India', getCity: () => 'Unknown', debugLog() {}, validateProjectId: () => true },
    '@/lib/broadcaster': { broadcastUpdate: async () => {} }, '@/lib/source-classifier': { classifySource: () => 'Direct' },
    '../../../queries': { ProjectQueries: { findById: async () => ({ success: true, data: { id: 'project-a' } }) } },
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: r => r.json() },
  });
}
const payload = { projectId: 'project-a', pageUrl: 'https://example.com/page', pageViewId: 'pageview-a', sessionId: 'session-a', trackerVersion: '2.0.0' };
const request = data => new Request('https://spectr.example/api/track', { method: 'POST', body: JSON.stringify(data) });

test('a human-looking payload cannot bypass bot filtering of the actual request header', async () => {
  const filters = load('lib/traffic-filters.ts', { '@/lib/prisma': {} });
  for (const [header, supplied] of [['Googlebot/2.1', 'Mozilla/5.0'], ['Mozilla/5.0', 'Googlebot/2.1']]) {
    const route = track({ event: { upsert: () => assert.fail('Filtered bot must not create analytics') } }, health, { isKnownBot: filters.isKnownBot, botFilteringEnabled: async () => true });
    const response = await route.POST(new Request('https://spectr.example/api/track', { method: 'POST', headers: { 'User-Agent': header }, body: JSON.stringify({ ...payload, userAgent: supplied }) }));
    assert.equal(response.status, 200); assert.equal((await response.json()).eventId, 'bot');
  }
});
test('test tokens are project-bound and probes create no analytics records', async () => {
  const probe = await health.createTrackingProbe('project-a');
  assert.equal(await health.readTrackingProbe('project-b', probe.token), null);
  const route = track({});
  assert.equal((await route.POST(request({ ...payload, type: 'test', testToken: probe.token }))).status, 200);
  assert.ok((await health.readTrackingProbe('project-a', probe.token)).receivedAt);
  assert.equal(await health.readTrackingReceipt('project-a'), null);
  assert.equal((await route.POST(request({ ...payload, type: 'test', testToken: '12345678-1234-1234-1234-123456789abc' }))).status, 400);
});
test('retries preserve occurrence time and server upserts reuse the same event', async () => {
  const occurredAt = Date.now() - 120000;
  const records = new Map();
  const route = track({ event: { upsert: async args => {
    assert.equal(args.create.timestamp.getTime(), occurredAt);
    assert.equal(args.create.lastSeenAt.getTime(), occurredAt);
    assert.deepEqual(Object.keys(args.update), []);
    const key = args.where.projectId_pageViewId.pageViewId;
    if (!records.has(key)) records.set(key, { id: 'event-a', ...args.create });
    return records.get(key);
  } } });
  for (let i = 0; i < 2; i++) assert.equal((await route.POST(request({ ...payload, occurredAt }))).status, 200);
  assert.equal(records.size, 1);
  assert.equal((await health.readTrackingReceipt('project-a')).version, '2.0.0');
});
test('missing pageview heartbeats return a recoverable conflict', async () => {
  const route = track({ event: { findFirst: async () => null, update: () => assert.fail('Missing row') } });
  assert.equal((await route.POST(request({ ...payload, type: 'heartbeat' }))).status, 409);
});
test('health telemetry failures never turn a committed pageview into a failed delivery', async () => {
  const route = track({ event: { upsert: async () => ({ id: 'event-a' }) } }, { recordTrackingReceipt: async () => { throw new Error('Redis unavailable'); } });
  assert.equal((await route.POST(request(payload))).status, 200);
});
function healthRoute(user, owns, event = null, healthStore = health) {
  return load('app/api/stats/project/[id]/tracking-health/route.ts', {
    '@/lib/api-utils': { getAuthenticatedUser: async () => user }, '@/lib/prisma': { prisma: {
      project: { findFirst: async () => owns ? { id: 'project-a' } : null }, event: { findFirst: async () => event },
    } }, '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: r => r.json() },
    '@/lib/tracking-health': healthStore,
  });
}
const context = { params: Promise.resolve({ id: 'project-a' }) };

test('health uses the newest database activity when the receipt cache is stale', async () => {
  const lastSeenAt = new Date();
  const route = healthRoute({ id: 'owner' }, true, { lastSeenAt }, {
    readTrackingReceipt: async () => ({ receivedAt: new Date(lastSeenAt.getTime() - 600000).toISOString(), version: '2.1.0' }),
  });
  const response = await route.GET({ nextUrl: new URL('https://spectr.example') }, context);
  assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.lastReceivedAt, lastSeenAt.toISOString()); assert.equal(data.status, 'connected');
});
test('health and test creation require an authenticated project owner', async () => {
  for (const [user, owns, status] of [[null, false, 401], [{ id: 'other' }, false, 404]]) {
    const route = healthRoute(user, owns);
    assert.equal((await route.GET({ nextUrl: new URL('https://spectr.example') }, context)).status, status);
    assert.equal((await route.POST(request({ url: 'https://example.com' }), context)).status, status);
  }
});
test('health creates a test URL and rejects unsafe protocols and credentials', async () => {
  const route = healthRoute({ id: 'owner' }, true);
  for (const url of ['javascript:alert(1)', 'file:///tmp/x', 'https://user:pass@example.com', 'bad']) assert.equal((await route.POST(request({ url }), context)).status, 400);
  const result = await route.POST(request({ url: 'https://example.com/path?existing=1&spectr_exclude=project-a&spectr_include=project-a#section' }), context);
  assert.equal(result.status, 200);
  const data = await result.json(); const url = new URL(data.testUrl);
  assert.equal(url.searchParams.get('spectr_test'), data.token); assert.equal(url.searchParams.get('existing'), '1');
  assert.equal(url.searchParams.has('spectr_exclude'), false); assert.equal(url.searchParams.has('spectr_include'), false);
  const resultGet = await route.GET({ nextUrl: new URL(`https://spectr.example?testToken=${data.token}`) }, context);
  assert.equal(resultGet.headers.get('Cache-Control'), 'private, no-store');
  assert.equal((await resultGet.json()).test.status, 'pending');
});
test('production health storage fails explicitly without Redis', async () => {
  const production = load('lib/tracking-health.ts', {}, { NODE_ENV: 'production' });
  await assert.rejects(production.createTrackingProbe('project-a'), /requires Redis/);
});
test('expired probes cannot pass after their five-minute lifetime', async () => {
  let now = Date.now();
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  const store = load('lib/tracking-health.ts', {}, { NODE_ENV: 'development' }, Clock);
  const probe = await store.createTrackingProbe('project-a');
  now += 300001;
  assert.equal(await store.readTrackingProbe('project-a', probe.token), null);
  assert.equal(await store.acceptTrackingProbe('project-a', probe.token, '2.0.0'), false);
});
test('event timestamps reject stale, future, and malformed values before writing', async () => {
  const route = track({});
  for (const occurredAt of [Date.now() - 86400001, Date.now() + 120000, '123', null]) {
    assert.equal((await route.POST(request({ ...payload, occurredAt }))).status, 400);
  }
});
test('delivery queue expires instead of sending old events after returning online', async () => {
  const b = browser([503]); await settle();
  // A browser may resume timers long after the original requested delay.
  const timer = [...b.timers.values()][0]; timer.delay = 600001;
  b.nextTimer(); await settle(); b.listeners.online(); await settle();
  assert.equal(b.sent.length, 1);
});
test('health distinguishes no installation from quiet traffic using database fallback', async () => {
  for (const [event, status] of [[null, 'waiting'], [{ lastSeenAt: new Date(Date.now() - 600001) }, 'inactive'], [{ lastSeenAt: new Date() }, 'connected']]) {
    const route = load('app/api/stats/project/[id]/tracking-health/route.ts', {
      '@/lib/api-utils': { getAuthenticatedUser: async () => ({ id: 'owner' }) },
      '@/lib/prisma': { prisma: { project: { findFirst: async () => ({ id: 'project-a' }) }, event: { findFirst: async () => event } } },
      '@/lib/tracking-health': { readTrackingReceipt: async () => null, TRACKER_VERSION: '2.0.0' },
      '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }) },
    });
    const result = await route.GET({ nextUrl: new URL('https://spectr.example') }, context);
    assert.equal((await result.json()).status, status);
  }
});
test('a missing-row heartbeat recovers the original pageview without changing its time', async () => {
  const b = browser([200, 409, 200]); await settle();
  b.advance(30000); b.intervals[0](); await settle();
  assert.equal(b.sent[1].type, 'heartbeat');
  assert.equal(b.sent[2].type, 'pageview');
  assert.deepEqual(b.sent[2], b.sent[0]);
});
test('pending queue stays bounded across many failed SPA pageviews', async () => {
  const b = browser(Array(30).fill(503)); await settle();
  for (let i = 0; i < 25; i++) {
    b.context.window.location.href = `https://example.com/page-${i}`;
    b.context.history.pushState();
    const [key, navigation] = [...b.timers.entries()].find(([, timer]) => timer.delay === 100);
    b.timers.delete(key); navigation.fn(); await settle();
  }
  assert.equal(b.sent.length, 26);
  assert.equal(b.timers.size, 20);
});
test('production probes are shared between instances and use expiring Redis keys', async () => {
  const records = new Map();
  class Redis {
    async set(key, value, options) { assert.ok(options.ex > 0); records.set(key, value); }
    async get(key) { return records.get(key) || null; }
  }
  const mocks = { '@upstash/redis': { Redis } };
  const env = { NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-only' };
  const first = load('lib/tracking-health.ts', mocks, env), second = load('lib/tracking-health.ts', mocks, env);
  const probe = await first.createTrackingProbe('project-a');
  assert.equal(await second.acceptTrackingProbe('project-a', probe.token, '2.0.0'), true);
  assert.ok((await first.readTrackingProbe('project-a', probe.token)).receivedAt);
});
test('a hung pageview times out and retries with the same event identity', async () => {
  const b = browser([options => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout')))), 200]);
  assert.equal([...b.timers.values()][0].delay, 8000);
  b.nextTimer(); await settle(); b.nextTimer(); await settle();
  assert.equal(b.sent.length, 2); assert.deepEqual(b.sent[0], b.sent[1]);
  assert.equal(b.timers.size, 0);
});
test('online events respect the existing Retry-After deadline', async () => {
  const b = browser([429, 200]); await settle();
  b.listeners.online(); await settle();
  assert.equal(b.sent.length, 1);
  b.advance(30000); b.listeners.online(); await settle();
  assert.equal(b.sent.length, 1);
  b.nextTimer(); await settle();
  assert.equal(b.sent.length, 2);
});
test('a stalled health receipt cannot prevent an already committed event response', async () => {
  const route = track({ event: { upsert: async () => ({ id: 'event-a' }) } }, { recordTrackingReceipt: () => new Promise(() => {}) });
  const result = await Promise.race([route.POST(request(payload)), new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error('Tracking response still blocked')), 2500); timer.unref();
  })]);
  assert.equal(result.status, 200);
});
test('test polling waits for slow responses instead of aborting at five seconds', async () => {
  const effects = [], intervals = [], pending = [], states = [];
  let slot = 0;
  const react = {
    useState(initial) { const index = slot++; const value = index === 4 ? { token: 'test-token', expiresAt: Date.now() + 300000 } : initial;
      states[index] = value; return [value, next => { states[index] = next; }]; },
    useRef: value => ({ current: value }), useCallback: fn => fn, useEffect: fn => effects.push(fn),
  };
  const context = { exports: {}, Error, Date, AbortController,
    require: name => name === 'react' ? react : { jsx() {}, jsxs() {} },
    fetch(url, options) { return new Promise((resolve, reject) => { pending.push({ signal: options.signal, resolve }); options.signal.addEventListener('abort', () => reject(new Error('Aborted'))); }); },
    setTimeout, clearTimeout, setInterval(fn, delay) { intervals.push({ fn, delay }); return 1; }, clearInterval() {}, document: { hidden: false },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/dashboard/tracking-health.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, context);
  context.exports.TrackingHealth({ projectId: 'project-a' });
  const cleanup = effects[0]();
  intervals[0].fn(); intervals[0].fn();
  assert.equal(pending.length, 1); assert.equal(pending[0].signal.aborted, false);
  pending[0].resolve({ ok: true, json: async () => ({ status: 'connected', test: { status: 'passed' } }) });
  await settle(); assert.equal(states[0].test.status, 'passed');
  intervals[0].fn(); assert.equal(pending.length, 2);
  cleanup(); await settle();
});
test('tracker numbers changed vitals snapshots in order and skips unchanged snapshots', async () => {
  const observers = {};
  const b = browser([200], '', context => {
    class PerformanceObserver {
      constructor(callback) { this.callback = callback; }
      observe(options) { observers[options.type] = this.callback; }
      disconnect() {}
    }
    context.PerformanceObserver = PerformanceObserver;
    context.window.PerformanceObserver = PerformanceObserver;
  });
  await settle();
  observers['largest-contentful-paint']({ getEntries: () => [{ renderTime: 1200 }] });
  b.nextTimer(); await settle();
  assert.equal(b.sent[1].sampleRevision, 1);
  b.listeners.pagehide(); await settle();
  assert.equal(b.sent.length, 2);
  observers.event({ getEntries: () => [{ interactionId: 1, duration: 80 }] });
  b.listeners.pagehide(); await settle();
  assert.equal(b.sent[2].sampleRevision, 2);
  assert.equal(b.sent[1].sampleId, b.sent[2].sampleId);
  assert.equal(b.sent[2].inp, 80);
});
test('invalid sample revisions are rejected before querying the database', async () => {
  const route = load('app/api/vitals/route.ts', {
    '@/lib/prisma': { prisma: {} }, '@/lib/api-utils': {}, '@/lib/web-vitals-analytics': {},
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: r => r.json() },
  });
  for (const sampleRevision of [0, -1, 1.5, 2147483648, '2', null]) {
    assert.equal((await route.POST(request({ ...payload, sampleId: 'sample-a', sampleRevision }))).status, 400);
  }
});
