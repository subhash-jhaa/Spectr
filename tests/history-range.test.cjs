const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}, DateClass = Date) {
  const context = { exports: {}, Error, Date: DateClass, process: { env: {} }, console: { error() {}, debug() {} },
    require(name) { return name in mocks ? mocks[name] : require(name); } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
const ranges = load('lib/history-range.ts');

test('custom dates validate exact calendar dates and use an inclusive UTC end date', () => {
  const now = new Date('2026-10-11T12:00:00Z');
  const parse = query => ranges.parseHistorySelection(new URLSearchParams(query), now);
  const leap = parse('start=2024-02-28&end=2024-03-01');
  assert.equal(leap.days, 3);
  assert.equal(leap.startDate.toISOString(), '2024-02-28T00:00:00.000Z');
  assert.equal(leap.endDate.toISOString(), '2024-03-02T00:00:00.000Z');
  assert.equal(parse('start=2024-01-01&end=2024-12-31').days, 366);
  for (const query of ['start=2025-02-29&end=2025-03-01', 'start=2026-10-12&end=2026-10-12', 'start=2026-02-01', 'end=2026-02-01', 'start=2026-02-02&end=2026-02-01', 'start=2024-01-01&end=2025-01-01', 'start=1999-12-31&end=2000-01-01', 'start=2026-01-01&end=2026-01-02&days=7']) assert.equal(parse(query), null, query);
});

test('custom chart and overview queries share exclusive boundaries and adjacent previous periods', async () => {
  const selection = ranges.parseHistorySelection(new URLSearchParams('start=2026-01-30&end=2026-02-02'), new Date('2026-10-11'));
  const calls = [];
  const { EventQueries } = load('queries/event.ts', {
    '@/lib/prisma': { prisma: { $queryRaw: async (strings, ...values) => { calls.push({ sql: strings.join('?'), dates: values.filter(value => value instanceof Date).map(value => value.toISOString()) }); return []; } } },
    '@/lib/history-range': ranges, '@/lib/source-classifier': {}, '@/lib/channel-classifier': {},
  });
  const daily = await EventQueries.getDailyStats('project-a', selection);
  assert.equal(daily.success, true);
  assert.deepEqual(Array.from(daily.data, row => row.date), ['2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02']);
  assert.ok(calls[0].sql.includes('"timestamp" <'));
  assert.ok(calls[0].dates.includes('2026-02-03T00:00:00.000Z'));
  await EventQueries.getOverviewMetrics('project-a', selection);
  assert.deepEqual(calls.at(-1).dates, ['2026-01-30T00:00:00.000Z', '2026-02-03T00:00:00.000Z', '2026-01-26T00:00:00.000Z', '2026-01-30T00:00:00.000Z']);
});

test('only supported ranges are accepted, with a seven-day default', () => {
  assert.equal(ranges.parseHistoryDays(null), 7);
  for (const days of [7, 15, 30]) assert.equal(ranges.parseHistoryDays(String(days)), days);
  for (const value of ['', '0', '-7', '8', '365', '15x', '7.5', '07']) assert.equal(ranges.parseHistoryDays(value), null);
});

test('calendar range starts include today and cross month/year boundaries in UTC', () => {
  const now = new Date('2026-01-02T23:59:00Z');
  assert.equal(ranges.historyStart(7, now).toISOString(), '2025-12-27T00:00:00.000Z');
  assert.equal(ranges.historyStart(15, now).toISOString(), '2025-12-19T00:00:00.000Z');
  assert.equal(ranges.historyStart(30, now).toISOString(), '2025-12-04T00:00:00.000Z');
});

function apiFor(user, ownsProject, queries = {}) {
  const api = load('lib/api-utils.ts', {
    '@/lib/session': { requireAppSession: async () => { if (!user) throw new Error('Unauthorized'); return user; } },
    '../queries': { ProjectQueries: { findByIdAndUser: async (projectId, userId) => {
      assert.equal(projectId, 'project-a'); assert.equal(userId, 'user-a');
      return { success: true, data: ownsProject ? { id: projectId } : null };
    } } }, '@/lib/history-range': ranges, '@/lib/geo-utils': {},
  });
  return { api, route: file => load(file, { '@/lib/api-utils': api, '@/queries': { EventQueries: queries }, '../../../../../../queries': { EventQueries: queries } }) };
}
const methods = { '7days': 'getDailyStats', audience: 'getAudienceMix', browsers: 'getBrowserStats', countries: 'getCountryStats', devices: 'getDeviceStats', overview: 'getOverviewMetrics', pages: 'getPageStats', referrers: 'getReferrerStats', sources: 'getSourceStats', 'referrer-breakdown': 'getReferrerBreakdown' };

test('every historical endpoint forwards each selected range after ownership verification', async () => {
  for (const [route, method] of Object.entries(methods)) {
    for (const days of [7, 15, 30]) {
      let called = false;
      const { route: getRoute } = apiFor({ id: 'user-a' }, true, { [method]: async (id, ...args) => {
        assert.equal(id, 'project-a'); assert.equal(args.at(-1), days); called = true;
        return { success: true, data: [] };
      } });
      const response = await getRoute(`app/api/stats/project/[id]/${route}/route.ts`).GET({ nextUrl: new URL(`https://spectr.example?days=${days}`) }, { params: Promise.resolve({ id: 'project-a' }) });
      assert.equal(response.status, 200); assert.ok(called);
    }
  }
});

test('unsupported ranges and unauthorized requests never fetch historical data', async () => {
  for (const [user, owns, days, status] of [[{ id: 'user-a' }, true, '365', 400], [null, false, '7', 401], [{ id: 'user-a' }, false, '30', 404]]) {
    const { api } = apiFor(user, owns);
    const response = await api.handleHistoricalStatsRoute({ nextUrl: new URL(`https://spectr.example?days=${days}`) }, Promise.resolve({ id: 'project-a' }), () => assert.fail('Unauthorized data query'));
    assert.equal(response.status, status);
  }
});

test('daily series contain exactly 7, 15, or 30 points, with zero-filled gaps', async () => {
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : ['2026-01-02T23:59:00Z'])); } static now() { return Date.parse('2026-01-02T23:59:00Z'); } }
  const history = load('lib/history-range.ts', {}, FixedDate);
  let queryStart;
  const { EventQueries } = load('queries/event.ts', {
    '@/lib/prisma': { prisma: { $queryRaw: async (strings, ...values) => {
      queryStart = values.find(value => value instanceof FixedDate);
      return [{ date: '2026-01-02', visitors: 3, pageViews: 5, bounceRate: 20 }, { date: '2025-11-01', visitors: 100 }];
    } } }, '@/lib/history-range': history, '@/lib/source-classifier': {}, '@/lib/channel-classifier': {},
  }, FixedDate);
  for (const days of [7, 15, 30]) {
    const result = await EventQueries.getDailyStats('project-a', days);
    assert.ok(result.success); assert.equal(result.data.length, days);
    assert.equal(result.data[0].date, history.historyStart(days).toISOString().slice(0, 10));
    assert.equal(queryStart.toISOString(), history.historyStart(days).toISOString());
    assert.equal(result.data[0].visitors, 0); assert.equal(result.data.at(-1).visitors, 3);
  }
});

