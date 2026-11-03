// Focused source-level regression tests; no backend/SQL/browser or new test framework.
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const assert = require('node:assert/strict')
const ts = require('typescript')
const { webcrypto } = require('node:crypto')
const roles = { SUPERVISOR: 'SUPERVISOR', PROJECT_MANAGER: 'PROJECT_MANAGER', REPORTER: 'REPORTER' }
let actor = { id: 'pm', role: roles.PROJECT_MANAGER }
const auth = { useAuthStore: Object.assign(() => ({ user: actor }), { getState: () => ({ user: actor, token: 'test-token' }) }) }
const storage = { getFromStorage: (_, fallback) => fallback, saveToStorage() {}, STORAGE_KEYS: { TRIAGE_CASES: 'cases' } }
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.resolve(file), 'utf8').replaceAll('import.meta.env', '({VITE_USE_MOCK:false})')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText
  const module = { exports: {} }
  const requireMock = name => {
    if (name in mocks) return mocks[name]
    if (name.endsWith('/authStore')) return auth
    if (name.endsWith('/enums')) return { RoleCode: roles }
    if (name.endsWith('/storageHelper') || name === './storageHelper') return storage
    if (name === './userDirectory') return { userDirectory: {} }
    if (name === './projectService') return { projectService: { fetchProjects: async () => [{ id: 'p', name: 'P' }], getProjects: () => [] } }
    throw new Error(`Missing mock: ${name} (${file})`)
  }
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, console: { log() {}, warn() {}, error() {} }, crypto: webcrypto, setTimeout, clearTimeout,
    sessionStorage: { getItem: () => null, setItem() {} }, localStorage: { getItem: () => null, setItem() {} }, window: undefined, URL, Blob }, { filename: file })
  return module.exports
}
const detail = (extra = {}) => ({ id: 'case-new', projectId: 'p', version: 'AAAAAAAAAAE=', reportIds: ['r1', 'r2'], ...extra })
const response = data => ({ data, headers: { etag: '"AAAAAAAAAAE="' } })
const failure = (status, code) => Object.assign(new Error(code), { response: { status, data: { code, detail: code } } })
const json = value => JSON.parse(JSON.stringify(value))
let passed = 0
async function test(name, run) { await run(); passed++; console.log(`PASS ${name}`) }
function triage(client) { return load('src/api/services/triageService.ts', { '../client': { apiClient: client } }).triageService }
function reactMock() {
  const states = []
  let i = 0
  const hooks = { useState(value) { const slot = i++; states[slot] = value; return [value, next => { states[slot] = typeof next === 'function' ? next(states[slot]) : next }] }, useRef: value => ({ current: value }), useCallback: fn => fn, useMemo: fn => fn(), useEffect() {} }
  return { module: { __esModule: true, default: hooks, ...hooks }, states }
}
;(async () => {
  await test('CONCLUDED NO_DEFECT conflicts with new intent; no POST', async () => {
    let posts = 0
    const service = triage({ get: async () => response(detail({ status: 'CONCLUDED', conclusion: { outcome: 'NO_DEFECT', reason: 'server reason' } })), post: async () => { posts++ } })
    await assert.rejects(service.concludeCase('case-new', { outcome: 'CONFIRMED' }), error => error.serverCase.conclusion === 'NO_DEFECT' && error.serverCase.conclusion_reason === 'server reason')
    assert.equal(posts, 0)
  })
  for (const [status, code] of [[412, 'concurrency_conflict'], [409, 'source_not_ready'], [409, 'idempotency_key_reused']]) {
    await test(`${status}/${code}: reconcile GET, never second POST`, async () => {
      let posts = 0; let reads = 0
      const service = triage({ get: async () => { reads++; return response(detail()) }, post: async () => { posts++; throw failure(status, code) } })
      await assert.rejects(service.concludeCase('case-new', { outcome: 'NEEDS_EVIDENCE', evidenceIds: ['user-evidence'] }), error => error.code === code && !!error.serverCase)
      assert.equal(posts, 1); assert.equal(reads, 2)
    })
  }
  await test('new Case without evidence reference: no seed/no POST', async () => {
    let posts = 0
    const service = triage({ get: async () => response(detail()), post: async () => { posts++ } })
    await assert.rejects(service.concludeCase('case-new', { outcome: 'NO_DEFECT' }), /contract gap/)
    assert.equal(posts, 0)
  })
  await test('NEEDS_EVIDENCE permits empty references as validated by CaseWorkflowService', async () => {
    const bodies = []
    const service = triage({ get: async () => response(detail()), post: async (_, body) => {
      bodies.push(body); return response(detail({ status: 'AWAITING_EVIDENCE', conclusion: { outcome: 'NEEDS_EVIDENCE' } }))
    } })
    assert.equal((await service.concludeCase('case-new', { outcome: 'NEEDS_EVIDENCE' })).conclusion, 'NEEDS_EVIDENCE')
    assert.deepEqual(json(bodies[0].evidenceIds), []); assert.deepEqual(json(bodies[0].defectIds), [])
  })
  await test('publication preserves recipient subset and exact evidence; missing recipient blocks', async () => {
    const bodies = []
    const service = triage({ get: async () => response(detail({ conclusion: { evidenceIds: ['other-recipient-evidence'] } })), post: async (_, body) => { bodies.push(body); return response({ version: 'new' }) } })
    await service.publishCase('case-new', { reportIds: ['r1'], evidenceIds: ['selected-evidence'], summary: 'Summary' })
    assert.deepEqual(json(bodies[0].reportIds), ['r1']); assert.deepEqual(json(bodies[0].evidenceIds), ['selected-evidence'])
    await assert.rejects(service.publishCase('case-new', { summary: 'No recipient' }), /recipient/)
    assert.equal(bodies.length, 1)
  })
  await test('timeout preserves command identity and blocks another POST', async () => {
    let posts = 0
    const service = triage({ get: async () => response(detail()), post: async () => { posts++; throw new Error('timeout') } })
    const input = { outcome: 'NO_DEFECT', evidenceIds: ['e1'] }
    await assert.rejects(service.concludeCase('case-new', input), error => !!error.commandKey)
    await assert.rejects(service.concludeCase('case-new', input), /Lệnh trước/)
    assert.equal(posts, 1)
  })
  await test('PM scoped requests, independent pagination, no invented reporter/location', async () => {
    actor = { id: 'secondary-pm', role: roles.PROJECT_MANAGER }
    const queries = []
    const service = triage({ get: async (url, config) => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      queries.push(config.params)
      return response({ items: [detail({ verificationMethod: 'DRONE' })], nextCursor: config.params.cursor ? null : 'page2' })
    } })
    const items = await service.getCases()
    assert.equal(queries.length, 2); assert.ok(queries.every(q => q.projectId === 'p'))
    assert.equal(queries[1].cursor, 'page2'); assert.equal(items[0].source, 'CITIZEN')
    assert.equal(items[0].reporter_name, undefined); assert.equal(items[0].gps.lat, null); assert.equal(items[0].image_url, '')
  })
  await test('Supervisor always requests unassigned AND project scopes', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const scopes = []
    const service = triage({ get: async (url, config) => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      scopes.push(config.params.projectId)
      return response({ items: [detail({ id: config.params.projectId ? 'assigned' : 'unassigned', projectId: config.params.projectId })] })
    } })
    assert.equal((await service.getCases()).length, 2); assert.deepEqual(scopes, [undefined, 'p'])
  })
  await test('project source failure is error, never complete empty list', async () => {
    const service = triage({ get: async url => { if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] }); throw failure(503, 'dependency_unavailable') } })
    await assert.rejects(service.getCases(), /dependency_unavailable/)
  })
  await test('old session response cannot complete Case list', async () => {
    const service = triage({ get: async url => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      actor = { id: 'different-session', role: roles.SUPERVISOR }
      return response({ items: [detail()] })
    } })
    await assert.rejects(service.getCases({ projectId: 'p' }), /Phiên đã thay đổi/)
  })
  await test('old list scope response cannot save over newer list', async () => {
    let resolveOld; let calls = 0
    const service = triage({ get: async url => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      if (++calls === 1) return new Promise(resolve => { resolveOld = resolve })
      return response({ items: [] })
    } })
    const old = service.getCases({ projectId: 'p' }); const rejected = assert.rejects(old, /scope\/phiên cũ/)
    while (!resolveOld) await new Promise(resolve => setImmediate(resolve))
    await service.getCases({ projectId: 'p' }); resolveOld(response({ items: [detail()] })); await rejected
  })
  await test('Reporter request failure retains staff and exposes partial/retry error', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const hooks = reactMock()
    const { usePersonnelState } = load('src/pages/(sup)/system-control/usePersonnelState.ts', {
      react: hooks.module,
      '../../../api/services/personnelService': { personnelService: { fetchUsers: async filter => { if (filter) throw new Error('reporter denied'); return [{ id: 'staff' }] } } },
      '../../../api/services/projectService': { projectService: {} }, '../../../api/services/userDirectory': { userDirectory: {} }
    })
    const state = usePersonnelState(() => {})
    await state.loadUsers()
    assert.ok(hooks.states.some(value => Array.isArray(value) && value.some(item => item.id === 'staff')))
    assert.ok(hooks.states.some(value => typeof value === 'string' && value.includes('Reporter chưa tải được')))
  })
  await test('create project duplicate_request is not code conflict; diagnostic metadata retained', async () => {
    const { projectService } = load('src/api/services/projectService.ts', { '../client': { apiClient: { post: async () => { throw failure(409, 'duplicate_request') } } } })
    await assert.rejects(projectService.createProject({ code: ' NEW ', name: 'New' }), error => error.code === 'duplicate_request' && !error.message.includes('đã tồn tại') && !!error.response && error.input.code === ' NEW ')
  })
  await test('AI has server disposition/version and includes Survey beside succeeded run', async () => {
    const projectId = 'p'
    const detectionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const facts = { projectId, detectionId, sourceVersion: 'source-v', geometryVersion: 'geometry-v', routeVersionId: 'route-v', disposition: { decisionId: 'decision', version: 'disp-v' }, frameFileId: 'frame' }
    const { surveyService } = load('src/api/services/surveyService.ts', { '../client': { apiClient: { get: async url => {
      if (url.endsWith('/ai-mock-runs')) return response({ items: [{ id: 'run', status: 'SUCCEEDED' }] })
      if (url.endsWith('/result')) return response({ detections: [{ detectionId, confidence: .9, bbox: [0, 0, .1, .1], typeCode: 'CRACK', timestampMs: 10 }] })
      throw new Error(`Unexpected request ${url}`)
    } } } })
    surveyService.getProjectDefects = async () => []
    surveyService.getSurveys = async () => [{ id: 'survey' }]
    surveyService.getSurveyDetections = async () => [{ id: 'survey-detection', projectId }]
    surveyService.getAiCandidateFacts = async () => facts
    surveyService.getCandidateDecision = async () => ({ decision: 'REJECT', defectId: null, version: 'decision-v' })
    const result = await surveyService.getAllProjectAiDetections('p')
    assert.equal(result.length, 2)
    const item = result.find(row => row.id === detectionId)
    assert.equal(item.status, 'REJECTED'); assert.equal(item.sourceVersion, 'source-v'); assert.equal(item.geometryVersion, 'geometry-v'); assert.equal(item.disposition.version, 'disp-v')
    surveyService.getCandidateDecision = async () => ({ decision: 'LINK_EXISTING', defectId: 'linked-defect', version: 'linked-v' })
    const linked = (await surveyService.getAllProjectAiDetections('p')).find(row => row.id === detectionId)
    assert.equal(linked.status, 'APPROVED'); assert.equal(linked.defectId, 'linked-defect'); assert.equal(linked.decisionKind, 'LINK_EXISTING')
    surveyService.getAiCandidateFacts = async () => { throw failure(503, 'lookup failed') }
    await assert.rejects(surveyService.getAllProjectAiDetections('p'), /lookup failed/)
  })
  await test('caller preserves server result and draft on conflict; no success toast', async () => {
    const hooks = reactMock(); let cases = [detail()]; const notices = []
    const { useAIReviewActions } = load('src/pages/(pm)/ai-review/useAIReviewActions.ts', {
      react: hooks.module, 'react-router-dom': { useNavigate: () => () => {} },
      './useAIReviewSurveyActions': { useAIReviewSurveyActions: () => ({}) },
      '../../../api/services/triageService': { triageService: { concludeCase: async () => { throw Object.assign(new Error('conflict'), { serverCase: { id: 'case-new', conclusion: 'NO_DEFECT', pm_notes: 'server' } }) } } }
    })
    const actions = useAIReviewActions({ cases, selectedCase: { ...detail(), source: 'CITIZEN' }, setCases: fn => { cases = fn(cases) }, showToast: text => notices.push(text), currentNotes: 'unsent draft' })
    await actions.handleVerifyDefect()
    assert.equal(cases[0].conclusion, 'NO_DEFECT'); assert.equal(cases[0].pm_notes, 'server')
    assert.ok(notices.every(text => !text.includes('Đã ghi nhận')))
    // The hook never changes its caller-owned currentNotes draft.
    const source = fs.readFileSync('src/pages/(pm)/ai-review/useAIReviewActions.ts', 'utf8')
    assert.ok(!source.includes('Đã chuyển sang phân hệ Nhiệm vụ'))
  })
  await test('NEEDS_EVIDENCE success only reports evidence request, never FIELD creation', async () => {
    const hooks = reactMock(); let cases = [detail()]; const notices = []
    const { useAIReviewActions } = load('src/pages/(pm)/ai-review/useAIReviewActions.ts', {
      react: hooks.module, 'react-router-dom': { useNavigate: () => () => {} },
      './useAIReviewSurveyActions': { useAIReviewSurveyActions: () => ({}) },
      '../../../api/services/triageService': { triageService: { concludeCase: async (_, input) => {
        assert.equal(input.outcome, 'NEEDS_EVIDENCE')
        return { id: 'case-new', conclusion: 'NEEDS_EVIDENCE', pm_notes: 'server request' }
      } } }
    })
    const actions = useAIReviewActions({ cases, selectedCase: { ...detail(), source: 'CITIZEN' }, setCases: fn => { cases = fn(cases) }, showToast: text => notices.push(text), currentNotes: 'draft' })
    await actions.handleVerifyDefect()
    assert.equal(cases[0].pm_notes, 'server request')
    assert.ok(notices[0].includes('Đã ghi nhận yêu cầu bổ sung bằng chứng'))
    assert.ok(notices[0].includes('Chưa tạo hoặc giao nhiệm vụ'))
  })
  console.log(`${passed} focused regression scenarios passed (mock HTTP/hooks; NOT E2E).`)
})().catch(error => { console.error(error); process.exitCode = 1 })
