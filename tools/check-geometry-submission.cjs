// Isolated contract/journal/hooks tests. No browser, API or database mutations.
const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('assert/strict'), { webcrypto } = require('crypto')
let actor = { id: 'pm', role: 'PROJECT_MANAGER' }, epoch = 1, count = 0
const auth = { useAuthStore: Object.assign(s => s ? s({ user: actor, authEpoch: epoch, isAuthenticated: true }) : { user: actor, authEpoch: epoch, isAuthenticated: true }, { getState: () => ({ user: actor, authEpoch: epoch, isAuthenticated: true }) }) }
const roles = { PROJECT_MANAGER: 'PROJECT_MANAGER', SUPERVISOR: 'SUPERVISOR' }
const project = 'p', id = '11111111-1111-4111-8111-111111111111', etag = '"AAAAAAAAAAE="'
const receipt = () => ({ projectId: project, draftId: id, roadSectionId: null, status: 'SUBMITTED', version: 'AAAAAAAAAAI=', submittedContentVersion: 'AAAAAAAAAAE=', submittedBy: 'pm', submittedAt: '2026-11-10T04:00:00Z', confirmedRouteVersionId: null })
function load(file, mocks) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require: n => { if (n in mocks) return mocks[n]; if (n.endsWith('/authStore')) return auth; if (n.endsWith('/enums')) return { RoleCode: roles }; throw Error('Unmocked ' + n) }, sessionStorage: mocks.storage, crypto: webcrypto, URLSearchParams, AbortController, console })
  return module.exports
}
const fail = (status, code) => Object.assign(Error(code), { response: { status, data: { code } } })
const store = () => { const map = new Map(); return { getItem: k => map.get(k) || null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k) } }
function setup(options = {}) {
  const storage = options.storage || store(), posts = [], reads = []
  const api = { get: async path => { reads.push(path); return { data: receipt() } }, post: async (path, body, config) => { posts.push({ path, body: JSON.stringify(body), headers: config.headers }); return { data: receipt() } } }
  const alignment = { getGeometryDraft: async (p, d) => ({ data: { projectId: p, id: d, status: 'SUBMITTED', roadSectionId: null, version: receipt().version }, etag: '"AAAAAAAAAAI="' }) }
  const service = load('src/api/services/geometrySubmissionService.ts', { '../client': { apiClient: api }, './alignmentService': { alignmentService: alignment }, storage })
  return { ...service, storage, posts, reads, api, alignment }
}
async function test(name, run) { actor = { id: 'pm', role: 'PROJECT_MANAGER' }; epoch = 1; await run(); count++; console.log('PASS ' + name) }
function hooks() {
  const state = [], effects = []; let slot = 0
  const react = { useState(init) { const i = slot++; if (!(i in state)) state[i] = init; return [state[i], v => state[i] = typeof v === 'function' ? v(state[i]) : v] }, useRef(init) { const i = slot++; if (!(i in state)) state[i] = { current: init }; return state[i] }, useEffect(fn, deps) { const i = slot++, old = effects[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) effects[i] = { fn, deps, pending: true, cleanup: old?.cleanup } } }
  return { react, render(fn) { slot = 0; const view = fn(); for (const e of effects) if (e?.pending) { e.pending = false; e.cleanup?.(); e.cleanup = e.fn() } return view }, close() { effects.forEach(e => e?.cleanup?.()) } }
}
;(async () => {
  await test('lookup: only exact 404 code means no submission; permission/deployment/server/schema errors remain errors', async () => {
    const h = setup()
    for (const error of [fail(404, 'not_found'), fail(401, 'unauthorized'), fail(403, 'access_forbidden'), fail(500, 'failed')]) { h.api.get = async () => { throw error }; await assert.rejects(h.geometrySubmissionService.read(project), e => e === error) }
    h.api.get = async () => { throw fail(404, 'road_geometry_submission_not_found') }; assert.equal(await h.geometrySubmissionService.read(project), null)
    for (const value of [{}, { ...receipt(), projectId: 'other' }, { ...receipt(), status: 'DRAFT' }, { ...receipt(), version: undefined }, { ...receipt(), roadSectionId: undefined }, { ...receipt(), status: 'CONFIRMED' }]) { h.api.get = async () => ({ data: value }); await assert.rejects(h.geometrySubmissionService.read(project), /contract/) }
  })
  await test('submit uses empty body current ETag stable key; lookup then GET draft clears journal', async () => {
    const h = setup(), result = await h.runSubmission(project, { draftId: id, etag })
    assert.equal(h.posts.length, 1); assert.equal(h.posts[0].path, `/projects/p/road-geometry-drafts/${id}/submit`); assert.equal(h.posts[0].body, '{}'); assert.equal(h.posts[0].headers['If-Match'], etag); assert.match(h.posts[0].headers['Idempotency-Key'], /^[\da-f-]{36}$/)
    assert.equal(h.reads[0], '/projects/p/road-geometry-submission'); assert.equal(result.draft.data.status, 'SUBMITTED'); assert.equal(h.pendingSubmission(project), null)
  })
  await test('timeout/reload retries immutable key body draftId and pre-submit ETag', async () => {
    const h = setup(), post = h.api.post; h.api.post = async (...args) => { await post(...args); throw Error('timeout') }
    await assert.rejects(h.runSubmission(project, { draftId: id, etag }), /timeout/)
    const reloaded = setup({ storage: h.storage }); await reloaded.runSubmission(project)
    assert.equal(JSON.stringify(h.posts[0]), JSON.stringify(reloaded.posts[0])); assert.equal(reloaded.pendingSubmission(project), null)
  })
  await test('receipt then lookup/GET failure: F5 retries reads only, never another submit', async () => {
    for (const point of ['lookup', 'draft']) {
      const h = setup(); if (point === 'lookup') h.api.get = async () => { throw fail(503, 'unavailable') }; else h.alignment.getGeometryDraft = async () => { throw fail(503, 'unavailable') }
      await assert.rejects(h.runSubmission(project, { draftId: id, etag })); assert.equal(h.pendingSubmission(project).received, true)
      const reloaded = setup({ storage: h.storage }); await reloaded.runSubmission(project); assert.equal(h.posts.length, 1); assert.equal(reloaded.posts.length, 0)
    }
  })
  await test('wrong receipt reference/content or wrong GET status/version/section/ID cannot clear intent', async () => {
    for (const change of [{ draftId: 'wrong' }, { submittedContentVersion: 'AAAAAAAAAAM=' }]) {
      const h = setup(); h.api.post = async () => ({ data: { ...receipt(), ...change } }); await assert.rejects(h.runSubmission(project, { draftId: id, etag })); assert.equal(h.pendingSubmission(project).received, true)
    }
    for (const change of [{ status: 'DRAFT' }, { version: 'AAAAAAAAAAM=' }, { roadSectionId: 'wrong' }, { id: 'wrong' }, { projectId: 'wrong' }]) {
      const h = setup(), read = h.alignment.getGeometryDraft; h.alignment.getGeometryDraft = async (...args) => { const d = await read(...args); return { ...d, data: { ...d.data, ...change } } }
      await assert.rejects(h.runSubmission(project, { draftId: id, etag })); assert.equal(h.pendingSubmission(project).received, true)
    }
  })
  await test('definite conflict requires explicit revision; no endless retries or implicit ETag replacement', async () => {
    const h = setup(); h.api.post = async () => { throw fail(412, 'concurrency_conflict') }
    await assert.rejects(h.runSubmission(project, { draftId: id, etag })); const old = h.pendingSubmission(project); assert.equal(old.rejected, true)
    await assert.rejects(h.runSubmission(project), /chủ động/); assert.equal(h.pendingSubmission(project).key, old.key); h.reviseSubmission(project); assert.equal(h.pendingSubmission(project), null)
  })
  await test('Sup cannot submit; late actor/epoch response cannot accept receipt or clear another journal', async () => {
    const h = setup(); actor = { id: 'sup', role: 'SUPERVISOR' }; await assert.rejects(h.runSubmission(project, { draftId: id, etag }), /PM/); assert.equal(h.posts.length, 0)
    actor = { id: 'pm', role: 'PROJECT_MANAGER' }; let resolve; h.api.post = () => new Promise(r => resolve = r); const pending = h.runSubmission(project, { draftId: id, etag }); epoch++; resolve({ data: receipt() }); await assert.rejects(pending, /Phiên/); assert.ok(h.pendingSubmission(project)); assert.equal(h.pendingSubmission(project).received, undefined)
  })
  await test('submit hook blocks unsaved input, existing submission, loading/error, wrong reference and Sup', async () => {
    const state = hooks(); let calls = 0, saved = false
    const model = { draftId: id, draft: { data: { id, projectId: project, status: 'DRAFT' }, etag }, submissionReady: true, submissionLoading: false, submissionError: '', submission: null, retry() {} }
    const hook = load('src/pages/(pm)/alignment/useGeometrySubmission.ts', { react: state.react, '../../../api/services/geometrySubmissionService': { pendingSubmission: () => null, runSubmission: async () => calls++, reviseSubmission() {} } }).useGeometrySubmission
    const render = () => state.render(() => hook(project, model, saved, () => {}))
    let view = render(); assert.match(view.reason, /chưa lưu/); await view.submit(); assert.equal(calls, 0)
    saved = true; model.submission = receipt(); view = render(); await view.submit(); assert.equal(calls, 0)
    model.submission = null; model.submissionError = 'HTTP 500'; view = render(); assert.equal(view.reason, 'HTTP 500'); await view.submit(); assert.equal(calls, 0)
    model.submissionError = ''; model.draft.data.id = 'other'; view = render(); await view.submit(); assert.equal(calls, 0); model.draft.data.id = id; model.submissionLoading = true; view = render(); await view.submit(); assert.equal(calls, 0)
    model.submissionLoading = false; actor = { id: 'sup', role: 'SUPERVISOR' }; view = render(); await view.submit(); assert.equal(calls, 0)
    actor = { id: 'pm', role: 'PROJECT_MANAGER' }; view = render(); await view.submit(); assert.equal(calls, 1); state.close()
  })
  await test('Sup project entry discovers SUBMITTED without URL ID; F5 re-reads and CONFIRMED opens server geometry', async () => {
    for (const status of ['SUBMITTED', 'CONFIRMED']) {
      actor = { id: 'sup', role: 'SUPERVISOR' }; const state = hooks(); let query = new URLSearchParams(), view, reads = []
      const lookup = { ...receipt(), status, ...(status === 'CONFIRMED' ? { roadSectionId: 'road', confirmedRouteVersionId: 'version' } : {}) }
      const api = { fetchCrsProfiles: async () => [], getGeometryDraft: async (p, d) => { reads.push([p, d]); return { data: { projectId: p, id: d, status, roadSectionId: lookup.roadSectionId, version: lookup.version }, etag: `"${lookup.version}"` } }, readDraftReadiness: async () => ({ ready: true }), readProjectContext: async () => ({ projectId: project, roadSections: [] }), readConfirmedGeometry: async (p, r, v) => ({ projectId: p, roadSectionId: r, routeVersionId: v, sourceDraftId: id }) }
      let lookups = 0; const hook = load('src/pages/(pm)/alignment/useGeometryReadModel.ts', { react: state.react, 'react-router-dom': { useSearchParams: () => [query, v => query = v] }, '../../../api/client': { apiClient: { get: async () => ({ data: { items: [{ projectId: project }] } }) } }, '../../../api/services/alignmentService': { alignmentService: api }, '../../../api/services/geometrySubmissionService': { geometrySubmissionService: { read: async () => { lookups++; return lookup } } } }).useGeometryReadModel
      const render = () => view = state.render(() => hook(project)), settle = async () => { for (let i = 0; i < 20; i++) { await Promise.resolve(); render() } }
      render(); await settle(); assert.equal(view.draftId, id); assert.equal(query.get('draftId'), id); assert.equal(view.draft.data.status, status); assert.ok(reads.every(([p, d]) => p === project && d === id))
      if (status === 'CONFIRMED') { assert.equal(view.geometry.routeVersionId, 'version'); assert.equal(query.get('routeVersionId'), 'version') }
      view.retry(); render(); await settle(); assert.ok(lookups >= 2); assert.equal(view.draftId, id); state.close()
    }
  })
  await test('lookup late project/actor response cannot replace current scope; 404 keeps historical geometry references', async () => {
    const state = hooks(); let query = new URLSearchParams('roadSectionId=old-road&routeVersionId=old-version'), view, selected = 'p'; const requests = []
    const hook = load('src/pages/(pm)/alignment/useGeometryReadModel.ts', { react: state.react, 'react-router-dom': { useSearchParams: () => [query, v => query = v] }, '../../../api/client': { apiClient: { get: async () => ({ data: { items: [] } }) } }, '../../../api/services/alignmentService': { alignmentService: { fetchCrsProfiles: async () => [], readConfirmedGeometry: async (p, r, v) => ({ projectId: p, roadSectionId: r, routeVersionId: v }) } }, '../../../api/services/geometrySubmissionService': { geometrySubmissionService: { read: p => new Promise(resolve => requests.push({ p, resolve })) } } }).useGeometryReadModel
    const render = () => view = state.render(() => hook(selected)), settle = async () => { for (let i = 0; i < 20; i++) { await Promise.resolve(); render() } }
    render(); requests[0].resolve(null); await settle(); assert.equal(view.submission, null); assert.equal(view.geometry.routeVersionId, 'old-version'); assert.equal(query.get('routeVersionId'), 'old-version')
    view.retry(); render(); const late = requests.at(-1); selected = 'q'; epoch++; query = new URLSearchParams(); render(); requests.at(-1).resolve(null); await settle(); late.resolve(receipt()); await settle(); assert.equal(view.submission, null); assert.equal(view.draftId, ''); assert.equal(view.geometry, null); state.close()
  })
  await test('reject requires Sup and sourced reason, immutable retry/receipt GET only and stale ETag explicit decision',async()=>{
    const reason='Cần sửa bề rộng theo hồ sơ',rejected={...receipt(),status:'REJECTED',version:'AAAAAAAAAAM=',currentReview:{number:1,contentVersion:'AAAAAAAAAAE=',outcome:'REJECTED',submittedBy:'pm',submittedAt:receipt().submittedAt,decidedBy:'sup',decidedAt:'2026-11-10T05:00:00Z',rejectionReason:reason},previousRejection:null}
    const h=setup();await assert.rejects(h.runSubmission(project,{kind:'reject',draftId:id,etag,reason}),/Giám sát/);actor={id:'sup',role:'SUPERVISOR'}
    for(const invalid of ['', ' ', 'x'.repeat(2001)])await assert.rejects(h.runSubmission(project,{kind:'reject',draftId:id,etag,reason:invalid}),/2.000/)
    const post=h.api.post;let timeout=true,broken=true;h.api.post=async(...args)=>{await post(...args);if(timeout)throw Error('timeout');return{data:rejected}};h.api.get=async()=>{if(broken)throw fail(503,'read_failed');return{data:rejected}};h.alignment.getGeometryDraft=async()=>({data:{id,projectId:project,status:'REJECTED',roadSectionId:null,version:rejected.version},etag:'"AAAAAAAAAAM="'})
    await assert.rejects(h.runSubmission(project,{kind:'reject',draftId:id,etag,reason}),/timeout/);timeout=false;await assert.rejects(h.runSubmission(project));assert.equal(h.pendingSubmission(project).received,true);assert.equal(h.posts[0].body,JSON.stringify({reason}));assert.equal(h.posts[0].path,`/projects/p/road-geometry-drafts/${id}/reject`);assert.equal(h.posts[0].headers['If-Match'],etag);assert.equal(JSON.stringify(h.posts[0]),JSON.stringify(h.posts[1]));broken=false;await h.runSubmission(project);assert.equal(h.posts.length,2);assert.equal(h.pendingSubmission(project),null)
    const conflict=setup();conflict.api.post=async()=>{throw fail(412,'concurrency_conflict')};await assert.rejects(conflict.runSubmission(project,{kind:'reject',draftId:id,etag,reason}));assert.equal(conflict.pendingSubmission(project).rejected,true);await assert.rejects(conflict.runSubmission(project),/chủ động/)
  })
  await test('reject hook gates submitted reference, PM rejected same draft resubmits, unchanged reports exact reason without auto mutation',async()=>{
    const state=hooks();let calls=[],failUnchanged=false;actor={id:'sup',role:'SUPERVISOR'};const model={draftId:id,draft:{data:{id,projectId:project,status:'SUBMITTED'},etag},submissionReady:true,submissionLoading:false,submissionError:'',submission:{...receipt(),version:etag.slice(1,-1)},retry(){}}
    const hook=load('src/pages/(pm)/alignment/useGeometrySubmission.ts',{react:state.react,'../../../api/services/geometrySubmissionService':{pendingSubmission:()=>null,runSubmission:async(p,input)=>{calls.push(input);if(failUnchanged)throw fail(409,'road_geometry_submission_unchanged')},reviseSubmission(){}}}).useGeometrySubmission
    let view;const render=()=>view=state.render(()=>hook(project,model,true,()=>{}));render();assert.equal(view.canReject,true);view.openReject();render();view.setRejectReason(' ');render();await view.reject();render();assert.equal(calls.length,0);assert.ok(view.rejectError);view.setRejectReason('Cần sửa nội dung');render();await view.reject();assert.equal(calls[0].kind,'reject');assert.equal(calls[0].etag,etag)
    actor={id:'pm',role:'PROJECT_MANAGER'};model.submission.status='REJECTED';model.draft.data.status='REJECTED';render();assert.equal(view.reason,'');failUnchanged=true;await view.submit();render();assert.match(view.error,/Nội dung tuyến chưa thay đổi/);assert.equal(calls.length,2);assert.equal(model.draftId,id);state.close()
  })
  await test('historical layout URL keeps explicit route/set/layout when current submission points to newer version',async()=>{
    const h=hooks();let query=new URLSearchParams('roadSectionId=historic-road&routeVersionId=historic-version&segmentSetId=historic-set&layoutId=historic-layout'),view
    const hook=load('src/pages/(pm)/alignment/useGeometryReadModel.ts',{react:h.react,'react-router-dom':{useSearchParams:()=>[query,v=>query=typeof v==='function'?v(query):v]},'../../../api/client':{apiClient:{get:async()=>({data:{items:[]}})}},'../../../api/services/alignmentService':{alignmentService:{fetchCrsProfiles:async()=>[],readConfirmedGeometry:async(p,r,v)=>({projectId:p,roadSectionId:r,routeVersionId:v})}},'../../../api/services/geometrySubmissionService':{geometrySubmissionService:{read:async()=>({...receipt(),status:'CONFIRMED',roadSectionId:'current-road',confirmedRouteVersionId:'current-version'})}}}).useGeometryReadModel
    for(let i=0;i<25;i++){view=h.render(()=>hook(project));await Promise.resolve()}
    assert.equal(view.roadReference,'historic-road');assert.equal(view.versionReference,'historic-version');assert.equal(query.get('layoutId'),'historic-layout');assert.equal(query.get('segmentSetId'),'historic-set');assert.equal(view.geometry.routeVersionId,'historic-version');h.close()
  })
  await test('resubmit creates current round2 and keeps previous rejection; receipt recovery only reads without second mutation',async()=>{
    const previous={number:1,contentVersion:'AAAAAAAAAAE=',outcome:'REJECTED',submittedBy:'pm',submittedAt:receipt().submittedAt,decidedBy:'sup',decidedAt:'2026-11-10T05:00:00Z',rejectionReason:'Sửa bề rộng'}
    const next={...receipt(),version:'AAAAAAAAAAQ=',submittedContentVersion:'AAAAAAAAAAM=',currentReview:{number:2,contentVersion:'AAAAAAAAAAM=',outcome:'SUBMITTED',submittedBy:'pm',submittedAt:receipt().submittedAt,decidedBy:null,decidedAt:null,rejectionReason:null},previousRejection:previous}
    const h=setup();h.api.post=async(path,body,config)=>{h.posts.push({path,body:JSON.stringify(body),headers:config.headers});return{data:next}};let broken=true;h.api.get=async()=>{if(broken)throw fail(503,'read_failed');return{data:next}};h.alignment.getGeometryDraft=async()=>({data:{projectId:project,id,status:'SUBMITTED',version:next.version,roadSectionId:null},etag:'"AAAAAAAAAAQ="'})
    await assert.rejects(h.runSubmission(project,{draftId:id,etag:'"AAAAAAAAAAM="'}));assert.equal(h.pendingSubmission(project).received,true);broken=false;const result=await h.runSubmission(project);assert.equal(h.posts.length,1);assert.equal(result.lookup.currentReview.number,2);assert.equal(result.lookup.previousRejection.rejectionReason,'Sửa bề rộng');assert.equal(result.draft.data.id,id)
    const bad={...next,currentReview:{...next.currentReview,outcome:'REJECTED'}};assert.throws(()=>h.verifySubmission(bad,project),/Lượt xét duyệt/)
  })
  console.log(`${count} submission scenarios PASS (isolated mocks/hooks; runtime NOT_RUN).`)
})().catch(e => { console.error(e); process.exitCode = 1 })
