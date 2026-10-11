const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const context = { exports: {}, Error, Buffer, Date, console: { error() {} }, require: name => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context.exports;
}
const csv = load('lib/csv-export.ts');
const ranges = load('lib/history-range.ts');
test('CSV escaping preserves commas, quotes, newlines and international text', () => {
  assert.equal(csv.csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csv.csvCell('भारत'), '"भारत"');
  assert.equal(csv.csvCell(null), '""');
  const report = csv.createReportCsv('pages', [{ pageUrl: 'https://example.com/a,b', visitors: 2, pageViews: 3 }], { projectId: 'project-a', days: 15, start: '2026-09-27', end: '2026-10-11' });
  assert.equal(report.charCodeAt(0), 0xFEFF);
  assert.ok(report.includes('"UTC","https://example.com/a,b","2","3"\r\n'));
});
test('spreadsheet formulas in tracked text are neutralized while numeric values remain numeric', () => {
  for (const value of ['=HYPERLINK("https://evil.example")', '+cmd', '-cmd', '@SUM(1)', '  =1+1', '\t=1+1', '\rtext']) {
    assert.ok(csv.csvCell(value).startsWith('"\''));
  }
  assert.equal(csv.csvCell(-10), '"-10"');
  assert.equal(csv.isCsvReport('__proto__'), false);
});
const methods = { daily: 'getDailyStats', pages: 'getPageStats', countries: 'getCountryStats', referrers: 'getReferrerStats', sources: 'getSourceStats', browsers: 'getBrowserStats', devices: 'getDeviceStats' };
function route({ user = { id: 'owner' }, owns = true, status = 200, success = true, data = [], throws = false } = {}) {
  const calls = [];
  const queries = Object.fromEntries(Object.entries(methods).map(([report, method]) => [method, async (id, days) => {
    calls.push({ report, id, days });
    if (throws) throw new Error('Database unavailable');
    return { success, data };
  }]));
  const actual = load('app/api/stats/project/[id]/export/route.ts', {
    '@/lib/api-utils': { getAuthenticatedUser: async () => user }, '@/lib/prisma': { prisma: { project: { findFirst: async args => {
      assert.equal(args.where.id, 'project-a'); assert.equal(args.where.userId, user.id);
      return owns ? { id: 'project-a' } : null;
    } } } }, '@/queries': { EventQueries: queries }, '@/lib/history-range': ranges, '@/lib/csv-export': csv,
    '@/lib/request-limits': { checkRateLimit: async () => ({ status, retryAfter: 60 }) },
  });
  return { GET: actual.GET, calls };
}
const request = query => ({ nextUrl: new URL(`https://spectr.example/api/export?${query}`) });
const context = { params: Promise.resolve({ id: 'project-a' }) };

test('custom-date CSV exports forward inclusive date selections and label the actual range', async () => {
  for (const report of Object.keys(methods)) {
    const { GET, calls } = route();
    const result = await GET(request(`report=${report}&start=2026-01-30&end=2026-02-02`), context);
    assert.equal(result.status, 200);
    assert.equal(calls[0].days.startDate.toISOString(), '2026-01-30T00:00:00.000Z');
    assert.equal(calls[0].days.endDate.toISOString(), '2026-02-03T00:00:00.000Z');
    assert.match(result.headers.get('Content-Disposition'), /4days-2026-01-30-to-2026-02-02/);
  }
});
test('all seven export reports use the selected project and each supported date range', async () => {
  for (const report of Object.keys(methods)) for (const days of [7, 15, 30]) {
    const { GET, calls } = route();
    const result = await GET(request(`report=${report}&days=${days}`), context);
    assert.equal(result.status, 200); assert.equal(calls[0].report, report);
    assert.equal(calls[0].id, 'project-a'); assert.equal(calls[0].days, days);
    assert.equal(result.headers.get('Content-Type'), 'text/csv; charset=utf-8');
    assert.equal(result.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(result.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.match(result.headers.get('Content-Disposition'), new RegExp(`spectr-${report}-${days}days-.*\\.csv`));
    const body = await result.text();
    assert.ok(body.includes(csv.CSV_REPORTS[report].columns[0]));
  }
});
test('unauthorized users and invalid or unsupported filters cannot export data', async () => {
  for (const [options, query, expected] of [
    [{ user: null }, 'days=7', 401], [{ owns: false }, 'days=7', 404],
    [{}, 'days=365', 400], [{}, 'report=__proto__', 400], [{}, 'report=raw', 400],
    [{}, 'days=15&country=India', 400], [{ status: 429 }, 'days=7', 429], [{ status: 503 }, 'days=7', 503],
  ]) {
    const { GET, calls } = route(options);
    const result = await GET(request(query), context);
    assert.equal(result.status, expected); assert.equal(calls.length, 0);
    assert.equal(result.headers.get('Content-Disposition'), null);
  }
});
test('query failures and oversized reports return JSON errors instead of misleading downloads', async () => {
  for (const [options, expected] of [[{ success: false }, 500], [{ throws: true }, 500], [{ data: Array(10001).fill({}) }, 413]]) {
    const { GET } = route(options);
    const result = await GET(request('days=7'), context);
    assert.equal(result.status, expected); assert.ok((await result.json()).error);
    assert.equal(result.headers.get('Content-Disposition'), null);
  }
});
test('CSV downloads follow report selection and discard late responses after range changes', async () => {
  const slots = [], pending = [], downloads = [], revoked = [], timers = new Map();
  let slot = 0, effects = [], cleanups = [], timerId = 0;
  const react = {
    useState(initial) { const index = slot++; if (!(index in slots)) slots[index] = initial; return [slots[index], next => { slots[index] = next; }]; },
    useRef(initial) { const index = slot++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useEffect: effect => effects.push(effect),
  };
  const jsx = (type, props) => ({ type, props });
  const context = { exports: {}, AbortController, Error,
    require(name) { if (name === 'react') return react; if (name === '@/lib/csv-export') return csv; return { jsx, jsxs: jsx }; },
    fetch(url, options) { return new Promise(resolve => pending.push({ url, signal: options.signal, resolve })); },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
    URL: { createObjectURL: () => 'blob:export', revokeObjectURL: url => revoked.push(url) },
    document: { body: { appendChild() {} }, createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }) },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/dashboard/csv-export.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  function nodes(value) { if (!value || typeof value !== 'object') return []; if (Array.isArray(value)) return value.flatMap(nodes); return [value, ...nodes(value.props?.children)]; }
  function render(days) {
    cleanups.forEach(fn => fn?.()); slot = 0; effects = [];
    const tree = context.exports.CsvExport({ projectId: 'project-a', days }); cleanups = effects.map(fn => fn());
    return nodes(tree).find(node => node.type === 'button');
  }
  render(7).props.onClick();
  assert.ok(pending[0].url.includes('days=7&report=daily'));
  slots[0] = 'pages'; const button = render(15);
  assert.ok(pending[0].signal.aborted);
  button.props.onClick();
  assert.ok(pending[1].url.includes('days=15&report=pages'));
  const response = { ok: true, headers: { get: key => key === 'Content-Type' ? 'text/csv; charset=utf-8' : 'attachment; filename="report.csv"' }, blob: async () => ({}) };
  pending[0].resolve(response); await new Promise(resolve => setImmediate(resolve));
  assert.equal(downloads.length, 0);
  pending[1].resolve(response); await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(downloads, ['report.csv']);
  timers.forEach(fn => fn()); assert.deepEqual(revoked, ['blob:export']);
  cleanups.forEach(fn => fn?.());
});
