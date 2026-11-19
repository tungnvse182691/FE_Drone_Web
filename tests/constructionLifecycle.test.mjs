import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID, webcrypto } from 'node:crypto'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/api/services/constructionLifecycleService.ts', import.meta.url), 'utf8')
const { code } = await transform(source.replace("import { apiClient } from '../client'", 'const apiClient = globalThis.constructionTestClient'), { loader: 'ts', format: 'esm' })
if (!globalThis.crypto) globalThis.crypto = webcrypto
const project = randomUUID(), actor = randomUUID(), evidence = randomUUID(), declaration = randomUUID(), confirmation = randomUUID()
const path = `/projects/${project}/lifecycle`
const action = (id, kind, evidenceFileIds, sourceActionId = null) => ({ id, projectId: project, actorId: actor, at: '2026-11-19T07:00:00Z', kind, sourceActionId, factsJson: JSON.stringify({ evidenceFileIds }) })
const declare = action(declaration, 'DeclareConstruction', [evidence])
const confirm = action(confirmation, 'ConfirmConstruction', [], declaration)
const view = (actions, version = 'a', completion = 'UNKNOWN') => ({ data: { projectId: project, actions, version: version.repeat(64), constructionCompletion: completion }, headers: { etag: `"${version.repeat(64)}"` } })
const calls = []
let getResponse, postResponse
const reset = (initial, receipt) => { calls.length = 0; getResponse = initial; postResponse = receipt }
globalThis.constructionTestClient = {
  async get(url) { calls.push(['GET', url]); return getResponse },
  async post(url, body, config) { calls.push(['POST', url, body, config.headers]); if (postResponse instanceof Error) throw postResponse; return postResponse },
}
const { constructionLifecycleService: service } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))

test('PM sends verified project file IDs and exact lifecycle headers, then reads the new declaration', async () => {
  reset(view([]), view([declare], 'b'))
  const current = await service.read(project)
  const attempt = service.prepare(current, actor, { reason: 'Finished', evidenceFileIds: [evidence] }, [{ id: evidence }])
  getResponse = view([declare], 'c')
  const result = await service.submit(attempt)
  assert.equal(result.action.id, declaration)
  assert.equal(result.view.etag, view([], 'c').headers.etag)
  assert.deepEqual(calls, [['GET', path], ['POST', path + '/construction-declarations', { reason: 'Finished', evidenceFileIds: [evidence] }, { 'If-Match': view([]).headers.etag, 'Idempotency-Key': attempt.key }], ['GET', path]])
})

test('Supervisor uses a same-project declaration action ID, with no extra evidence required', async () => {
  reset(view([declare]), view([declare, confirm], 'b', 'CONFIRMED'))
  const current = await service.read(project)
  assert.throws(() => service.prepare(current, actor, { reason: 'Reviewed', evidenceFileIds: [], sourceActionId: randomUUID() }, []), /khai báo/)
  const attempt = service.prepare(current, actor, { reason: 'Reviewed', evidenceFileIds: [], sourceActionId: declaration }, [])
  getResponse = view([declare, confirm], 'b', 'CONFIRMED')
  assert.equal((await service.submit(attempt)).action.id, confirmation)
  assert.deepEqual(calls[1].slice(1, 3), [path + '/construction-confirmations', { reason: 'Reviewed', evidenceFileIds: [], sourceActionId: declaration }])
})

test('missing ETag, missing evidence or an unlisted file blocks the command', async () => {
  reset({ data: view([]).data, headers: {} })
  await assert.rejects(service.read(project), /ETag/)
  getResponse = view([])
  const current = await service.read(project)
  for (const evidenceFileIds of [[], [evidence], [evidence, evidence]]) {
    assert.throws(() => service.prepare(current, actor, { reason: 'Finished', evidenceFileIds }, []), /tệp/)
  }
  assert.equal(calls.filter(([method]) => method === 'POST').length, 0)
})

test('ambiguous POST retries use the same headers and body; known receipt retries only GET', async () => {
  reset(view([]), new Error('timeout'))
  const current = await service.read(project)
  const attempt = service.prepare(current, actor, { reason: 'Finished', evidenceFileIds: [evidence] }, [{ id: evidence }])
  await assert.rejects(service.submit(attempt), /timeout/)
  postResponse = view([declare], 'b')
  getResponse = view([{ ...declare, id: randomUUID() }], 'c')
  await assert.rejects(service.submit(attempt), /đọc lại/)
  getResponse = view([declare], 'c')
  assert.equal((await service.submit(attempt)).action.id, declaration)
  assert.deepEqual(calls[1], calls[2])
  assert.equal(calls.filter(([method]) => method === 'POST').length, 2)
})

test('coverage supplies only explicit fileId values from verified project file sources', async () => {
  const fake = randomUUID(), synthetic = randomUUID()
  reset({ data: { projectId: project, sources: [
    { id: fake, kind: 'WARRANTY' }, { id: fake, kind: 'HANDOVER', fileId: evidence },
    { id: evidence, kind: 'MAINTENANCE_BASIS', fileId: evidence },
    { id: synthetic, kind: 'MAINTENANCE_BASIS', fileId: synthetic, provenance: 'TEST_ONLY' },
  ] } })
  const files = await service.readEvidence(project)
  assert.deepEqual(files.map(x => [x.id, x.kind]), [[evidence, 'HANDOVER'], [synthetic, 'MAINTENANCE_BASIS']])
  assert.deepEqual(calls, [['GET', `/projects/${project}/road-coverage`]])
  getResponse.data.projectId = randomUUID()
  await assert.rejects(service.readEvidence(project), /phạm vi/)
})
