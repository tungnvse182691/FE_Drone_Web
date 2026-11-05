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
    if (name === 'zustand') return require('zustand')
    if (name === 'maplibre-gl') return {}
    if (name.endsWith('/utils/maplibre')) return { getMapLibreStyle: () => ({}) }
    if (name.endsWith('/authStore')) return auth
    if (name.endsWith('/enums')) return { RoleCode: roles }
    if (name.endsWith('/storageHelper') || name === './storageHelper') return storage
    if (name === './userDirectory') return { userDirectory: {} }
    if (name === './projectService') return { projectService: { fetchProjects: async () => [{ id: 'p', name: 'P' }], getProjects: () => [] } }
    throw new Error(`Missing mock: ${name} (${file})`)
  }
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, console: mocks.__console || { log() {}, warn() {}, error() {} }, crypto: webcrypto, AbortController, URLSearchParams, setTimeout: mocks.__setTimeout || setTimeout, clearTimeout,
    sessionStorage: mocks.__sessionStorage || { getItem: () => null, setItem() {}, removeItem() {} }, localStorage: { getItem: () => null, setItem() {} }, window: mocks.__window, BroadcastChannel: mocks.__BroadcastChannel, URL, Blob }, { filename: file })
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
    let written = false
    const service = triage({ get: async () => response(detail(written ? { status: 'AWAITING_EVIDENCE', conclusion: { outcome: 'NEEDS_EVIDENCE' } } : {})), post: async (_, body) => {
      written = true; bodies.push(body); return response(detail({ status: 'AWAITING_EVIDENCE', conclusion: { outcome: 'NEEDS_EVIDENCE' } }))
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
    assert.equal((await service.getCases()).length, 2); assert.deepEqual(scopes, [undefined, undefined, undefined, undefined, undefined, 'p'])
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
  await test('AI keeps server disposition/version and reads run without legacy Survey mapper', async () => {
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
    assert.equal(result.length, 1)
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
    await assert.rejects(h.serviceModule.triageService.updateCase('stale', { pm_notes: 'bad' }), /updateCase/)
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

  await test('UNKNOWN card/detail badges never present low/normal priority', async () => {
    const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server')
    const componentMocks = { react: { __esModule: true, default: React, ...React }, 'react-router-dom': { useNavigate: () => () => {}, useLocation: () => ({ pathname: '/pm/ai-inbox' }) }, '../../../components/ui/Icon': { Icon: () => null } }
    const item = { id: 'case', code: '#CAS-TEST', source: 'CITIZEN', source_label: 'Phản ánh', source_detail: '', severity: 'UNKNOWN', urgency: 'UNKNOWN', status: 'PENDING', project_id: 'p', project_name: 'P', stationing: 'Chưa có dữ liệu', gps: { lat: null, lng: null, altitude_m: 0, resolution_cm_px: 0 }, pm_notes: '', image_url: '' }
    const { TriageCard } = load('src/pages/(pm)/ai-review/TriageCard.tsx', componentMocks)
    const markup = renderToStaticMarkup(React.createElement(TriageCard, { item, selectedCaseId: '', childReports: [] }))
    assert.ok(markup.includes('Chưa xác định ưu tiên')); assert.ok(!markup.includes('Ưu tiên Thấp'))
    const low = renderToStaticMarkup(React.createElement(TriageCard, { item: { ...item, severity: 'LOW' }, selectedCaseId: '', childReports: [] }))
    assert.ok(low.includes('Ưu tiên Thấp'))
    const { CitizenTriageChildRow } = load('src/pages/(pm)/ai-review/CitizenTriageChildRow.tsx', componentMocks)
    const child = renderToStaticMarkup(React.createElement(CitizenTriageChildRow, { child: item, masterCode: 'master', masterProjectName: 'P' }))
    assert.ok(child.includes('Chưa xác định')); assert.ok(!child.includes('>Thấp<'))
    const { PhotoZoomModal } = load('src/pages/(pm)/ai-review/PhotoZoomModal.tsx', componentMocks)
    const photo = renderToStaticMarkup(React.createElement(PhotoZoomModal, { isOpen: true, selectedCase: item }))
    assert.ok(!photo.includes('Nhẹ (Cấp 1)')); assert.ok(!photo.includes('>Bình thường<'))
  })
  await test('UNKNOWN priority and AwaitingEvidence filter/count keep unknown out of known critical KPI', async () => {
    let index = 0
    const hooks = { useState: value => [index++ === 5 ? 'UNKNOWN' : value, () => {}], useMemo: fn => fn(), useEffect() {} }
    const { useAIReviewFilters } = load('src/pages/(pm)/ai-review/useAIReviewFilters.ts', { react: { ...hooks }, 'react-router-dom': { useSearchParams: () => [new URLSearchParams(), () => {}] } })
    const cases = [{ id: 'unknown', severity: 'UNKNOWN', status: 'AWAITING_EVIDENCE', source: 'CITIZEN', stationing: '' }, { id: 'low', severity: 'LOW', status: 'PENDING', source: 'CITIZEN', stationing: '' }]
    const filters = useAIReviewFilters({ cases })
    assert.deepEqual(json(filters.filteredCases.map(item => item.id)), ['unknown']); assert.equal(filters.criticalCount, 0); assert.equal(filters.surveyCount, 1)
  })
  await test('link and split use server report references/current versions, never fabricate a local success', async () => {
    const calls = []
    const service = triage({ get: async url => response(detail({ id: url.endsWith('source') ? 'source' : 'master', reportIds: url.endsWith('source') ? ['r-source'] : ['r-master', 'r-source'] })), post: async (url, body, options) => { calls.push({ url, body, options }); return response(detail({ id: 'master' })) } })
    await service.linkDuplicateReports('master', ['source'], 'link test')
    assert.deepEqual(json(calls[0].body.reportIds), ['r-source']); assert.equal(calls[0].body.sourceCaseVersions.source, 'AAAAAAAAAAE=')
    await service.splitReport('master', 'r-source', 'split test')
    assert.deepEqual(json(calls[1].body.reportIds), ['r-source']); assert.equal(calls[1].options.headers['If-Match'], '"AAAAAAAAAAE="')
    const denied = triage({ get: async () => response(detail()), post: async () => { throw failure(403, 'access_forbidden') } })
    await assert.rejects(denied.linkDuplicateReports('master', ['source'], 'denial'), error => error.response.status === 403)
  })
  await test('FIELD: API error propagates; unknown measurement cannot be accepted and PM cannot submit for Crew', async () => {
    let posts = 0
    const { fieldTaskService } = load('src/api/services/fieldTaskService.ts', { '../client': { apiClient: { get: async url => {
      if (url.endsWith('/field-inspection-tasks')) throw failure(500, 'internal_error')
      if (url.includes('/submissions/')) return response({ readiness: 'INCOMPLETE', missingReasons: ['MEASUREMENT_VALUE_UNKNOWN'] })
      return response({ latestSubmissionId: 's', version: 'AAAAAAAAAAE=' })
    }, post: async () => { posts++ } } }, './surveyService': { surveyService: {} } })
    await assert.rejects(fieldTaskService.getTasks({ projectId: 'p' }), error => error.response.status === 500)
    await assert.rejects(fieldTaskService.verifyTask('p', 't'), /MEASUREMENT_VALUE_UNKNOWN/)
    await assert.rejects(fieldTaskService.startMeasuring('p', 't'), /Crew/)
    await assert.rejects(fieldTaskService.recordMeasurement('p', 't', 42), /Crew/)
    assert.equal(posts, 0)
  })

  await test('Supervisor failed unassigned scope exposes partial data plus diagnostics, never caches it as complete', async () => {
    const h = caseLifecycleHarness()
    h.changeSession({ user: { id: 'sup', role: roles.SUPERVISOR } })
    h.render(); h.commit(); await h.flush()
    h.calls[0].reject(failure(409, 'reference_scope_conflict')); await h.flush()
    for (let i = 1; i < 7; i++) { h.calls[i].resolve(response({ items: i === 5 ? [detail()] : [] })); await h.flush() }
    const view = await h.flush()
    assert.equal(view.cases.length, 1); assert.ok(view.loadError.includes('reference_scope_conflict'))
    assert.equal(view.isLoading, false)
    assert.ok(h.writes.every(rows => rows.length === 0))
  })
  await test('FIELD Accepted is not verified; unknown physical data/evidence do not become seeded facts', async () => {
    const { fieldTaskService } = load('src/api/services/fieldTaskService.ts', {
      '../client': { apiClient: { get: async () => response({ items: [{ id: 'task-id', projectId: 'p', defectId: 'd', sourceKind: 'REPORTER', status: 'Accepted', requiredMeasurementType: 4, measurementScope: '{}' }] }) } }, './surveyService': { surveyService: {} }
    })
    const result = await fieldTaskService.getTasks({ projectId: 'p' })
    assert.equal(result[0].status, 'ASSIGNED'); assert.equal(result[0].chainage_km, null)
    assert.equal(result[0].gps_lat, undefined); assert.equal(result[0].reused_evidence, undefined); assert.equal(result[0].reporter_name, undefined)
    assert.equal(result[0].measurement_type, 'Diện tích (Area)')
  })
  await test('FIELD SUPPLEMENT sends current submission/version without claiming UNKNOWN is accepted', async () => {
    const sent = []
    const { fieldTaskService } = load('src/api/services/fieldTaskService.ts', {
      '../client': { apiClient: { get: async url => response(url.includes('/submissions/') ? { readiness: 'INCOMPLETE', missingReasons: ['LOCATION_UNKNOWN'] } : { latestSubmissionId: 'submission', version: 'AAAAAAAAAAE=' }), post: async (url, body, options) => { sent.push({ body, options }); return response({}) } } }, './surveyService': { surveyService: {} }
    })
    await fieldTaskService.verifyTask('p', 'task', undefined, 'SUPPLEMENT')
    assert.equal(sent[0].body.submissionId, 'submission'); assert.equal(sent[0].body.decision, 'SUPPLEMENT')
    assert.equal(sent[0].options.headers['If-Match'], '"AAAAAAAAAAE="')
  })

  await test('Supervisor queries explicit unassigned scope and still reports corrupt concluded scope', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const queries = []
    const service = triage({ get: async (url, config) => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'Project', projectCode: 'PRJ' }] })
      queries.push(config.params)
      if (!config.params.projectId && config.params.status === 'CONCLUDED') throw failure(409, 'reference_scope_conflict')
      return response({ items: config.params.status === 'UNASSIGNED' ? [detail({ id: 'unassigned', projectId: null, status: 'UNASSIGNED' })] : [] })
    } })
    await assert.rejects(service.getCases(), error => {
      assert.equal(error.items[0].id, 'unassigned')
      assert.equal(error.failures[0].status, 'CONCLUDED')
      assert.equal(error.failures[0].cause.response.status, 409)
      return true
    })
    assert.ok(queries.filter(q => !q.projectId).every(q => ['UNASSIGNED','OPEN','AWAITING_EVIDENCE','CONCLUDED','LINKED'].includes(q.status)))
  })
  await test('report merge banner never invents Defect reference or equates report linking with Defect linking', async () => {
    const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server')
    const { DrawerDecisionBanners } = load('src/pages/(pm)/ai-review/DrawerDecisionBanners.tsx', {
      react: { __esModule: true, default: React, ...React }, 'react-router-dom': { useNavigate: () => () => {} }, '../../../components/ui/Icon': { Icon: () => null }
    })
    const selectedCase = { id: 'c', status: 'MERGED', severity: 'UNKNOWN', urgency: 'UNKNOWN' }
    const markup = renderToStaticMarkup(React.createElement(DrawerDecisionBanners, { selectedCase }))
    assert.ok(markup.includes('HỒ SƠ CÓ LIÊN KẾT BÁO CÁO')); assert.ok(!markup.includes('#DEF-'))
    const linked = renderToStaticMarkup(React.createElement(DrawerDecisionBanners, { selectedCase: { ...selectedCase, decision_kind: 'LINK_EXISTING', linked_defect_id: 'real-ref-123' } }))
    assert.ok(linked.includes('#DEF-REAL-REF'))
  })
  await test('assignment and transparent AUTO filter are independent from processing status', async () => {
    const rows = [{ id: 'unassigned', project_id: '', status: 'PENDING', source: 'CITIZEN', stationing: '', severity: 'UNKNOWN' }, { id: 'assigned', project_id: 'p', status: 'PENDING', source: 'CITIZEN', stationing: '', severity: 'UNKNOWN' }, { id: '11ad1a42-cfbb-4cc6-a8a8-a770c7c4ee86', project_id: 'p', status: 'PENDING', source: 'CITIZEN', stationing: '', severity: 'UNKNOWN' }]
    const run = (projectFilter, hide) => {
      let index = 0
      const hooks = { useState: value => { const current = index++; return [current === 0 ? hide : current === 4 ? projectFilter : value, () => {}] }, useMemo: fn => fn(), useEffect() {} }
      return load('src/pages/(pm)/ai-review/useAIReviewFilters.ts', { react: hooks, 'react-router-dom': { useSearchParams: () => [new URLSearchParams(), () => {}] } }).useAIReviewFilters({ cases: rows })
    }
    assert.deepEqual(json(run('UNASSIGNED', false).filteredCases.map(c => c.id)), ['unassigned'])
    assert.equal(run('ASSIGNED', false).filteredCases.length, 2)
    assert.equal(run('ALL', true).filteredCases.length, 2)
    assert.equal(run('ALL', true).pendingCount, 2)
    assert.equal(run('ALL', true).autoTestCount, 1)
    assert.equal(run('ALL', false).filteredCases.length, 3)
  })
  await test('Supervisor status filter preserves canonical status and paginates every scope independently', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const calls = []
    const service = triage({ get: async (url, config) => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }], nextCursor: config.params.cursor ? null : 'projects-next' })
      const q = config.params; calls.push(json(q))
      assert.equal(q.status, 'OPEN'); assert.equal(q.pageSize, 1)
      return response({ items: [detail({ id: `${q.projectId || 'unassigned'}-${q.cursor || 'first'}`, projectId: q.projectId, status: 'OPEN' })], nextCursor: q.cursor ? null : 'cases-next' })
    } })
    const rows = await service.getCases({ status: 'OPEN', pageSize: 1 })
    assert.equal(rows.length, 4)
    assert.ok(rows.every(row => row.status === 'PENDING'))
    assert.deepEqual(calls.map(q => q.cursor), [undefined, 'cases-next', undefined, 'cases-next', undefined, 'cases-next'])
  })
  await test('all failed Supervisor scopes retain every diagnostic rather than empty success', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const service = triage({ get: async url => {
      if (url === '/projects') return response({ items: [{ id: 'p', name: 'P' }] })
      throw failure(503, 'dependency_unavailable')
    } })
    await assert.rejects(service.getCases(), error => error.items.length === 0 && error.failures.length === 6 && error.message.includes('CONCLUDED') && error.message.includes('p'))
  })
  await test('repeated scope cursor is exposed and standalone AwaitingEvidence maps without conclusion', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const service = triage({ get: async url => {
      if (url === '/projects') return response({ items: [] })
      return response({ items: [detail({ status: 'AWAITING_EVIDENCE', projectId: null })], nextCursor: 'repeat' })
    } })
    await assert.rejects(service.getCases({ status: 'AWAITING_EVIDENCE' }), error => error.items[0].status === 'AWAITING_EVIDENCE' && error.failures[0].cause.message.includes('Cursor'))
  })
  await test('supplement multipart uses admitted 8MiB parts and completes all ETags; no real IO', async () => {
    const source = fs.readFileSync('tools/verify-intake-runtime.cjs', 'utf8')
    const fn = source.slice(source.indexOf('async function supplementUnassignedImages()'), source.indexOf('async function prepareUnassignedThree()'))
    const bytes = Buffer.alloc(20 * 1024 * 1024); bytes[0] = 255; bytes[1] = 216
    const manifest = Array.from({ length: 3 }, () => ({ path: 'mock.jpg', title: 'Mock test only', author: 'Test', license: 'CC0', page: 'https://example.test/source' }))
    const sizes = []; const completed = []; let logins = 0
    const context = {
      assert, Buffer, URL, crypto: require('node:crypto'), process: { env: { RG_IMAGE_MANIFEST: 'mock.json' } },
      fs: { readFileSync: name => name === 'mock.json' ? JSON.stringify(manifest) : bytes },
      login: async () => { logins++; return 'test-token' }, readSql: () => [{ Id: 'report', CaseId: 'case' }],
      ledger: {}, saveLedger() {}, console: { log() {} },
      fetch: async (_, options) => { sizes.push(options.body.length); return { ok: true, headers: { get: () => 'part-etag' } } },
      request: async (_, route, method, body) => {
        if (route.includes('/cases/')) return { data: { status: 'UNASSIGNED' } }
        if (route.endsWith('/part-urls')) return { data: { parts: body.partNumbers.map(partNumber => ({ partNumber, url: 'https://example.test/part' })) } }
        if (route.endsWith('/complete')) { completed.push(json(body)); return { data: {} } }
        if (route.includes('/files/')) return { data: { status: 'VERIFIED', version: 'v' } }
        if (route.includes('/uploads')) return { data: { id: 'upload', fileId: 'file', status: 'PENDING', partSizeBytes: 8 * 1024 * 1024, version: 'v' } }
        return { data: { version: 'v', supplements: [], evidence: [] } }
      }
    }
    await vm.runInNewContext(fn + '; supplementUnassignedImages()', context)
    assert.deepEqual(sizes, [8,8,4,8,8,4,8,8,4].map(n => n * 1024 * 1024))
    assert.ok(completed.every(body => body.parts.length === 3 && body.parts.every((part, i) => part.partNumber === i + 1 && part.eTag === 'part-etag')))
    context.process.env = {}; logins = 0
    await assert.rejects(vm.runInNewContext(fn + '; supplementUnassignedImages()', context), /RG_IMAGE_MANIFEST/)
    assert.equal(logins, 0)
  })
  await test('self phone reads exact strong ETag; PATCH204 has only own number then GET sees fresh version', async () => {
    const calls = []; let saved = false
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../client': { apiClient: {
      get: async url => ({ data: { phoneNumber: saved ? '+84901234567' : null, phoneNumberConfirmed: false, version: saved ? 'AAAAAAAAAAI=' : 'AAAAAAAAAAE=' }, headers: { etag: saved ? '"AAAAAAAAAAI="' : '"AAAAAAAAAAE="' } }),
      patch: async (url, body, options) => { calls.push({ url, body, options }); saved = true; return { status: 204 } }
    } } })
    const before = await selfPhoneService.read(); await selfPhoneService.save('+84901234567', before.etag)
    const after = await selfPhoneService.read()
    assert.equal(calls[0].url, '/me/phone-number'); assert.deepEqual(json(calls[0].body), { phoneNumber: '+84901234567' })
    assert.equal(calls[0].options.headers['If-Match'], before.etag); assert.ok(calls[0].options.headers['Idempotency-Key'])
    assert.notEqual(after.etag, before.etag); assert.equal(after.phoneNumberConfirmed, false)
  })
  await test('self phone unknown timeout preserves identity, blocks new intent and only deliberate replay uses same command', async () => {
    const calls = []; let timeout = true
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../client': { apiClient: {
      patch: async (url, body, options) => { calls.push(json({ url, body, options })); if (timeout) throw new Error('timeout'); return { status: 204 } }
    } } })
    await assert.rejects(selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="'), /timeout/)
    const held = selfPhoneService.pending()
    await assert.rejects(selfPhoneService.save('+84901234568', '"AAAAAAAAAAE="'), /Lệnh trước/)
    assert.equal(calls.length, 1); assert.equal(selfPhoneService.pending().key, held.key)
    timeout = false; await selfPhoneService.save(held.phoneNumber, held.etag, true)
    assert.deepEqual(calls[0], calls[1]); assert.equal(selfPhoneService.pending(), null)
  })
  await test('self phone validation and missing ETag never PATCH; definite conflicts never auto retry', async () => {
    let calls = 0
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../client': { apiClient: {
      patch: async () => { calls++; throw failure(412, 'auth_concurrency_conflict') },
      get: async () => ({ data: { phoneNumber: null, phoneNumberConfirmed: false, version: 'AAAAAAAAAAE=' }, headers: {} })
    } } })
    await assert.rejects(selfPhoneService.save('123', '"AAAAAAAAAAE="')); await assert.rejects(selfPhoneService.save('+84901234567', '')); assert.equal(calls, 0)
    await assert.rejects(selfPhoneService.read(), /ETag/)
    await assert.rejects(selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="'), e => e.response.status === 412)
    assert.equal(calls, 1); assert.equal(selfPhoneService.pending(), null)
  })
  await test('self phone cookie bootstrap supplies CSRF; session switch fences reads and writes after async bootstrap', async () => {
    let state = { user: { id: 'pm', role: roles.PROJECT_MANAGER }, token: null, isAuthenticated: true }; let listener
    const store = { getState: () => state, subscribe: fn => { listener = fn } }
    let finish; let calls = 0
    state.ensureCsrfToken = () => new Promise(resolve => { finish = resolve })
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../../store/authStore': { useAuthStore: store }, '../client': { apiClient: { patch: async (_, __, config) => { calls++; assert.equal(config.headers['X-CSRF-TOKEN'], 'csrf'); return { status: 204 } } } } })
    const save = selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="'); finish('csrf'); await save; assert.equal(calls, 1)
    const old = selfPhoneService.save('+84901234568', '"AAAAAAAAAAI="')
    const previous = state; state = { ...state, user: { id: 'sup', role: roles.SUPERVISOR } }; listener(state, previous); finish('csrf')
    await assert.rejects(old, /Phiên tài khoản/); assert.equal(calls, 1); assert.equal(selfPhoneService.pending(), null)
  })
  await test('self phone stale read from another account is rejected; current in-flight command blocks duplicate', async () => {
    let state = { user: { id: 'pm', role: roles.PROJECT_MANAGER }, token: 'one', isAuthenticated: true }; let notify; let finish
    const store = { getState: () => state, subscribe: fn => { notify = fn } }
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../../store/authStore': { useAuthStore: store }, '../client': { apiClient: {
      get: () => new Promise(resolve => { finish = resolve }), patch: () => new Promise(resolve => { finish = resolve })
    } } })
    const read = selfPhoneService.read(); const old = state; state = { ...state, user: { id: 'sup', role: roles.SUPERVISOR } }; notify(state, old)
    finish({ data: { phoneNumber: null, phoneNumberConfirmed: false, version: 'AAAAAAAAAAE=' }, headers: { etag: '"AAAAAAAAAAE="' } })
    await assert.rejects(read, /Phiên tài khoản/)
    const write = selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="')
    await assert.rejects(selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="', true), /Lệnh trước/)
    finish({ status: 204 }); await write
  })
  await test('self phone dispatch guard blocks retry under a different account before network write', async () => {
    let state = { user: { id: 'pm', role: roles.PROJECT_MANAGER }, token: 'one', isAuthenticated: true }; let notify; let dispatch
    const store = { getState: () => state, subscribe: fn => { notify = fn } }
    const { selfPhoneService } = load('src/api/services/profileService.ts', { '../../store/authStore': { useAuthStore: store }, '../client': { apiClient: {
      patch: async (_, body, config) => { dispatch = config.transformRequest[0]; assert.equal(dispatch(body), JSON.stringify(body)); throw failure(401, 'auth_unauthorized') }
    } } })
    await assert.rejects(selfPhoneService.save('+84901234567', '"AAAAAAAAAAE="'))
    const old = state; state = { ...state, user: { id: 'sup', role: roles.SUPERVISOR }, token: 'two' }; notify(state, old)
    assert.throws(() => dispatch('{"phoneNumber":"+84901234567"}'), /Phiên tài khoản/)
  })
  function webAuthHarness(overrides = {}) {
    const calls = { session: 0, renew: 0, logout: 0 }
    const session = { user: { id: 'pm', role: 'PM', displayName: 'PM' }, mustChangePassword: false }
    const api = {
      fetchCsrfToken: async () => ({ requestToken: 'csrf', headerName: 'X-CSRF-TOKEN' }),
      loginApi: async () => session,
      logoutApi: async () => { calls.logout++ },
      getSessionApi: async () => { calls.session++; return session },
      renewSessionApi: async () => { calls.renew++; return session },
      ...overrides
    }
    const { useAuthStore: store } = load('src/store/authStore.ts', { '../api/auth': api })
    return { store, api, calls, session }
  }
  await test('Web login/session mapping rejects unknown roles and preserves force-change; no Bearer', async () => {
    const h = webAuthHarness()
    await h.store.getState().loginWithCredentials('pm@test', 'password')
    assert.equal(h.store.getState().token, null); assert.equal(h.store.getState().user.role, roles.PROJECT_MANAGER)
    h.store.getState().setSession({ ...h.session, mustChangePassword: true })
    assert.equal(h.store.getState().user.must_change_password, true)
    assert.throws(() => h.store.getState().setSession({ ...h.session, user: { ...h.session.user, role: 'UNKNOWN' } }), /vai trò/)
  })
  await test('Web concurrent recovery is single-flight and failed renew settles without recursion', async () => {
    const h = webAuthHarness({ getSessionApi: async () => { throw failure(401, 'expired') } })
    h.store.getState().setSession(h.session)
    await Promise.all([h.store.getState().recoverSession(), h.store.getState().recoverSession(), h.store.getState().recoverSession()])
    assert.equal(h.calls.renew, 1)
    h.api.renewSessionApi = async () => { throw failure(401, 'revoked') }
    // A fresh harness closes over a definitive failed renew.
    const bad = webAuthHarness({ getSessionApi: async () => { throw failure(401, 'expired') }, renewSessionApi: async () => { throw failure(401, 'revoked') } })
    bad.store.getState().setSession(bad.session)
    await assert.rejects(bad.store.getState().recoverSession())
    assert.equal(bad.store.getState().status, 'anonymous')
  })
  await test('Web network failure keeps identity; logout failure locks local state and reports revoke gap', async () => {
    const h = webAuthHarness({ getSessionApi: async () => { throw new Error('Network Error') }, logoutApi: async () => { throw new Error('Network Error') } })
    h.store.getState().setSession(h.session)
    await assert.rejects(h.store.getState().recoverSession())
    assert.equal(h.store.getState().isAuthenticated, true)
    await h.store.getState().logout()
    assert.equal(h.store.getState().isAuthenticated, false); assert.ok(h.store.getState().authError.includes('chưa xác nhận thu hồi'))
  })
  await test('Web logout fences late bootstrap/renew response and serializes cookie mutations', async () => {
    let finish; let renewStarted
    const started = new Promise(resolve => { renewStarted = resolve })
    const h = webAuthHarness({ getSessionApi: async () => { throw failure(401, 'expired') }, renewSessionApi: () => { renewStarted(); return new Promise(resolve => { finish = resolve }) } })
    h.store.getState().setSession(h.session)
    const recovering = h.store.getState().recoverSession(); await started
    const logout = h.store.getState().logout()
    finish(h.session)
    await assert.rejects(recovering, /Phiên đã thay đổi/); await logout
    assert.equal(h.store.getState().isAuthenticated, false); assert.equal(h.calls.logout, 1)
  })
  await test('Web HTTP client never sends Bearer; reads retry once; mutations never auto replay', async () => {
    const axios = require('axios'); let recoveries = 0
    const state = { authEpoch: 1, isAuthenticated: true, status: 'authenticated', token: 'must-not-send', csrfToken: 'csrf', ensureCsrfToken: async () => 'csrf', recoverSession: async () => { recoveries++ } }
    const { apiClient: client } = load('src/api/client.ts', { '../store/authStore': { useAuthStore: { getState: () => state } } })
    let attempts = 0
    client.defaults.adapter = async config => {
      attempts++; assert.equal(config.headers.get('Authorization'), undefined)
      if (attempts === 1) throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {}, headers: {}, config })
      return { status: 200, data: {}, headers: {}, config }
    }
    await client.get('/projects'); assert.equal(attempts, 2); assert.equal(recoveries, 1)
    attempts = 0
    await assert.rejects(client.patch('/me/phone-number', { phoneNumber: '+84901234567' }, { headers: { 'Idempotency-Key': 'same', 'If-Match': '"AAAAAAAAAAE="' } }))
    assert.equal(attempts, 1)
    attempts = 0
    await assert.rejects(client.post('/auth/web/renew'))
    assert.equal(attempts, 1)
  })
  await test('Web HTTP client discards old actor responses and keeps 403/network outcomes intact', async () => {
    const axios = require('axios'); let recoveries = 0
    const state = { authEpoch: 1, isAuthenticated: true, status: 'authenticated', recoverSession: async () => { recoveries++ } }
    const { apiClient: client } = load('src/api/client.ts', { '../store/authStore': { useAuthStore: { getState: () => state } } })
    client.defaults.adapter = async config => { state.authEpoch++; return { status: 200, data: { oldActor: true }, headers: {}, config } }
    await assert.rejects(client.get('/profile'), axios.isCancel)
    client.defaults.adapter = async config => { throw new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, null, { status: 403, data: {}, headers: {}, config }) }
    await assert.rejects(client.get('/users'), error => error.response.status === 403)
    client.defaults.adapter = async config => { throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config) }
    await assert.rejects(client.get('/projects'), /Network/); assert.equal(recoveries, 0)
  })
  function geometryParser() {
    return load('src/pages/(pm)/alignment/alignmentImportHelpers.ts', { './data': {}, './alignmentGeometryHelpers': {} })
  }
  await test('GeoJSON selects explicit Centerline even after polygon/edges and never infers branch topology', async () => {
    const features = [
      { properties: { type: 'RoadSurface', roadWidth: 7 }, geometry: { type: 'Polygon', coordinates: [] } },
      { properties: { type: 'RoadEdge', layer: 'MEP_TRAI' }, geometry: { type: 'LineString', coordinates: [[1,1],[2,2]] } },
      { properties: { type: 'Centerline', layer: 'TIM_TUYEN_CHINH', name: 'nhánh', totalLength: 700.73 }, geometry: { type: 'LineString', coordinates: [[107.736642,11.474766],[107.737,11.4747],[107.738,11.474]] } }
    ]
    const review = geometryParser().inspectGeoJsonCenterline(JSON.stringify({ type: 'FeatureCollection', features }))
    assert.equal(review.coords.length,3); assert.equal(review.ignoredFeatureCount,2)
    assert.equal(review.roadWidthHintMeters,7); assert.equal(review.declaredLengthMeters,700.73)
    assert.notEqual(review.estimatedLengthMeters,review.declaredLengthMeters)
    assert.equal(review.coords[0][0],107.736642); assert.equal(review.routeKind,undefined)
  })
  await test('GeoJSON rejects ambiguous lines, polygon centerline, swapped/invalid coordinates and explicit unsupported CRS', async () => {
    const p=geometryParser()
    const line=coordinates=>({ type:'Feature', properties:{}, geometry:{type:'LineString',coordinates} })
    assert.throws(()=>p.parseGeoJsonText(JSON.stringify({type:'FeatureCollection',features:[line([[1,1],[2,2]]),line([[3,3],[4,4]])]})),/đúng một/)
    assert.throws(()=>p.parseGeoJsonText(JSON.stringify({type:'Feature',properties:{type:'Centerline'},geometry:{type:'Polygon',coordinates:[]}})),/LineString/)
    assert.throws(()=>p.parseGeoJsonText(JSON.stringify(line([[11,107],[12,108]]))),/longitude/)
    assert.throws(()=>p.parseGeoJsonText(JSON.stringify(line([['107',11],[108,12]]))),/longitude/)
    assert.throws(()=>p.parseGeoJsonText(JSON.stringify({type:'LineString',coordinates:[[1,1],[2,2]],crs:{name:'EPSG:32648'}})),/CRS/)
  })
  await test('GeoJSON preserves duplicate vertices and reports crossings without smoothing or claiming server readiness', async () => {
    const p=geometryParser()
    const duplicate=p.inspectGeoJsonCenterline(JSON.stringify({type:'LineString',coordinates:[[1,1],[1,1],[2,2]]}))
    assert.equal(duplicate.adjacentDuplicates,1);assert.equal(duplicate.coords.length,3)
    const crossing=p.inspectGeoJsonCenterline(JSON.stringify({type:'LineString',coordinates:[[1,1],[2,2],[1,2],[2,1]]}))
    assert.equal(crossing.selfIntersections,1);assert.equal(crossing.ready,undefined)
    assert.equal(crossing.stationOriginMeters,undefined);assert.equal(crossing.segments,undefined)
  })
  await test('geometry readers pass exact project/draft/version references and surface missing cookie/readiness errors', async () => {
    const calls=[]
    const {alignmentService:service}=load('src/api/services/alignmentService.ts', {'../client':{apiClient:{get:async url=>{calls.push(url);if(url.endsWith('/work-package'))throw failure(401,'auth_unauthorized');return response({ready:false,missingFields:['nativeAlignment']})}}}})
    await assert.rejects(service.readProjectContext('p'),error=>error.response.status===401)
    const readiness=await service.readDraftReadiness('p','draft');assert.equal(readiness.ready,false)
    await service.readConfirmedGeometry('p','road','version')
    assert.deepEqual(calls,['/projects/p/work-package','/projects/p/road-geometry-drafts/draft/readiness','/projects/p/road-sections/road/versions/version/geometry'])
  })
  function geometryWorkflowHarness(projectGet, readGeometry, options = {}) {
    const React = require('react'); const values=[]; const effects=[]; let slot=0; let view; let mounted=true; let lateWrites=0
    const roads=[{roadSectionId:'a',currentVersionId:'va',code:'A',versionNo:1},{roadSectionId:'b',currentVersionId:'vb',code:'B',versionNo:2}]
    const query=new URLSearchParams(options.projectId === '' ? '' : 'projectId=p');if(options.draftId)query.set('draftId',options.draftId)
    const hooks={
      ...React,
      useState(initial) { const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i],next=>{if(!mounted)lateWrites++;values[i]=typeof next==='function'?next(values[i]):next}] },
      useRef(initial) { const i=slot++;if(!(i in values))values[i]={current:initial};return values[i] },
      useEffect(setup,deps) { const i=slot++;const old=effects[i];if(!old||deps.some((d,j)=>!Object.is(d,old.deps[j])))effects[i]={deps,setup,cleanup:old?.cleanup,pending:true} }
    }
    const service={readProjectContext:async()=>({projectId:'p',engineeringUtmSrid:32648,roadSections:roads}),fetchCrsProfiles:async()=>[],readConfirmedGeometry:readGeometry,getGeometryDraft:async()=>({data:{id:'draft',status:'DRAFT',version:'v'},etag:'"v"'}),readDraftReadiness:async()=>options.readiness}
    const {AlignmentGeometryWorkflow:Component}=load('src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx',{
      react:{__esModule:true,default:hooks,...hooks},'react-router-dom':{useParams:()=>({}),useSearchParams:()=>[query,()=>{}]},
      '../../../api/client':{apiClient:{get:projectGet}},'../../../api/services/alignmentService':{alignmentService:service},
      '../../../store/authStore':{useAuthStore:selector=>selector({user:{id:'pm',role:options.role || roles.PROJECT_MANAGER}})},'./alignmentImportHelpers':{inspectGeoJsonCenterline:()=>({})}
    })
    const render=()=>{slot=0;view=Component();for(const effect of effects)if(effect?.pending){effect.pending=false;effect.cleanup?.();effect.cleanup=effect.setup()}return view}
    const flush=async()=>{for(let i=0;i<12;i++){await Promise.resolve();render()}return view}
    const nodes=()=>{const all=[];const visit=x=>{if(!x||typeof x!=='object')return;if(Array.isArray(x)){x.forEach(visit);return}all.push(x);visit(x.props?.children)};visit(view);return all}
    const textOf=x=>typeof x==='string'||typeof x==='number'?String(x):Array.isArray(x)?x.map(textOf).join(''):x?.props?textOf(x.props.children):''
    const select=road=>{nodes().find(n=>n.props?.['aria-label']==='Road geometry').props.onChange({target:{value:road}});render()}
    const click=label=>{const node=nodes().find(n=>n.type==='button'&&textOf(n)===label);assert.ok(node,label);return node.props.onClick()}
    render()
    return {flush,render,select,click,nodes,text:()=>textOf(view),unmount:()=>{mounted=false;effects.forEach(e=>e?.cleanup?.())},lateWrites:()=>lateWrites}
  }
  const projectPage=()=>response({items:[{projectId:'p',projectCode:'TEST',name:'Project'}]})
  const geometryFact=(road,version)=>({projectId:'p',roadSectionId:road,routeVersionId:version,versionNo:1,lengthMeters:100,isCurrent:true})
  await test('geometry A then B: late A success/error/finally cannot alter B data or loading', async()=>{
    const calls=[];const h=geometryWorkflowHarness(async()=>projectPage(),(...args)=>new Promise((resolve,reject)=>calls.push({args,resolve,reject})))
    await h.flush();h.select('a');const a=h.click('Đọc geometry confirmed');h.select('b');const b=h.click('Đọc geometry confirmed')
    calls[0].resolve(geometryFact('a','va'));await a;await h.flush()
    assert.ok(!h.text().includes('Geometry máy chủ: va'));assert.ok(h.text().includes('Đang đọc geometry đã chọn'))
    calls[1].resolve(geometryFact('b','vb'));await b;await h.flush();assert.ok(h.text().includes('Geometry máy chủ: vb'))
    h.select('a');const old=h.click('Đọc geometry confirmed');h.select('b');calls[2].reject(new Error('OLD ROAD FAILURE'));await old;await h.flush();assert.ok(!h.text().includes('OLD ROAD FAILURE'))
    h.unmount()
  })
  await test('geometry A->B->A and same-selection repeated reads accept only the latest attempt', async()=>{
    const calls=[];const h=geometryWorkflowHarness(async()=>projectPage(),(...args)=>new Promise(resolve=>calls.push({args,resolve})))
    await h.flush();h.select('a');const first=h.click('Đọc geometry confirmed');h.select('b');h.select('a');const latest=h.click('Đọc geometry confirmed')
    calls[1].resolve({...geometryFact('a','va'),lengthMeters:222});await latest;await h.flush()
    calls[0].resolve({...geometryFact('a','va'),lengthMeters:111});await first;await h.flush()
    assert.ok(h.text().includes('lengthMeters=222'));assert.ok(!h.text().includes('lengthMeters=111'))
    const r1=h.click('Đọc geometry confirmed'),r2=h.click('Đọc geometry confirmed');calls[3].resolve({...geometryFact('a','va'),lengthMeters:444});await r2;calls[2].resolve({...geometryFact('a','va'),lengthMeters:333});await r1;await h.flush();assert.ok(h.text().includes('lengthMeters=444'))
    h.unmount()
  })
  await test('geometry wrong project/version is rejected and unmount fences late error/loading writes', async()=>{
    const calls=[];const h=geometryWorkflowHarness(async()=>projectPage(),(...args)=>new Promise((resolve,reject)=>calls.push({args,resolve,reject})))
    await h.flush();h.select('a');const wrong=h.click('Đọc geometry confirmed');calls[0].resolve(geometryFact('b','vb'));await wrong;await h.flush();assert.ok(h.text().includes('sai project/road/version'));assert.ok(!h.text().includes('Geometry máy chủ: vb'))
    const late=h.click('Đọc geometry confirmed');h.unmount();calls[1].reject(new Error('after unmount'));await late;assert.equal(h.lateWrites(),0)
  })
  await test('project list failure retries the real paginated reader, preserves selection and does not choose first', async()=>{
    let mode='fail';const cursors=[];let finish
    const h=geometryWorkflowHarness(async(_,config)=>{cursors.push(config.params.cursor);if(mode==='fail')throw new Error('PROJECT SOURCE FAILED');if(mode==='pending')return new Promise(resolve=>finish=resolve);return response({items:config.params.cursor?[{projectId:'q',name:'Q'}]:[{projectId:'p',name:'P'}],nextCursor:config.params.cursor?null:'next'})},async()=>geometryFact('a','va'))
    await h.flush();assert.ok(h.text().includes('Tải danh sách dự án thất bại'));assert.ok(!h.text().includes('không thuộc danh mục'))
    h.click('Tải lại từ máy chủ');await h.flush();assert.ok(h.text().includes('PROJECT SOURCE FAILED'));assert.ok(cursors.length>=2)
    mode='success';h.click('Tải lại từ máy chủ');await h.flush();assert.ok(!h.text().includes('PROJECT SOURCE FAILED'));assert.deepEqual(cursors.slice(-2),[undefined,'next'])
    const select=h.nodes().find(n=>n.props?.['aria-label']==='Dự án geometry');assert.equal(select.props.value,'p')
    mode='fail';h.click('Tải lại từ máy chủ');await h.flush();assert.ok(h.text().includes('PROJECT SOURCE FAILED'));assert.equal(h.nodes().find(n=>n.props?.['aria-label']==='Dự án geometry').props.value,'p');assert.ok(!h.text().includes('Không có dự án trong phạm vi'))
    mode='pending';h.click('Tải lại từ máy chủ');await h.flush();assert.ok(h.text().includes('Đang tải danh sách dự án'));finish(response({items:[]}));await h.flush();assert.ok(h.text().includes('Không có dự án trong phạm vi'));assert.ok(h.text().includes('Dự án không thuộc danh mục API'))
    assert.equal(h.nodes().find(n=>n.props?.['aria-label']==='Dự án geometry').props.value,'p');h.unmount()
  })
  await test('project repeated cursor is an error, never partial ready; write blockers name missing handler and permission', async()=>{
    const h=geometryWorkflowHarness(async()=>response({items:[{projectId:'p',name:'P'}],nextCursor:'repeat'}),async()=>geometryFact('a','va'))
    await h.flush();assert.ok(h.text().includes('Cursor dự án bị lặp'));assert.ok(!h.text().includes('Không có dự án trong phạm vi'))
    assert.ok(h.text().includes('Chưa tích hợp handler lưu/sửa draft'));assert.ok(h.text().includes('Chỉ Giám sát được xác nhận'))
    for(const label of ['Lưu draft','Xác nhận'])assert.equal(h.nodes().find(n=>n.type==='button'&&n.props.children===label).props.disabled,true)
    h.unmount()
  })
  await test('ready Supervisor still sees the unintegrated confirm handler, without false missing-readiness or wrong-role reasons', async()=>{
    const h=geometryWorkflowHarness(async()=>projectPage(),async()=>geometryFact('a','va'),{role:roles.SUPERVISOR,draftId:'draft',readiness:{ready:true,missingFields:[],errors:[],warnings:[],sampleOnly:false}})
    await h.flush();assert.ok(h.text().includes('Chưa tích hợp handler confirm'));assert.ok(!h.text().includes('Readiness chưa đạt'));assert.ok(!h.text().includes('Chỉ Giám sát được xác nhận'))
    assert.equal(h.nodes().find(n=>n.type==='button'&&n.props.children==='Xác nhận').props.disabled,true);h.unmount()
  })
  await test('project list success with no selection never silently selects the first project', async()=>{
    const h=geometryWorkflowHarness(async()=>projectPage(),async()=>geometryFact('a','va'),{projectId:''})
    await h.flush();assert.equal(h.nodes().find(n=>n.props?.['aria-label']==='Dự án geometry').props.value,'');assert.ok(h.text().includes('Chưa chọn dự án.'));h.unmount()
  })
  const createInput={code:'TEST-NEW',name:'Test project',primaryPmId:'pm',handoverDate:'2026-11-04',warrantyEndDate:'2027-11-04',handoverFileIds:[]}
  const createMocks=client=>({'../client':{apiClient:client},'./userDirectory':{userDirectory:{findUser:()=>undefined,getAllUsers:()=>[]}}})
  await test('project timeout holds body/key, blocks new intent, deliberate replay returns201 then reads server', async()=>{
    const posts=[];let fail=true
    const {projectService:service}=load('src/api/services/projectService.ts',createMocks({post:async(url,body,config)=>{posts.push(json({body,headers:config.headers}));if(fail)throw new Error('timeout');return {status:201,data:{projectId:'new'}}},get:async()=>response({items:[{projectId:'new',projectCode:'TEST-NEW',name:'Server name',status:'ACTIVE'}]})}))
    await assert.rejects(service.createProject(createInput),/timeout/);assert.ok(service.pendingProjectCreate())
    await assert.rejects(service.createProject({...createInput,name:'Different'}),/chưa rõ kết quả/);assert.equal(posts.length,1)
    fail=false;const result=await service.createProject(createInput,true);assert.equal(result.name,'Server name');assert.deepEqual(posts[0],posts[1]);assert.equal(service.pendingProjectCreate(),null)
  })
  await test('project201 with failed readback keeps receipt and never POSTs again when reconciled', async()=>{
    let posts=0,reads=0
    const {projectService:service}=load('src/api/services/projectService.ts',createMocks({post:async()=>{posts++;return {status:201,data:{id:'new'}}},get:async()=>{reads++;if(reads===1)throw failure(503,'dependency_unavailable');return response({items:[{projectId:'new',projectCode:'TEST-NEW',name:'Server',status:'ACTIVE'}]})}}))
    await assert.rejects(service.createProject(createInput));assert.equal(service.pendingProjectCreate().hasReceipt,true);await service.createProject(createInput,true);assert.equal(posts,1)
  })
  await test('project create blocks duplicate in-flight, rejects filename attachments and distinguishes CSRF/code conflict', async()=>{
    let finish
    const {projectService:service}=load('src/api/services/projectService.ts',createMocks({post:()=>new Promise(resolve=>finish=resolve),get:async()=>response({items:[{projectId:'new',projectCode:'TEST-NEW',name:'Server',status:'ACTIVE'}]})}))
    await assert.rejects(service.createProject({...createInput,handoverFileIds:['name.pdf']}),/upload/)
    const first=service.createProject(createInput);await assert.rejects(service.createProject(createInput,true),/chưa rõ kết quả/);finish({status:201,data:{id:'new'}});await first
    for(const code of ['csrf_failed','project_code_conflict']){
      const {projectService:s}=load('src/api/services/projectService.ts',createMocks({post:async()=>{throw failure(code==='csrf_failed'?403:409,code)}}))
      await assert.rejects(s.createProject(createInput),e=>e.code===code&&(code==='csrf_failed'?e.message.includes('CSRF'):e.message.includes('đã tồn tại')));assert.equal(s.pendingProjectCreate(),null)
    }
  })
  await test('Case reports paginate with fixed limit/opaque cursor; wrong Case, repeated cursor and errors never become empty', async()=>{
    const calls=[]
    const {caseReportService:s}=load('src/api/services/caseReportService.ts',{'../client':{apiClient:{get:async(url,cfg)=>{calls.push(json(cfg.params));return response({items:[{caseId:'c',reportId:cfg.params.cursor?'r2':'r1'}],nextCursor:cfg.params.cursor?null:'opaque+/='})}}}})
    assert.equal((await s.read('c')).length,2);assert.deepEqual(calls,[{limit:20},{limit:20,cursor:'opaque+/='}])
    const repeat=load('src/api/services/caseReportService.ts',{'../client':{apiClient:{get:async()=>response({items:[],nextCursor:'repeat'})}}}).caseReportService
    await assert.rejects(repeat.read('c'),/Cursor/)
    const wrong=load('src/api/services/caseReportService.ts',{'../client':{apiClient:{get:async()=>response({items:[{caseId:'other',reportId:'r'}]})}}}).caseReportService
    await assert.rejects(wrong.read('c'),/sai Case/)
    const denied=load('src/api/services/caseReportService.ts',{'../client':{apiClient:{get:async()=>{throw failure(403,'access_forbidden')}}}}).caseReportService
    await assert.rejects(denied.read('c'),e=>e.response.status===403)
  })
  await test('Case evidence content uses configured API origin once, rejects another origin/report and preserves Blob ProblemDetails', async()=>{
    const evidence={evidenceId:'e',contentPath:'/api/v1/cases/c/reports/r/evidence/e/content'}
    const client={defaults:{baseURL:'https://api.example.test/api/v1'},get:async()=>{throw {response:{status:412,data:new Blob([JSON.stringify({code:'concurrency_conflict'})],{type:'application/problem+json'})}}}}
    const {caseReportService:s}=load('src/api/services/caseReportService.ts',{'../client':{apiClient:client},__window:{location:{origin:'https://fe.example.test'}}})
    assert.equal(s.contentUrl('c','r',evidence),'https://api.example.test/api/v1/cases/c/reports/r/evidence/e/content')
    assert.throws(()=>s.contentUrl('c','other',evidence),/Đường ảnh/)
    assert.throws(()=>s.contentUrl('c','r',{...evidence,contentPath:'https://evil.test'+evidence.contentPath}),/Đường ảnh/)
    await assert.rejects(s.image('c','r',evidence),e=>e.response.status===412&&e.response.data.code==='concurrency_conflict')
    client.defaults.baseURL='/api/v1';assert.equal(s.contentUrl('c','r',evidence),'https://fe.example.test'+evidence.contentPath)
  })
  await test('per-evidence GPS keeps UNKNOWN/null and permits a sourced zero coordinate pair without borrowing Case GPS', async()=>{
    const React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
    const {ReportEvidence}=load('src/pages/(pm)/ai-review/CaseReportsPanel.tsx',{react:{__esModule:true,default:React,...React},'../../../api/services/caseReportService':{caseReportService:{}}})
    const render=evidence=>renderToStaticMarkup(React.createElement(ReportEvidence,{caseId:'c',reportId:'r',evidence:{evidenceId:'e',capturedAt:null,fileVersion:'v',...evidence}}))
    assert.ok(render({locationSource:'UNKNOWN',location:null}).includes('GPS: Chưa có thông tin'))
    assert.ok(!render({locationSource:'CAPTURE',location:{latitude:0,longitude:null}}).includes('Xem vị trí evidence'))
    assert.ok(render({locationSource:'CAPTURE',location:{latitude:0,longitude:0,accuracyMeters:0}}).includes('Xem vị trí evidence'))
  })
  await test('Case report loader isolates each Report/supplement and fences old Case/session responses', async()=>{
    const React=require('react');const values=[],effects=[],calls=[],splits=[];let slot=0,caseId='a',epoch=0,view
    const hooks={...React,useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useEffect(setup,deps){const i=slot++;const old=effects[i];if(!old||deps.some((d,j)=>!Object.is(d,old.deps[j])))effects[i]={deps,setup,cleanup:old?.cleanup,pending:true}}}
    const {CaseReportsPanel}=load('src/pages/(pm)/ai-review/CaseReportsPanel.tsx',{react:{__esModule:true,default:hooks,...hooks},'../../../store/authStore':{useAuthStore:selector=>selector({authEpoch:epoch,user:{role:roles.PROJECT_MANAGER}})},'../../../api/services/caseReportService':{caseReportService:{read:(id,signal)=>new Promise((resolve,reject)=>calls.push({id,signal,resolve,reject}))}}})
    const render=()=>{slot=0;view=CaseReportsPanel({caseId,onSplit:async reportId=>splits.push(reportId)});for(const e of effects)if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}}
    const flush=async()=>{for(let i=0;i<8;i++){await Promise.resolve();render()}}
    const text=x=>typeof x==='string'?x:Array.isArray(x)?x.map(text).join(''):x?.props?text(x.props.children):''
    const row=(reportId,description)=>({caseId,reportId,reporterDisplayName:reportId,reporterPhoneNumber:null,reporterPhoneNumberConfirmed:false,description,receivedAt:'2026-11-04T00:00:00Z',originalEvidence:[],supplements:[]})
    render();caseId='b';render();assert.equal(calls[0].signal.aborted,true)
    calls[1].resolve([row('report-b1','B original'),{...row('report-b2','B2 original'),supplements:[{id:'s2',description:'B2 supplement',receivedAt:'2026-11-04T01:00:00Z',evidence:[]}]}]);await flush();assert.ok(text(view).includes('B2 supplement'));assert.ok(text(view).includes('Chưa có thông tin'))
    calls[0].resolve([row('old-a','OLD CASE DATA')]);await flush();assert.ok(!text(view).includes('OLD CASE DATA'))
    const nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)]
    const article=nodes(view).find(x=>x.props?.['data-report-id']==='report-b2')
    nodes(article).find(x=>x.type==='button'&&x.props.children==='Tách Report này').props.onClick();render()
    await nodes(view).find(x=>x.type==='button'&&x.props.children==='Xác nhận tách Report').props.onClick();await flush()
    assert.deepEqual(splits,['report-b2']);assert.equal(calls[2].id,'b')
    calls[2].resolve([row('report-b1','B original after server reload')]);await flush()
    assert.ok(!text(view).includes('B2 supplement'));assert.ok(!text(view).includes('Tách Report này'))
    epoch++;render();assert.equal(calls[2].signal.aborted,true);assert.ok(!text(view).includes('B2 supplement'));calls[3].reject(failure(403,'access_forbidden'));await flush();assert.ok(text(view).includes('403 access_forbidden'));assert.ok(!text(view).includes('Không có Report'))
    effects.forEach(e=>e?.cleanup?.())
  })
  await test('project reload restores the same actor command key/body without storing credentials or replaying under another actor', async()=>{
    const journal=new Map();const storage={getItem:key=>journal.get(key)||null,setItem:(key,value)=>journal.set(key,value),removeItem:key=>journal.delete(key)};let firstKey
    const first=load('src/api/services/projectService.ts',{...createMocks({post:async(_,__,config)=>{firstKey=config.headers['Idempotency-Key'];throw new Error('timeout')}}),__sessionStorage:storage}).projectService
    await assert.rejects(first.createProject(createInput));assert.equal(journal.size,1)
    assert.ok(![...journal.values()][0].includes('test-token'))
    const other=load('src/api/services/projectService.ts',{...createMocks({}),__sessionStorage:storage,'../../store/authStore':{useAuthStore:{getState:()=>({user:{id:'other'},authEpoch:2}),subscribe:()=>()=>{}}}}).projectService
    assert.equal(other.pendingProjectCreate(),null)
    const second=load('src/api/services/projectService.ts',{...createMocks({post:async(_,body,config)=>{assert.equal(config.headers['Idempotency-Key'],firstKey);assert.equal(body.code,createInput.code);return {status:201,data:{id:'new'}}},get:async()=>response({items:[{projectId:'new',projectCode:'TEST-NEW',name:'Server',status:'ACTIVE'}]})}),__sessionStorage:storage}).projectService
    assert.ok(second.pendingProjectCreate());await second.createProject(createInput,true);assert.equal(journal.size,0)
  })
  await test('project recovery bypasses PM inventory only for held commands; new create still needs an active listed PM', async()=>{
    const React=require('react')
    const {CreateProjectModal}=load('src/pages/(pm)/projects/CreateProjectModal.tsx',{react:{__esModule:true,default:React,...React,useMemo:fn=>fn()},'../../../components/ui/Icon':{Icon:()=>null}})
    const props={isOpen:true,onClose(){},projectName:'Held',projectCode:'HELD',projectRegion:'',projectPM:'old-pm',pmOptions:[],startDate:'2026-11-05',endDate:'2027-11-05',onSubmit(){}}
    const nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)]
    const text=x=>typeof x==='string'?x:Array.isArray(x)?x.map(text).join(''):x?.props?text(x.props.children):''
    for(const receivedCreate of [false,true]){
      const view=CreateProjectModal({...props,pendingCreate:true,receivedCreate,errorMessage:'PM API unavailable'})
      const button=nodes(view).find(x=>x.type==='button'&&x.props.type==='submit');assert.equal(button.props.disabled,false)
      assert.ok(text(view).includes(receivedCreate?'Đọc lại kết quả':'Gửi lại đúng yêu cầu'))
      assert.ok(nodes(view).some(x=>x.type==='option'&&x.props.value==='old-pm'))
    }
    const view=CreateProjectModal({...props,pendingCreate:false});assert.equal(nodes(view).find(x=>x.type==='button'&&x.props.type==='submit').props.disabled,true)
  })
  await test('split uses exact Report ID and GET ETag; single-report/foreign-report and412 never POST twice', async()=>{
    const sent=[];const service=triage({get:async()=>({data:detail({reportIds:['r1','r2']}),headers:{etag:'"AAAAAAAAAAI="'}}),post:async(url,body,config)=>{sent.push({url,body,config});throw failure(412,'concurrency_conflict')}})
    await assert.rejects(service.splitReport('master','r2'),e=>e.response.status===412)
    assert.equal(sent.length,1);assert.deepEqual(json(sent[0].body.reportIds),['r2']);assert.equal(sent[0].config.headers['If-Match'],'"AAAAAAAAAAI="');assert.ok(sent[0].config.headers['Idempotency-Key'])
    for(const reportIds of [['r1'],['other','r3']]){
      const blocked=triage({get:async()=>response(detail({reportIds})),post:async()=>assert.fail('must not POST')})
      await assert.rejects(blocked.splitReport('master','r1'))
    }
  })
  await test('Report split action refreshes Case and list from server without changing selected Case or inventing local links', async()=>{
    const calls=[];let cases
    const hooks={...require('react'),useState:value=>[value,()=>{}]}
    const {useAIReviewLinkActions}=load('src/pages/(pm)/ai-review/useAIReviewLinkActions.ts',{react:{__esModule:true,default:hooks,...hooks},'../../../data/mockData':{mockProjects:[]},'../../../api/services/projectService':{projectService:{}},'../../../api/services/triageService':{getCaseSessionKey:()=> 'session',triageService:{splitReport:async(c,r)=>calls.push(['split',c,r]),getCaseById:async c=>{calls.push(['case',c]);return {id:c}},getCases:async()=>{calls.push(['list']);return [{id:'master',report_ids:['r1']},{id:'new',report_ids:['r2']}]}}}})
    const action=useAIReviewLinkActions({cases:[],setCases:value=>cases=value,selectedCaseId:'master',setSelectedCaseId:()=>assert.fail('do not change selection'),setExpandedMasterIds(){},showToast:()=>assert.fail('no fake success'),filteredCases:[],reloadCases:()=>assert.fail('do not clear current Case')})
    await action.handleUnlinkReport('r2');assert.deepEqual(calls,[['split','master','r2'],['case','master'],['list']]);assert.deepEqual(cases[0].report_ids,['r1']);assert.deepEqual(cases[1].report_ids,['r2'])
  })
  await test('members errors propagate, and pagination preserves current/history scope', async () => {
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    const calls = []
    const { projectService: service } = load('src/api/services/projectService.ts', createMocks({ get: async (_, config) => {
      calls.push(config.params)
      return response(config.params.cursor ? { items: [{ membershipId: 'm2' }] } : { items: [{ membershipId: 'm1' }], nextCursor: 'next' })
    } }))
    assert.deepEqual(json(await service.fetchProjectMembers('p')), [{ membershipId: 'm1' }, { membershipId: 'm2' }])
    assert.equal(calls[1].cursor, 'next')
    assert.equal(calls[0].includeHistory, false)
    const { projectService: failed } = load('src/api/services/projectService.ts', createMocks({ get: async () => { throw failure(503, 'internal_error') } }))
    await assert.rejects(failed.fetchProjectMembers('p'), error => error.response.status === 503)
  })
  await test('member cursor loops and a changed session reject the whole result', async () => {
    const { projectService: loop } = load('src/api/services/projectService.ts', createMocks({ get: async () => response({ items: [], nextCursor: 'same' }) }))
    await assert.rejects(loop.fetchProjectMembers('p'), /Cursor/)
    let epoch = 1
    const { projectService: stale } = load('src/api/services/projectService.ts', {
      ...createMocks({ get: async () => { epoch++; return response({ items: [{ membershipId: 'old' }] }) } }),
      '../../store/authStore': { useAuthStore: { getState: () => ({ user: actor, authEpoch: epoch }), subscribe: () => () => {} } }
    })
    await assert.rejects(stale.fetchProjectMembers('p'), /Phiên/)
  })
  await test('project pages are complete, stat failures stay explicit, and missing IDs never fall back', async () => {
    let calls = 0
    const { projectService: service } = load('src/api/services/projectService.ts', createMocks({ get: async (url, config) => {
      if (url !== '/projects') throw failure(503, 'stats_unavailable')
      calls++
      return response(config.params.cursor ? { items: [{ projectId: 'p2', projectCode: 'P2', name: 'Second' }] }
        : { items: [{ projectId: 'p1', projectCode: 'P1', name: 'First' }], nextCursor: 'next' })
    } }))
    const projects = await service.fetchProjects()
    assert.equal(projects.length, 2); assert.equal(calls, 2)
    assert.ok(projects.every(project => project.stats_error === 'stats_unavailable'))
    assert.equal(await service.fetchProjectById('outside'), undefined)
    const { projectService: failed } = load('src/api/services/projectService.ts', createMocks({ get: async () => { throw failure(500, 'internal_error') } }))
    await assert.rejects(failed.fetchProjectById('p1'), /internal_error/)
  })
  await test('project cursor loop fails instead of presenting an incomplete list', async () => {
    const { projectService: service } = load('src/api/services/projectService.ts', createMocks({ get: async () => response({ items: [], nextCursor: 'same' }) }))
    await assert.rejects(service.fetchProjects(), /Cursor/)
  })
  await test('Web PM reassignment is explicitly blocked before any placeholder version, fresh key or network write', async () => {
    let calls = 0
    const { personnelService: service } = load('src/api/services/personnelService.ts', {
      '../client': { apiClient: { get: async () => { calls++ }, put: async () => { calls++ } } }
    })
    await assert.rejects(service.reassignPrimaryProjectManager('p', { primaryProjectManagerUserId: 'next', effectiveFrom: '2026-11-04', reason: 'test' }), error => error.code === 'web_cookie_unsupported')
    assert.equal(calls, 0)
  })
  await test('personnel project assignments never become unassigned when projects or members fail, and cover more than ten projects', async () => {
    for (const failedScope of ['projects', 'members']) {
      const { personnelService: service } = load('src/api/services/personnelService.ts', {
        '../client': { apiClient: { get: async () => response({ items: [] }) } },
        './projectService': { projectService: {
          fetchProjects: async () => { if (failedScope === 'projects') throw failure(503, 'projects_failed'); return [{ id: 'p' }] },
          fetchProjectMembers: async () => { throw failure(503, 'members_failed') }
        } }
      })
      await assert.rejects(service.fetchUsers(), error => error.response.status === 503)
    }
    let reads = 0
    const { personnelService: service } = load('src/api/services/personnelService.ts', {
      '../client': { apiClient: { get: async () => response({ items: [] }) } },
      './projectService': { projectService: {
        fetchProjects: async () => Array.from({ length: 11 }, (_, id) => ({ id: String(id) })),
        fetchProjectMembers: async () => { reads++; return [] }
      } }
    })
    await service.fetchUsers(); assert.equal(reads, 11)
  })
  await test('create validation, forbidden and server errors preserve their distinct response and uncertain key', async () => {
    for (const [status, code] of [[400, 'validation_error'], [403, 'access_forbidden'], [500, 'internal_error']]) {
      const keys = []
      const { projectService: service } = load('src/api/services/projectService.ts', createMocks({ post: async (_, __, config) => {
        keys.push(config.headers['Idempotency-Key']); throw failure(status, code)
      } }))
      await assert.rejects(service.createProject(createInput), error => error.code === code && error.response.status === status)
      assert.equal(!!service.pendingProjectCreate(), status === 500)
      if (status === 500) {
        await assert.rejects(service.createProject(createInput, true))
        assert.equal(keys[0], keys[1])
      }
    }
  })
  await test('cross-tab invalidation clears identity/epoch and rejects late session responses without rebroadcast loops', async () => {
    let channel, finish
    const messages = []
    const session = { user: { id: 'pm', role: 'PM', displayName: 'PM' }, mustChangePassword: false }
    const { useAuthStore: store } = load('src/store/authStore.ts', {
      __window: {}, __BroadcastChannel: class { constructor() { channel = this } postMessage(value) { messages.push(value) } },
      '../api/auth': { getSessionApi: () => new Promise(resolve => { finish = resolve }) }
    })
    store.getState().setSession(session)
    const epoch = store.getState().authEpoch
    const recovering = store.getState().recoverSession()
    channel.onmessage({ data: 'invalidate' })
    finish(session)
    await assert.rejects(recovering, /Phiên đã thay đổi/)
    assert.equal(store.getState().authEpoch, epoch + 1)
    assert.equal(store.getState().user, null); assert.equal(messages.length, 0)
  })
  await test('password change fences CSRF and server completion across actors, never inventing a changed user', async () => {
    for (const phase of ['csrf', 'write']) {
      let finish, writes = 0
      let state = { user: { id: 'pm' }, authEpoch: 1, isAuthenticated: true }
      const store = { getState: () => ({ ...state, ensureCsrfToken: () => phase === 'csrf' ? new Promise(resolve => { finish = resolve }) : Promise.resolve('csrf') }) }
      const { authService: service } = load('src/api/services/authService.ts', {
        '../../store/authStore': { useAuthStore: store },
        '../auth': { changePasswordApi: async () => { writes++; if (phase === 'write') await new Promise(resolve => { finish = resolve }) }, getSessionApi: async () => { throw new Error('must not read under next actor') } }
      })
      const pending = service.changePassword({ tempPassword: 'old', newPassword: 'new' })
      const rejected = assert.rejects(pending, /Phiên đã thay đổi/)
      while (!finish) await new Promise(resolve => setImmediate(resolve))
      state = { user: { id: 'other' }, authEpoch: 2, isAuthenticated: true }
      finish('csrf'); await rejected
      assert.equal(writes, phase === 'csrf' ? 0 : 1)
    }
  })
  await test('password success requires a fresh server session clearing mustChangePassword; terminal401 expires locally', async () => {
    let state = { user: { id: 'pm' }, authEpoch: 1, isAuthenticated: true }
    let reads = 0, expired = 0
    const store = { getState: () => ({ ...state, ensureCsrfToken: async () => 'csrf', setSession: s => { state.user = s.user }, expireSession: () => { expired++ } }) }
    const api = { changePasswordApi: async body => { assert.equal(body.currentPassword, 'old'); assert.equal(body.newPassword, 'new') }, getSessionApi: async () => { reads++; return { user: { id: 'pm', role: 'PM' }, mustChangePassword: false } } }
    const { authService: service } = load('src/api/services/authService.ts', { '../../store/authStore': { useAuthStore: store }, '../auth': api })
    assert.equal((await service.changePassword({ tempPassword: 'old', newPassword: 'new' })).success, true); assert.equal(reads, 1)
    api.getSessionApi = async () => ({ user: { id: 'pm' }, mustChangePassword: true })
    assert.equal((await service.changePassword({ tempPassword: 'old', newPassword: 'new' })).requiresLogin, true)
    api.changePasswordApi = async () => { throw failure(401, 'auth_session_revoked') }
    await assert.rejects(service.changePassword({ tempPassword: 'old', newPassword: 'new' })); assert.equal(expired, 2)
    api.changePasswordApi = async () => {}
    api.getSessionApi = async () => { throw failure(401, 'auth_session_revoked') }
    const result = await service.changePassword({ tempPassword: 'old', newPassword: 'new' })
    assert.equal(result.success, true); assert.equal(result.requiresLogin, true); assert.equal(result.user, null); assert.equal(expired, 3)
    api.getSessionApi = async () => { throw new Error('Network Error') }
    assert.equal((await service.changePassword({ tempPassword: 'old', newPassword: 'new' })).requiresLogin, true)
    assert.equal(expired, 4)
  })
  await test('password HTTP dispatch retains exact DTO/headers and rechecks epoch after async interceptors', async () => {
    let epoch = 1, dispatch
    const { changePasswordApi } = load('src/api/auth.ts', { './client': { apiClient: { post: async (url, body, config) => {
      assert.equal(url, '/auth/change-password')
      assert.equal(config.headers['X-CSRF-TOKEN'], 'csrf'); assert.ok(config.headers['Idempotency-Key'])
      dispatch = config.transformRequest[0]
      assert.equal(dispatch(body), JSON.stringify({ currentPassword: 'old', newPassword: 'new' }))
    } } } })
    await changePasswordApi({ currentPassword: 'old', newPassword: 'new' }, 'csrf', () => { if (epoch !== 1) throw new Error('stale epoch') })
    epoch++
    assert.throws(() => dispatch({ currentPassword: 'old', newPassword: 'new' }), /stale epoch/)
  })
  await test('survey collections paginate, preserve failures and reject loop/stale session rather than empty success', async () => {
    const make = client => load('src/api/services/surveyService.ts', { '../client': { apiClient: client } }).surveyService
    const reader = make({ get: async (_, config) => response(config.params.cursor ? { items: [{ id: 'two' }] } : { items: [{ id: 'one' }], nextCursor: 'next' }) })
    assert.equal((await reader.readSurveyPage('/projects/p/survey-plans')).length, 2)
    await assert.rejects(make({ get: async () => { throw failure(403, 'access_forbidden') } }).readSurveyPage('/projects/p/survey-tasks'), e => e.response.status === 403)
    await assert.rejects(make({ get: async () => response({ items: [], nextCursor: 'same' }) }).readSurveyPage('/projects'), /Cursor/)
    await assert.rejects(make({ get: async () => response({ wrong: [] }) }).readSurveyPage('/projects'), /contract/)
    await assert.rejects(reader.createSurvey({}), /BLOCKED/)
    await assert.rejects(reader.getSurveyRoutes(), /Web cookie/)
    assert.equal(typeof reader.simulateDroneFlightCompletion, 'undefined')
  })
  await test('Candidate decisions preserve exact source/head/target/classification and never produce local success on409/412/428', async () => {
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    for (const status of [409, 412, 428]) {
      let posts = 0
      const { surveyService: service } = load('src/api/services/surveyService.ts', { '../client': { apiClient: { post: async () => { posts++; throw failure(status, 'conflict') } } } })
      await assert.rejects(service.decideCandidate('p', { sourceKind: 'AI_DETECTION', sourceId: 's', sourceVersion: 'source-v', geometryVersion: 'geometry-v', decision: 'REJECT', reason: 'test' }), e => e.response.status === status)
      assert.equal(posts, 1)
    }
    for (const decision of ['KEEP_NEW', 'LINK_EXISTING', 'REJECT']) {
      let sent
      const receipt = { id: 'decision', sourceId: 's', sourceKind: 'AI_DETECTION', decision, defectId: decision === 'REJECT' ? null : 'd', version: 'v' }
      const { surveyService: service } = load('src/api/services/surveyService.ts', { '../client': { apiClient: { post: async (_, body) => { sent = body; return response(receipt) } } } })
      service.getCandidateDecision = async () => receipt
      service.getAiCandidateFacts = async () => ({ disposition: { decisionId: 'decision' } })
      const result = await service.decideCandidate('p', { sourceKind: 'AI_DETECTION', sourceId: 's', sourceVersion: 'sv', geometryVersion: 'gv', decision, reason: ' reason ', targetDefectId: 'd', targetVersion: 'dv', defectTypeCode: 'CRACK', severity: 'HIGH', roadSectionVersionId: 'rv', segmentId: 'segment', supersedesDecisionId: 'old', previousDecisionVersion: 'old-v' })
      assert.equal(result, receipt); assert.equal(sent.sourceVersion, 'sv'); assert.equal(sent.geometryVersion, 'gv'); assert.equal(sent.previousDecisionVersion, 'old-v')
      assert.equal(sent.reason, 'reason')
      assert.equal(sent.classification?.segmentId ?? null, decision === 'KEEP_NEW' ? 'segment' : null)
      assert.equal(sent.targetVersion, decision === 'LINK_EXISTING' ? 'dv' : null)
    }
  })
  await test('uncertain Candidate write retains key/body;201 readback failure retries GET only, not another Defect', async () => {
    const journal = new Map(), keys = [], bodies = []
    let timeout = true, readError = true
    const receipt = { id: 'decision', sourceId: 's', decision: 'REJECT', version: 'v' }
    const { surveyService: service } = load('src/api/services/surveyService.ts', {
      __sessionStorage: { getItem: k => journal.get(k) || null, setItem: (k, v) => journal.set(k, v), removeItem: k => journal.delete(k) },
      '../client': { apiClient: { post: async (_, body, config) => { keys.push(config.headers['Idempotency-Key']); bodies.push(json(body)); if (timeout) throw new Error('timeout'); return response(receipt) } } }
    })
    service.getCandidateDecision = async () => { if (readError) throw failure(503, 'read_failed'); return receipt }
    service.getAiCandidateFacts = async () => ({ disposition: { decisionId: 'decision' } })
    const input = { sourceKind: 'AI_DETECTION', sourceId: 's', sourceVersion: 'sv', geometryVersion: 'gv', decision: 'REJECT', reason: 'test' }
    await assert.rejects(service.decideCandidate('p', input), /timeout/)
    await assert.rejects(service.decideCandidate('p', { ...input, reason: 'changed' }), /key\/body\/version/)
    timeout = false
    await assert.rejects(service.decideCandidate('p', input), e => e.response.status === 503)
    readError = false
    await service.decideCandidate('p', input)
    assert.equal(keys.length, 2); assert.equal(keys[0], keys[1]); assert.deepEqual(bodies[0], bodies[1]); assert.equal(journal.size, 0)
  })
  await test('Candidate missing snapshot/wrong role and legacy reset/edit never write or claim success', async () => {
    let calls = 0
    const { surveyService: service } = load('src/api/services/surveyService.ts', { '../client': { apiClient: { post: async () => { calls++ } } } })
    await assert.rejects(service.decideCandidate('p', { sourceKind: 'AI_DETECTION', sourceId: 's', decision: 'REJECT', reason: 'test' }), /snapshot/)
    actor = { id: 'sup', role: roles.SUPERVISOR }
    await assert.rejects(service.decideCandidate('p', {}), /PM/)
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    await assert.rejects(service.resetSurveyDetection('s'), /contract/)
    await assert.rejects(service.saveAiCandidateOverride('s', {}), /contract/)
    await assert.rejects(service.updateSurveyDetection('survey', 's', { status: 'APPROVED' }), /legacy/)
    assert.equal(calls, 0)
  })
  await test('Supervisor triage holds exact key/body/version after timeout, receipt readback never POSTs twice', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const journal = new Map(), posts = []
    const caseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', projectId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    let timeout = true, readFailure = true
    const { triageService: service } = load('src/api/services/triageService.ts', {
      __sessionStorage: { getItem: key => journal.get(key) || null, setItem: (key, value) => journal.set(key, value), removeItem: key => journal.delete(key) },
      '../client': { apiClient: {
        post: async (_, body, config) => { posts.push(json({ body, headers: config.headers })); if (timeout) throw new Error('timeout'); return response(detail({ id: caseId, projectId })) },
        get: async () => { if (readFailure) throw failure(503, 'read_failed'); return response(detail({ id: caseId, projectId })) }
      } }
    })
    const input = { projectId, verificationMethod: 'EXISTING_EVIDENCE', reason: 'Supervisor selected', version: 'AAAAAAAAAAE=' }
    await assert.rejects(service.triageCase(caseId, input), /timeout/)
    await assert.rejects(service.triageCase(caseId, { ...input, reason: 'changed' }), /key\/body\/version/)
    timeout = false
    await assert.rejects(service.triageCase(caseId, input), error => error.response.status === 503)
    readFailure = false
    await service.triageCase(caseId, input)
    assert.equal(posts.length, 2); assert.deepEqual(posts[0], posts[1]); assert.equal(journal.size, 0)
    assert.equal(posts[0].body.verificationMethod, 'EXISTING_EVIDENCE')
    assert.equal(posts[0].headers['If-Match'], '"AAAAAAAAAAE="')
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    await assert.rejects(service.triageCase(caseId, input), /Supervisor/)
  })
  await test('triage requires explicit snapshot/method/reason and retains real conflict codes without another command', async () => {
    actor = { id: 'sup', role: roles.SUPERVISOR }
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', projectId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    for (const status of [409, 412, 428]) {
      let posts = 0
      const service = triage({ post: async () => { posts++; throw failure(status, 'conflict') } })
      await assert.rejects(service.triageCase(id, { projectId }), /Thiếu version/)
      await assert.rejects(service.triageCase(id, { projectId, verificationMethod: 'FIELD', reason: 'reason', version: 'AAAAAAAAAAE=' }), error => error.response.status === status)
      assert.equal(posts, 1)
    }
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
  })
  await test('eligible members paginate and expose cursor/error rather than fallback staff', async () => {
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    let requests = 0
    const { personnelService: service } = load('src/api/services/personnelService.ts', { '../client': { apiClient: { get: async (_, config) => {
      requests++; return response(config.params.cursor ? { items: [{ userId: 'two' }] } : { items: [{ userId: 'one' }], nextCursor: 'next' })
    } } } })
    assert.equal((await service.fetchEligibleProjectMembers('p', { role: 'OPERATOR' })).items.length, 2)
    assert.equal(requests, 2)
    const { personnelService: loop } = load('src/api/services/personnelService.ts', { '../client': { apiClient: { get: async () => response({ items: [], nextCursor: 'same' }) } } })
    await assert.rejects(loop.fetchEligibleProjectMembers('p', { role: 'CREW' }), /Cursor/)
  })
  await test('member add timeout replays same key/body,201 recovery only reads, wrong role never posts', async () => {
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
    const journal = new Map(), posts = []
    let timeout = true, readFailure = true
    const { personnelService: service } = load('src/api/services/personnelService.ts', {
      __sessionStorage: { getItem: k => journal.get(k) || null, setItem: (k, v) => journal.set(k, v), removeItem: k => journal.delete(k) },
      '../client': { apiClient: { post: async (_, body, config) => { posts.push(json({ body, headers: config.headers })); if (timeout) throw new Error('timeout'); return response({ membershipId: 'm' }) } } },
      './projectService': { projectService: { fetchProjectMembers: async () => { if (readFailure) throw failure(503, 'read_failed'); return [{ userId: 'operator', status: 'ACTIVE', membershipId: 'm' }] } } }
    })
    await assert.rejects(service.addProjectMember('p', 'operator'), /timeout/)
    await assert.rejects(service.addProjectMember('p', 'other'), /ý định mới/)
    timeout = false
    await assert.rejects(service.addProjectMember('p', 'operator'), e => e.response.status === 503)
    readFailure = false
    assert.equal((await service.addProjectMember('p', 'operator')).membershipId, 'm')
    assert.equal(posts.length, 2); assert.deepEqual(posts[0], posts[1]); assert.equal(journal.size, 0)
    actor = { id: 'sup', role: roles.SUPERVISOR }
    await assert.rejects(service.addProjectMember('p', 'operator'), /PM/)
    actor = { id: 'pm', role: roles.PROJECT_MANAGER }
  })
  console.log(`${passed} focused regression scenarios passed (mock HTTP/hooks; NOT E2E).`)
})().catch(error => { console.error(error); process.exitCode = 1 })
