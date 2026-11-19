import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
import { webcrypto } from 'node:crypto'

const { code } = await transform(await readFile(new URL('../src/api/services/obligationTransferService.ts', import.meta.url), 'utf8'), { loader: 'ts', format: 'esm' })
const { createObligationTransferService, incomingOffers } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
globalThis.crypto ??= webcrypto
const guid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const [source, receiver, actor, obligation, issueId, acceptanceId, another] = [1, 2, 3, 4, 5, 6, 7].map(guid)
const hash = 'a'.repeat(64), version = 'b'.repeat(64), etag = `"${version}"`
const scope = { id: obligation, scopeHash: hash, kind: 'FormalRepair', routeLabel: 'Test', from: 0, to: 10 }
const offer = { id: issueId, kind: 'IssueTransfer', projectId: source, receivingProjectId: receiver, actorId: actor, obligationId: obligation, sourceActionId: null, scopeHash: hash }
const acceptance = { ...offer, id: acceptanceId, kind: 'AcceptTransfer', projectId: receiver, sourceActionId: issueId }
const responsibility = { obligationId: obligation, originProjectId: source, currentProjectId: receiver, acceptanceActionId: acceptanceId }
const response = (projectId, actions = [], transferableObligations = [], responsibilities = []) => ({ status: 200, headers: { etag }, data: { projectId, version, actions, transferableObligations, responsibilities } })

test('issue uses lifecycle obligation/hash and exact quoted source ETag; readback requires the new action', async () => {
  let get = response(source, [], [scope]); const calls = []
  const service = createObligationTransferService({ get: async (...args) => { calls.push(args); return get }, post: async (...args) => { calls.push(args); return { ...response(source, [offer], [scope]), status: 201 } } })
  const initial = await service.read(source)
  assert.throws(() => service.prepareIssue(initial, actor, another, receiver, 'reason'))
  assert.throws(() => service.prepareIssue(initial, actor, obligation, source, 'reason'))
  const attempt = service.prepareIssue(initial, actor, obligation, receiver, ' reason ')
  const receipt = await service.post(attempt)
  assert.equal(calls[1][0], `/projects/${source}/lifecycle/obligation-transfers`)
  assert.deepEqual(calls[1][1], { obligationId: obligation, receivingProjectId: receiver, scopeHash: hash, reason: 'reason', evidenceFileIds: [] })
  assert.equal(calls[1][2].headers['If-Match'], etag)
  assert.match(calls[1][2].headers['Idempotency-Key'], /^[0-9a-f-]{36}$/)
  await assert.rejects(service.readback(attempt, receipt), /biên nhận/i)
  get = response(source, [offer], [scope]); assert.equal((await service.readback(attempt, receipt)).actions[0].id, issueId)
  await service.post(attempt)
  assert.deepEqual(calls[4], calls[1])
})

test('accept uses the incoming action on the receiving project; responsibility is required in the receipt', async () => {
  let outcome = response(receiver, [offer, acceptance]); let posted
  const service = createObligationTransferService({ get: async () => response(receiver, [offer]), post: async (...args) => { posted = args; return outcome } })
  const attempt = service.prepareAcceptance(await service.read(receiver), actor, issueId, 'accept')
  await assert.rejects(service.post(attempt), /trách nhiệm/i)
  outcome = response(receiver, [offer, acceptance], [], [responsibility]); assert.equal((await service.post(attempt)).id, acceptanceId)
  assert.equal(posted[0], `/projects/${receiver}/lifecycle/obligation-transfer-acceptances`)
  assert.deepEqual(posted[1], { reason: 'accept', evidenceFileIds: [], obligationId: obligation, scopeHash: hash, sourceActionId: issueId })
  assert.equal(posted[2].headers['If-Match'], etag)
  assert.deepEqual(incomingOffers(outcome.data), [])
  assert.deepEqual(incomingOffers({ ...outcome.data, actions: [{ ...offer, receivingProjectId: another }] }), [])
})

test('missing, weak or mismatched lifecycle ETag fails closed', async () => {
  for (const badTag of [undefined, version, `W/${etag}`, `"${hash}"`]) {
    const service = createObligationTransferService({ get: async () => ({ ...response(source), headers: { etag: badTag } }) })
    await assert.rejects(service.read(source), /ETag/)
  }
})
