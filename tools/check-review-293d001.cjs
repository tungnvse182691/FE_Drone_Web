// Focused source-level regression tests; no backend/SQL/browser or new test framework.
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const assert = require('node:assert/strict')
const ts = require('typescript')
const { webcrypto } = require('node:crypto')
const roles = { SUPERVISOR: 'SUPERVISOR', PROJECT_MANAGER: 'PROJECT_MANAGER', REPORTER: 'REPORTER' }
let actor = { id: 'pm', role: roles.PROJECT_MANAGER }
const auth = { useAuthStore: Object.assign(() => ({ user: actor }), { getState: () => ({ user: actor, token: 'test-token' }), subscribe: () => () => {} }) }
const storage = { getFromStorage: (_, fallback) => fallback, saveToStorage() {}, STORAGE_KEYS: { TRIAGE_CASES: 'cases' } }
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.resolve(file), 'utf8').replaceAll('import.meta.env', '({VITE_USE_MOCK:false})')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText
  const module = { exports: {} }
  const requireMock = name => {
    if (name in mocks) return mocks[name]
    if (name === 'axios') return require('axios')
    if (name.endsWith('/authStore')) return auth
    if (name.endsWith('/enums')) return { RoleCode: roles }
    if (name.endsWith('/storageHelper') || name === './storageHelper') return storage
    if (name === './userDirectory') return { userDirectory: {} }
    if (name === './projectService') return { projectService: { fetchProjects: async () => [{ id: 'p', name: 'P' }], getProjects: () => [] } }
    throw new Error(`Missing mock: ${name} (${file})`)
  }
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, console: mocks.__console || { log() {}, warn() {}, error() {} }, crypto: webcrypto, AbortController, setTimeout: mocks.__setTimeout || setTimeout, clearTimeout,
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