test('rapid dropdown changes cancel old requests and reject late responses', async () => {
  const slots = [];
  let slot = 0;
  let effects = [];
  let cleanup = [];
  const pending = [];
  const react = {
    createElement: () => null,
    useState(initial) {
      const index = slot++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = slot++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useEffect(effect) { effects.push(effect); },
    useCallback: fn => fn, useMemo: fn => fn(),
  };
  react.default = react;
  const context = { exports: {}, Error, AbortController, AbortSignal, setTimeout, clearTimeout, console: { error() {}, warn() {} },
    fetch(url, options) { return new Promise(resolve => pending.push({ url, signal: options.signal, resolve })); },
    require(name) {
      if (name === 'react') return react;
      if (name === '@/lib/history-range') return ranges;
      if (name === 'next/navigation') return { useRouter: () => ({}) };
      if (name === 'next-themes') return { useTheme: () => ({ resolvedTheme: 'light' }) };
      if (name === './hooks/useProjects') return { useProjects: () => ({ projects: [{ id: 'project-a' }], selectedProject: { id: 'project-a' }, loading: false }) };
      if (name === './hooks/useRealtimeStats') return { useRealtimeStats: () => ({ realtimeStats: { visitors: [] } }) };
      return new Proxy({}, { get: () => () => null });
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/DashboardClient.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React }, fileName: 'DashboardClient.tsx' }).outputText, context);
  function render() {
    cleanup.forEach(fn => fn?.()); slot = 0; effects = [];
    context.exports.default({ initialProjectId: 'project-a' });
    cleanup = effects.map(effect => effect());
  }
  render();
  slots[1] = 15; render();
  slots[1] = 30; render();
  assert.equal(pending.length, 27);
  assert.ok(pending.slice(0, 18).every(item => item.signal.aborted));
  assert.ok(pending.slice(18).every(item => item.url.includes('days=30')));
  const resolve = item => item.resolve({ ok: true, json: async () => item.url.includes('/daily?') ? [{ date: '2026-01-02', visitors: item.url.includes('days=30') ? 30 : 7 }] : [] });
  pending.slice(18).forEach(resolve);
  await new Promise(done => setImmediate(done));
  assert.equal(slots[4][0].visitors, 30);
  pending.slice(0, 18).forEach(resolve);
  await new Promise(done => setImmediate(done));
  assert.equal(slots[4][0].visitors, 30);
  cleanup.forEach(fn => fn?.());
});
