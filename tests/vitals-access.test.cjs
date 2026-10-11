const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the actual route with isolated session/database dependencies.
function loadRoute(user, project, failure = false) {
  const calls = [];
  const modules = {
    'crypto': require('crypto'),
    '@/lib/traffic-filters': { isKnownBot: () => false },
    'next/server': require('next/server'),
    '@/lib/api-utils': { getAuthenticatedUser: async () => user },
    '@/lib/request-limits': {},
    '@/lib/prisma': {
      prisma: { project: { findFirst: async (query) => {
        calls.push(['ownership', query]);
        if (failure) throw new Error('Database unavailable');
        return project;
      } } },
    },
    '@/lib/web-vitals-analytics': { getP75Vitals: async (...args) => {
      calls.push(['vitals', ...args]);
      return { lcp: 1200, totalSamples: 3 };
    } },
    '@upstash/ratelimit': { Ratelimit: class {} },
    '@upstash/redis': { Redis: class {} },
  };
  const source = fs.readFileSync(path.join(__dirname, '../app/api/vitals/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = {
    exports: {}, require: (name) => {
      assert.ok(name in modules, `Unexpected dependency: ${name}`);
      return modules[name];
    }, process: { env: {} }, console: { error() {} },
  };
  vm.runInNewContext(compiled, context);
  return { GET: context.exports.GET, calls };
}

function request(query = 'projectId=project-a') {
  return { nextUrl: new URL(`https://spectr.example/api/vitals?${query}`) };
}

test('anonymous callers cannot query analytics', async () => {
  const { GET, calls } = loadRoute(null, { id: 'project-a' });
  const response = await GET(request());
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('non-owned or nonexistent projects cannot query analytics', async () => {
  const { GET, calls } = loadRoute({ id: 'user-b' }, null);
  const response = await GET(request());
  assert.equal(response.status, 404);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].where.id, 'project-a');
  assert.equal(calls[0][1].where.userId, 'user-b');
});

test('owners receive analytics after ownership verification', async () => {
  const { GET, calls } = loadRoute({ id: 'user-a' }, { id: 'project-a' });
  const response = await GET(request('projectId=project-a&days=7'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { lcp: 1200, totalSamples: 3 });
  assert.equal(calls[0][0], 'ownership');
  assert.equal(calls[0][1].where.userId, 'user-a');
  assert.deepEqual(calls[1], ['vitals', 'project-a', 7]);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('missing project IDs return 400 without querying the database', async () => {
  const { GET, calls } = loadRoute({ id: 'user-a' }, null);
  assert.equal((await GET(request(''))).status, 400);
  assert.equal(calls.length, 0);
});

test('ownership lookup errors fail closed', async () => {
  const { GET, calls } = loadRoute({ id: 'user-a' }, null, true);
  assert.equal((await GET(request())).status, 500);
  assert.equal(calls.length, 1);
});
test('vitals ranges reject malformed and unbounded inputs before querying', async () => {
  for (const days of ['', '0', '-1', '91', '99999999', '7x', '7.5', '07', 'NaN']) {
    const { GET, calls } = loadRoute({ id: 'owner' }, { id: 'project-a' });
    assert.equal((await GET(request(`projectId=project-a&days=${days}`))).status, 400);
    assert.equal(calls.length, 0);
  }
  for (const days of [1, 7, 15, 28, 30, 90]) {
    const { GET, calls } = loadRoute({ id: 'owner' }, { id: 'project-a' });
    assert.equal((await GET(request(`projectId=project-a&days=${days}`))).status, 200);
    assert.equal(calls[1][2], days);
  }
});
