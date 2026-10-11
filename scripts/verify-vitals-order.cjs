// Explicit database smoke test. All test samples are rolled back.
require('@next/env').loadEnvConfig(process.cwd());
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rollback = new Error('ROLL_BACK_VITALS_TEST');
async function verify(tx) {
  const project = await tx.project.findFirst({ select: { id: true } });
  assert.ok(project, 'Create a project before running this test.');
  const modules = {
    '@/lib/traffic-filters': { isKnownBot: () => false }, '@/lib/prisma': { prisma: tx }, '@/lib/api-utils': {}, '@/lib/web-vitals-analytics': {},
    '@/lib/request-limits': { checkRateLimit: async () => ({ status: 200 }), readJsonBody: request => request.json() },
  };
  const context = { exports: {}, URL, Error, console, require: name => name in modules ? modules[name] : require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/vitals/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  const sampleId = `verification-${randomUUID()}`;
  async function send(sampleRevision, inp) {
    const body = { projectId: project.id, sampleId, sampleRevision, inp, lcp: 1200, cls: 0, pageUrl: 'https://verification.example/page' };
    const response = await context.exports.POST(new Request('https://spectr.example/api/vitals', { method: 'POST', body: JSON.stringify(body) }));
    assert.equal(response.status, 200);
  }
  const read = () => tx.$queryRaw`SELECT "sampleRevision", "inp", "createdAt" FROM "WebVital" WHERE "projectId" = ${project.id} AND "sampleId" = ${sampleId}`;
  await send(2, 80);
  const first = (await read())[0];
  await send(1, null); // Earlier snapshot arriving late.
  await send(2, 999); // A repeated revision cannot overwrite an accepted revision.
  await send(undefined, 999); // An older client cannot overwrite a versioned sample.
  let rows = await read();
  assert.equal(rows.length, 1); assert.equal(rows[0].inp, 80); assert.equal(rows[0].sampleRevision, 2);
  await send(3, 40); // Newer INP can improve; this must not use GREATEST().
  rows = await read();
  assert.equal(rows[0].inp, 40); assert.equal(rows[0].sampleRevision, 3);
  assert.equal(rows[0].createdAt.getTime(), first.createdAt.getTime());
  throw rollback;
}
(async () => {
  try {
    try { await prisma.$transaction(verify, { timeout: 20000 }); }
    catch (error) { if (error !== rollback) throw error; }
    console.log('PASS: actual PostgreSQL rejected older and duplicate revisions, accepted a newer improvement, and preserved sample identity and creation time. Test rows rolled back.');
  } catch (error) { console.error('Vitals ordering verification failed:', error.code || error.name); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
})();