// A small hook/effect harness exercises the production loader without installing a framework.
function caseLifecycleHarness() {
  const listeners = new Set()
  let state = { user: { id: 'pm', role: roles.PROJECT_MANAGER }, token: 'test-token', isAuthenticated: true }
  const store = Object.assign(selector => selector(state), {
    getState: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) }
  })
  const changeSession = patch => {
    const before = state; state = { ...state, ...patch }
    listeners.forEach(listener => listener(state, before))
  }
  const writes = []; const errors = []; const calls = []
  const stored = { ...storage, saveToStorage: (key, value) => writes.push(json(value)) }
  const client = { get: (url, config) => {
    if (url === '/projects') return Promise.resolve(response({ items: [{ id: 'p', name: 'P' }, { id: 'q', name: 'Q' }] }))
    return new Promise((resolve, reject) => calls.push({ url, config, resolve, reject }))
  } }
  const serviceModule = load('src/api/services/triageService.ts', {
    '../client': { apiClient: client }, '../../store/authStore': { useAuthStore: store }, './storageHelper': stored
  })
  const values = []; const effects = []
  let slot = 0; let hook; let view
  const hooks = {
    useState(initial) {
      const index = slot++
      if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial
      return [values[index], value => { values[index] = typeof value === 'function' ? value(values[index]) : value }]
    },
    useMemo: fn => fn(),
    useEffect(setup, dependencies) {
      const index = slot++
      const previous = effects[index]
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects[index] = { setup, dependencies, cleanup: previous?.cleanup, pending: true }
      }
    }
  }
  const mockReact = { __esModule: true, default: hooks, ...hooks }
  hook = load('src/pages/(pm)/ai-review/useAIReviewState.ts', {
    react: mockReact, '../../../store/authStore': { useAuthStore: store },
    '../../../api/services/triageService': serviceModule,
    './useAIReviewFilters': { useAIReviewFilters: ({ cases }) => ({ filteredCases: cases }) },
    './useAIReviewDrawer': { useAIReviewDrawer: () => ({}) },
    './useAIReviewActions': { useAIReviewActions: () => ({}) },
    './useAIReviewLinkActions': { useAIReviewLinkActions: () => ({}) },
    __console: { log() {}, warn() {}, error: (...args) => errors.push(args) },
    __setTimeout: () => 0
  }).useAIReviewState
  const render = () => { slot = 0; view = hook(); return view }
  const commit = () => effects.forEach(effect => {
    if (effect.pending) { effect.cleanup?.(); effect.cleanup = effect.setup(); effect.pending = false }
  })
  const unmount = () => effects.forEach(effect => effect.cleanup?.())
  const strictRestart = () => effects.forEach(effect => { effect.cleanup?.(); effect.cleanup = effect.setup() })
  const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); return render() }
  return { serviceModule, calls, writes, errors, changeSession, store, render, commit, unmount, strictRestart, flush }
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
    await assert.rejects(service.getCases({ projectId: 'p' }), error => require('axios').isCancel(error))
  })
  await test('independent list consumers complete without canceling each other', async () => {
    let resolveOld; let calls = 0
    const service = triage({ get: async url => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      if (++calls === 1) return new Promise(resolve => { resolveOld = resolve })
      return response({ items: [] })
    } })
    const old = service.getCases({ projectId: 'p' })
    while (!resolveOld) await new Promise(resolve => setImmediate(resolve))
    await service.getCases({ projectId: 'p' }); resolveOld(response({ items: [detail()] })); assert.equal((await old).length, 1)
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

  await test('Case lifecycle: StrictMode setup/cleanup/setup ignores old success without stopping new loading', async () => {
    const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush()
    assert.equal(h.calls.length, 1)
    const oldSignal = h.calls[0].config.signal
    h.strictRestart(); await h.flush()
    assert.equal(oldSignal.aborted, true); assert.equal(h.calls.length, 2)
    // API double ignores signal, just as an already completed transport may still resolve.
    h.calls[0].resolve(response({ items: [detail({ id: 'old' })] }))
    let view = await h.flush()
    assert.equal(view.isLoading, true); assert.equal(h.errors.length, 0); assert.equal(h.writes.length, 0)
    h.calls[1].resolve(response({ items: [detail({ id: 'new' })] }))
    // ALL includes both projects, finish q scope too.
    await h.flush(); h.calls[2].resolve(response({ items: [] }))
    view = await h.flush()
    assert.equal(view.cases[0].id, 'new'); assert.equal(view.isLoading, false)
    assert.equal(view.loadError, null); assert.equal(view.toastMessage, null); assert.equal(h.errors.length, 0)
    assert.equal(h.writes.length, 1); assert.equal(h.writes[0][0].id, 'new')
  })
  await test('Case lifecycle: unmount and late real error is silent/no cache write', async () => {
    const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush(); h.unmount()
    h.calls[0].reject(failure(500, 'internal_error')); await h.flush()
    assert.equal(h.errors.length, 0); assert.equal(h.writes.length, 0)
    assert.equal(h.render().loadError, null); assert.equal(h.render().toastMessage, null)
  })
  await test('Case lifecycle: retry finishes before old request, only new state/store/storage survive', async () => {
    const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush()
    h.render().reloadCases(); h.render(); h.commit(); await h.flush()
    assert.equal(h.calls[0].config.signal.aborted, true)
    h.calls[1].resolve(response({ items: [detail({ id: 'retry-result' })] })); await h.flush()
    h.calls[2].resolve(response({ items: [] })); await h.flush()
    h.calls[0].resolve(response({ items: [detail({ id: 'stale' })] }))
    const view = await h.flush()
    assert.equal(view.cases[0].id, 'retry-result'); assert.equal(view.isLoading, false)
    assert.equal(h.writes.length, 1); assert.equal(h.writes[0][0].id, 'retry-result'); assert.equal(h.errors.length, 0)
    assert.equal(view.toastMessage, null)
    await assert.rejects(h.serviceModule.triageService.updateCase('stale', { pm_notes: 'bad' }), /Không tìm thấy/)
  })
  await test('Case lifecycle: concurrent scopes and detail reader never invalidate each other', async () => {
    const h = caseLifecycleHarness(); const service = h.serviceModule.triageService
    const p = service.getCases({ projectId: 'p' }); const q = service.getCases({ projectId: 'q' })
    const d = service.getCaseById('detail-only'); await h.flush()
    const pc = h.calls.find(call => call.config?.params?.projectId === 'p')
    const qc = h.calls.find(call => call.config?.params?.projectId === 'q')
    const dc = h.calls.find(call => call.url.endsWith('/detail-only'))
    qc.resolve(response({ items: [detail({ id: 'q-row', projectId: 'q' })] })); await q
    pc.resolve(response({ items: [detail({ id: 'p-row' })] })); assert.equal((await p)[0].id, 'p-row')
    dc.resolve(response(detail({ id: 'detail-only' }))); assert.equal((await d).id, 'detail-only')
    assert.equal(h.writes.length, 1); assert.equal(h.writes[0][0].id, 'q-row')
  })
  await test('Case lifecycle: canceled scope cannot overwrite newer scope cache', async () => {
    const h = caseLifecycleHarness(); const service = h.serviceModule.triageService
    const controller = new AbortController()
    const old = service.getCases({ projectId: 'p' }, controller.signal)
    const canceled = assert.rejects(old, error => h.serviceModule.isCaseReadCanceled(error))
    await h.flush(); controller.abort()
    const fresh = service.getCases({ projectId: 'q' }); await h.flush()
    h.calls[1].resolve(response({ items: [detail({ id: 'q-row', projectId: 'q' })] })); await fresh
    h.calls[0].resolve(response({ items: [detail({ id: 'stale-p' })] })); await canceled
    assert.equal(h.writes.length, 1); assert.equal(h.writes[0][0].id, 'q-row')
  })
  await test('Case lifecycle: profile replacement keeps session/request valid', async () => {
    const h = caseLifecycleHarness(); const session = h.serviceModule.getCaseSessionKey()
    h.render(); h.commit(); await h.flush()
    h.changeSession({ user: { ...h.store.getState().user, full_name: 'Changed profile' } })
    h.render(); h.commit(); assert.equal(h.serviceModule.getCaseSessionKey(), session)
    assert.equal(h.calls[0].config.signal.aborted, false)
    h.calls[0].resolve(response({ items: [detail()] })); await h.flush()
    h.calls[1].resolve(response({ items: [] })); const view = await h.flush()
    assert.equal(view.cases.length, 1); assert.equal(h.errors.length, 0)
  })
  await test('Case lifecycle: logout/login same account invalidates epoch, clears old state/cache', async () => {
    const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush()
    const key = h.serviceModule.getCaseSessionKey(); const previous = h.store.getState()
    h.changeSession({ user: null, isAuthenticated: false, token: null })
    h.changeSession(previous)
    assert.notEqual(h.serviceModule.getCaseSessionKey(), key)
    assert.equal(h.render().cases.length, 0); h.commit(); await h.flush()
    h.calls[0].reject(failure(403, 'old-session-forbidden')); await h.flush()
    assert.equal(h.errors.length, 0); assert.equal(h.render().isLoading, true)
    assert.ok(h.writes.every(rows => rows.length === 0))
    h.calls[1].resolve(response({ items: [] })); await h.flush(); h.calls[2].resolve(response({ items: [] })); await h.flush()
    assert.equal(h.render().cases.length, 0); assert.equal(h.render().isLoading, false)
  })
  for (const patch of [{ user: { id: 'other', role: roles.PROJECT_MANAGER } }, { user: { id: 'pm', role: roles.SUPERVISOR } }, { token: 'new-test-session' }]) {
    await test(`Case lifecycle: identity change ${Object.keys(patch).join()} aborts old results`, async () => {
      const h = caseLifecycleHarness(); const old = h.serviceModule.triageService.getCases({ projectId: 'p' })
      const canceled = assert.rejects(old, error => h.serviceModule.isCaseReadCanceled(error)); await h.flush()
      h.changeSession(patch); h.calls[0].resolve(response({ items: [detail()] })); await canceled
      assert.ok(h.writes.every(rows => rows.length === 0))
    })
  }
  for (const error of [failure(403, 'access_forbidden'), failure(500, 'internal_error'), new Error('Network Error')]) {
    await test(`Case lifecycle: active ${error.message} remains visible and preserves error identity`, async () => {
      const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush()
      h.calls[0].reject(error); const view = await h.flush()
      assert.equal(view.loadError, error.message); assert.ok(view.toastMessage.includes(error.message))
      assert.equal(view.isLoading, false); assert.equal(h.errors.length, 1); assert.equal(h.errors[0][1], error)
      assert.equal(h.writes.length, 0)
    })
  }
  await test('Case lifecycle: successful empty collection is empty, not an API error', async () => {
    const h = caseLifecycleHarness(); h.render(); h.commit(); await h.flush()
    h.calls[0].resolve(response({ items: [] })); await h.flush(); h.calls[1].resolve(response({ items: [] }))
    const view = await h.flush()
    assert.equal(view.cases.length, 0); assert.equal(view.isLoading, false); assert.equal(view.loadError, null)
    assert.equal(h.errors.length, 0); assert.equal(h.writes.length, 1)
  })
  console.log(`${passed} focused regression scenarios passed (mock HTTP/hooks; NOT E2E).`)
})().catch(error => { console.error(error); process.exitCode = 1 })
