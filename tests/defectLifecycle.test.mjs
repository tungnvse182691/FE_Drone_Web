import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/api/services/defectLifecycleService.ts', import.meta.url), 'utf8')
const project = '10000000-0000-0000-0000-000000000001', defect = '10000000-0000-0000-0000-000000000002'
const pkg = '10000000-0000-0000-0000-000000000003', item = '10000000-0000-0000-0000-000000000004'
const obligation = '10000000-0000-0000-0000-000000000005', action = '10000000-0000-0000-0000-000000000006'
const etag = `"${'a'.repeat(64)}"`, lifecycle = `/projects/${project}/lifecycle`
const ref = { projectId: project, packageId: pkg, itemId: item }
const state = { user: { id: 'test-user', role: 'SUPERVISOR' }, authEpoch: 1 }
let calls, closed, failRead, blocked, actions, rejectPost, head, lostResponse
const store = new Map()
globalThis.sessionStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) }
globalThis.ld06Client = {
  async get(path) {
    if (path === lifecycle) {
      if (closed && failRead) throw new Error('Offline')
      return { headers: { etag }, data: { projectId: project, version: etag.slice(1, -1), actions, transferableObligations: [{ id: obligation, defectId: defect, mandatory: true }], outstandingMandatoryObligationIds: blocked ? [obligation] : [] } }
    }
    if (path.endsWith('/source-defect')) return { data: { defectId: defect, status: closed ? 'CLOSED' : 'VERIFIED' } }
    throw new Error(`Unexpected GET ${path}`)
  },
  async post(path, body, config) {
    calls.push({ path, body, headers: config.headers })
    if (rejectPost) throw Object.assign(new Error('rejected'), { response: { status: 409, data: { code: 'concurrency_conflict' } } })
    closed = true
    actions = [{ id: action, kind: 'CloseDefect', projectId: project, defectId: defect, at: '2026-11-19T00:00:00Z' }]
    if (lostResponse) throw new Error('Connection dropped')
    return { data: { projectId: project, actions } }
  },
}
globalThis.ld06Auth = { getState: () => state }
globalThis.ld06Packages = async () => [{ id: pkg, projectId: project, defectId: head, allMandatoryResolved: true }]
const { code } = await transform(source
  .replace("import { apiClient } from '../client'", 'const apiClient = globalThis.ld06Client')
  .replace("import { useAuthStore } from '../../store/authStore'", 'const useAuthStore = globalThis.ld06Auth')
  .replace("import { workflowCollection } from './workflowCollection'", 'const workflowCollection = globalThis.ld06Packages'), { loader: 'ts', format: 'esm' })
const { defectLifecycleService: service } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))

test.beforeEach(() => {
  calls = []; actions = []; closed = failRead = blocked = rejectPost = lostResponse = false; head = defect; store.clear(); state.user.role = 'SUPERVISOR'
})

test('closure posts only verified target, reason and optional empty evidence using the lifecycle ETag', async () => {
  const ready = await service.closure(ref)
  assert.equal(ready.canClose, true)
  const result = await service.close(ref, '  Đã kiểm tra  ')
  assert.equal(result.closed, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].path, `${lifecycle}/defect-closures`)
  assert.deepEqual(calls[0].body, { reason: 'Đã kiểm tra', evidenceFileIds: [], defectId: defect })
  assert.equal(calls[0].headers['If-Match'], etag)
  assert.ok(calls[0].headers['Idempotency-Key'])
})

test('no write for a mandatory obligation, mismatched source, or wrong role', async () => {
  blocked = true
  assert.equal((await service.closure(ref)).canClose, false)
  await assert.rejects(service.close(ref, 'Reason'), /nghĩa vụ/)
  blocked = false; head = action
  await assert.rejects(service.close(ref, 'Reason'), /nguồn/)
  head = defect; state.user.role = 'PROJECT_MANAGER'
  await assert.rejects(service.close(ref, 'Reason'), /Giám sát/)
  assert.equal(calls.length, 0)
})

test('after a receipt, retry only reads the exact closure action', async () => {
  failRead = true
  await assert.rejects(service.close(ref, 'Reason'), /chỉ đọc lại/)
  failRead = false
  actions = [{ ...actions[0], id: obligation }]
  await assert.rejects(service.close(ref, ''), /chỉ đọc lại/)
  actions = [{ ...actions[0], id: action }]
  assert.equal((await service.close(ref, '')).closed, true)
  assert.equal(calls.length, 1)
})

test('a first-attempt concurrency rejection clears the intent for a new review', async () => {
  rejectPost = true
  await assert.rejects(service.close(ref, 'Reason'), /rejected/)
  assert.equal(service.pending(ref), null)
})

test('retry after a lost response reuses the original body and write headers', async () => {
  lostResponse = true
  await assert.rejects(service.close(ref, 'Reason'), /Connection dropped/)
  lostResponse = false
  assert.equal((await service.close(ref, 'Different reason')).closed, true)
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0], calls[1])
})

test('a different lifecycle revision must be reviewed before sending a new closure', async () => {
  await assert.rejects(service.close(ref, 'Reason', { defectId: defect, etag: `"${'b'.repeat(64)}"` }), /đã thay đổi/)
  assert.equal(calls.length, 0)
})

test('PM reads recurrence receipts only for the same project and either exact defect ID', async () => {
  state.user.role = 'PROJECT_MANAGER'
  actions = [
    { id: action, kind: 'LinkRecurrence', projectId: project, defectId: defect, linkedDefectId: item, priorRepairDecisionId: pkg, at: '2026-11-19T00:00:00Z' },
    { id: pkg, kind: 'LinkRecurrence', projectId: item, defectId: defect, linkedDefectId: obligation, priorRepairDecisionId: action },
    { id: obligation, kind: 'CloseDefect', projectId: project, defectId: defect },
  ]
  assert.deepEqual((await service.recurrences(project, defect)).map(a => a.id), [action])
  assert.deepEqual((await service.recurrences(project, item)).map(a => a.id), [action])
  assert.deepEqual(await service.recurrences(project, obligation), [])
  assert.equal(calls.length, 0)
})
