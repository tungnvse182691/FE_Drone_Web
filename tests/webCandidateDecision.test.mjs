import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/api/services/surveyService.ts', import.meta.url), 'utf8')
const { code } = await transform(source
  .replace("import { apiClient } from '../client'", 'const apiClient = globalThis.testCandidateClient')
  .replace("import { useAuthStore } from '../../store/authStore'", 'const useAuthStore = globalThis.testCandidateAuth')
  .replace("import { defectRecurrenceService, type RecurrenceInput } from './defectRecurrenceService'", 'const defectRecurrenceService = globalThis.testRecurrenceReadback')
  .replace("import { SEVERITY_LABEL } from '../../utils/severity'", 'const SEVERITY_LABEL = {}')
  .replace("import { aiApiErrorText } from './aiRunDetailService'", 'const aiApiErrorText = e => e.message')
  .replace("import { projectService } from './projectService'", 'const projectService = {}'), { loader: 'ts', format: 'esm' })
const receipt = { id: 'decision', sourceId: 'source', sourceKind: 'AI_DETECTION', decision: 'LINK_EXISTING', defectId: 'target', version: 'version', supersedesDecisionId: null }
const request = { sourceId: 'source', sourceKind: 'AI_DETECTION', decision: 'LINK_EXISTING', targetDefectId: 'target', targetVersion: 'target-version', sourceVersion: 'source-version', geometryVersion: 'geometry-version', reason: '[TEST-FE] Link' }
const base = '/projects/project/candidate-decisions'
const calls = [], store = new Map()
let readback = receipt
let postedBody, postReceipt = receipt, lifecycleReady = false
Object.assign(globalThis, {
  sessionStorage: { getItem: k => store.get(k), setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) },
  testCandidateAuth: { getState: () => ({ authEpoch: 1, user: { id: 'pm', role: 'PROJECT_MANAGER' } }) },
  testCandidateClient: {
    async post(path, body) { calls.push(['POST', path]); postedBody = body; return { data: postReceipt } },
    async get(path) { calls.push(['GET', path]); if (path !== `${base}/decision`) throw new Error('Route này không hỗ trợ Web cookie'); return { data: readback } },
  },
  testRecurrenceReadback: { async confirm(project, defect, input) {
    assert.deepEqual([project, defect, input], ['project', 'new-defect', postedBody.recurrence])
    if (!lifecycleReady) throw new Error('lifecycle not yet verified')
  } },
})
const { surveyService } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
surveyService.getAiCandidateFacts = async () => ({ projectId: 'project', detectionId: 'source', routeVersionId: 'real-route', segmentId: null, sourceVersion: 'source-version', geometryVersion: 'geometry-version' })

test('Web PM verifies the committed AI decision after candidate source validation', async () => {
  assert.deepEqual(await surveyService.decideCandidate('project', request), receipt)
  assert.deepEqual(calls, [['POST', base], ['GET', `${base}/decision`]])
  assert.equal(store.size, 0)
})

test('a mismatched target is not accepted, and a known receipt is retried without another POST', async () => {
  calls.length = 0; store.clear(); readback = { ...receipt, defectId: 'wrong-target' }
  await assert.rejects(surveyService.decideCandidate('project', request), /không khớp/)
  assert.equal(store.size, 1)
  readback = receipt
  await surveyService.decideCandidate('project', request)
  assert.deepEqual(calls, [['POST', base], ['GET', `${base}/decision`], ['GET', `${base}/decision`]])
  assert.equal(store.size, 0)
})

test('recurrence is submitted atomically and a failed lifecycle readback does not repeat POST', async () => {
  calls.length = 0; store.clear()
  readback = postReceipt = { ...receipt, decision: 'KEEP_NEW', defectId: 'new-defect' }
  const recurrence = { previousDefectId: 'old-defect', priorRepairDecisionId: 'repair-decision', evidenceFileIds: ['file'], expectedLifecycleVersion: 'a'.repeat(64) }
  const payload = { ...request, decision: 'KEEP_NEW', defectTypeCode: 'POTHOLE', severity: 'LOW', roadSectionVersionId: 'route', recurrence }
  await assert.rejects(surveyService.decideCandidate('project', payload), /lifecycle not yet verified/)
  assert.deepEqual(postedBody.recurrence, recurrence)
  assert.equal(postedBody.decision, 'KEEP_NEW')
  lifecycleReady = true
  await surveyService.decideCandidate('project', payload)
  assert.deepEqual(calls, [['POST', base], ['GET', `${base}/decision`], ['GET', `${base}/decision`]])
  assert.equal(store.size, 0)
})


test('FT95 KEEP_NEW derives route from candidate facts and blocks stale snapshots before POST', async () => {
  calls.length = 0; store.clear(); lifecycleReady = false
  readback = postReceipt = { ...receipt, decision: 'KEEP_NEW', defectId: 'new-defect' }
  const payload = { ...request, decision: 'KEEP_NEW', defectTypeCode: 'TRANSVERSE_CRACK', severity: 'LOW', runId: 'real-work-id' }
  await surveyService.decideCandidate('project', payload)
  assert.equal(postedBody.classification.roadSectionVersionId, 'real-route')
  assert.equal(calls.some(c => c[1].includes('ai-mock-runs')), false)
  calls.length = 0
  await assert.rejects(surveyService.decideCandidate('project', { ...payload, sourceVersion: 'stale' }), /Nguồn AI đã thay đổi/)
  assert.equal(calls.some(c => c[0] === 'POST'), false)
})

test('FT95 REJECT reads its receipt without creating a defect', async () => {
  calls.length = 0; store.clear()
  readback = postReceipt = { ...receipt, decision: 'REJECT', defectId: null }
  await surveyService.decideCandidate('project', { ...request, decision: 'REJECT' })
  assert.equal(postedBody.classification, null)
  assert.deepEqual(calls, [['POST', base], ['GET', `${base}/decision`]])
})
