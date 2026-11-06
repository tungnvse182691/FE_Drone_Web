const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict')
const ts = require('typescript'), { webcrypto } = require('node:crypto')
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
const roles = { SUPERVISOR: 'SUPERVISOR', PROJECT_MANAGER: 'PROJECT_MANAGER' }
let state
const reset = () => { state = { user: { id: 'sup', role: roles.SUPERVISOR }, authEpoch: 1 } }
const store = Object.assign(selector => selector ? selector(state) : state, { getState: () => state, subscribe: () => () => {} })
const page = (items, nextCursor = null) => ({ data: { items, nextCursor } })
const fail = (status, code) => Object.assign(Error(code), { response: { status, data: { code } } })
function load(file, client, extra = {}) {
  const module = { exports: {} }, saved = new Map()
  const mocks = {
    '../../utils/projectWarranty': file.endsWith('projectWarranty.ts') ? {} : load('src/utils/projectWarranty.ts', {}),
    '../../../utils/projectWarranty': file.endsWith('projectWarranty.ts') ? {} : load('src/utils/projectWarranty.ts', {}),
    '../client': { apiClient: client }, '../../store/authStore': { useAuthStore: store },
    '../../../store/authStore': { useAuthStore: store }, '../../types/enums': { RoleCode: roles },
    './userDirectory': { userDirectory: { registerUsers() {} } },
    './personnelService': { personnelService: { fetchStaffDirectory: async () => [] } },
    './projectService': { projectService: {} }, './storageHelper': { STORAGE_KEYS: { PROJECTS: 'projects' }, saveToStorage() {}, getFromStorage: (_, fallback) => fallback },
    react: { __esModule: true, default: React, ...React, useMemo: fn => fn() },
    '../../../components/ui/Icon': { Icon: () => null },
    ...extra
  }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8').replaceAll('import.meta.env', '({})'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require: name => { if (name in mocks) return mocks[name]; throw Error('Missing mock '+name) }, console: { log() {}, warn() {}, error() {} }, window: { addEventListener() {}, removeEventListener() {} }, crypto: webcrypto, setTimeout, sessionStorage: { getItem: k => saved.get(k) || null, setItem: (k,v) => saved.set(k,v), removeItem: k => saved.delete(k) }, localStorage: { getItem: () => null } })
  return module.exports
}
const input = { code: 'RG-STEP2', name: 'Step 2', primaryPmId: '72f84201-a001-4000-8000-000000000002', handoverDate: '2026-11-06', warrantyEndDate: '2027-11-06', handoverFileIds: [] }
const created = { id: 'created', code: input.code, name: input.name, primaryProjectManagerUserId: input.primaryPmId }
const project = (client, extra) => load('src/api/services/projectService.ts', client, extra).projectService
const staff = client => load('src/api/services/personnelService.ts', client).personnelService
let passed = 0
async function test(name, fn) { reset(); await fn(); passed++; console.log('PASS '+name) }
;(async () => {
  await test('directory paginates without project reads; errors/loop/stale epoch reject', async () => {
    const calls = []
    const s = staff({ get: async (url, config) => { calls.push({ url, ...config.params }); return page([{ userId: config.params.cursor || 'first' }], config.params.cursor ? null : 'opaque') } })
    assert.equal((await s.fetchStaffDirectory({ role: 'PM', status: 'ACTIVE' })).length, 2)
    assert.ok(calls.every(c => c.url === '/users' && c.role === 'PM' && c.status === 'ACTIVE' && c.limit === 100))
    await assert.rejects(staff({ get: async () => page([], 'loop') }).fetchStaffDirectory(), /Cursor/)
    await assert.rejects(staff({ get: async () => { throw fail(403, 'access_forbidden') } }).fetchStaffDirectory(), e => e.response.status === 403)
    await assert.rejects(staff({ get: async () => { state.authEpoch++; return page([]) } }).fetchStaffDirectory(), /Phiên/)
  })
  await test('primary null is distinct from HTTP/schema error; version comes from membership', async () => {
    assert.equal(await staff({ get: async () => ({ data: { primaryProjectManager: null } }) }).getPrimaryProjectManager('p'), null)
    const value = { membershipId: 'm', membershipVersion: 'AAAAAAAAAAE=', userId: input.primaryPmId, validFrom: '2026-11-05' }
    assert.equal((await staff({ get: async () => ({ data: { primaryProjectManager: value } }) }).getPrimaryProjectManager('p')).membershipVersion, value.membershipVersion)
    await assert.rejects(staff({ get: async () => { throw fail(503, 'unavailable') } }).getPrimaryProjectManager('p'), e => e.response.status === 503)
    await assert.rejects(staff({ get: async () => ({ data: {} }) }).getPrimaryProjectManager('p'), /contract/)
  })
  await test('members paginate with role-limited history and preserve errors', async () => {
    const calls = [], s = project({ get: async (_, c) => { calls.push(c.params); return page([{ membershipId: c.params.cursor || 'm1' }], c.params.cursor ? null : 'next') } })
    assert.equal((await s.fetchProjectMembers('p', true)).length, 2)
    assert.ok(calls.every(c => c.includeHistory === true))
    state.user.role = roles.PROJECT_MANAGER; calls.length = 0
    await s.fetchProjectMembers('p', true); assert.ok(calls.every(c => c.includeHistory === false))
    await assert.rejects(project({ get: async () => { throw fail(403, 'scope') } }).fetchProjectMembers('p'), e => e.response.status === 403)
  })
  await test('201/read failure retains receipt; retry never POSTs twice; canonical date/body/key', async () => {
    let posts = 0, broken = true, body, headers
    const s = project({ post: async (_, b, c) => { posts++; body=b; headers=c.headers; return { status: 201, data: { id: 'created' } } }, get: async () => { if (broken) throw fail(503, 'read_failed'); return page([created]) } })
    await assert.rejects(s.createProject(input), /đã được tạo/)
    assert.equal(s.pendingProjectCreate().hasReceipt, true)
    broken=false; assert.equal((await s.createProject(input, true)).id, 'created'); assert.equal(posts, 1)
    assert.equal(body.handoverDate, input.handoverDate); assert.equal(body.warrantyEndDate, input.warrantyEndDate)
    assert.equal(body.primaryPmId, input.primaryPmId); assert.equal(body.handoverFileIds.length, 0)
    assert.match(headers['Idempotency-Key'], /^[a-f0-9-]{36}$/); assert.equal(s.pendingProjectCreate(), null)
  })
  await test('ambiguous POST retry holds identical body/key and blocks changed intent', async () => {
    let timeout = true; const writes = []
    const s = project({ post: async (_, b, c) => { writes.push(JSON.stringify([b,c.headers])); if(timeout) throw Error('timeout'); return { status: 201, data: { id:'created' } } }, get: async () => page([created]) })
    await assert.rejects(s.createProject(input), /timeout/)
    await assert.rejects(s.createProject({ ...input, name: 'other' }, true), /chưa rõ/)
    timeout=false; await s.createProject(input,true); assert.equal(writes.length,2); assert.equal(writes[0],writes[1])
  })
  await test('invalid dates/PM/length/filename and PM actor never dispatch POST', async () => {
    let writes=0;const s=project({post:async()=>{writes++}})
    for(const patch of [{handoverDate:'2026-02-30'},{warrantyEndDate:'2025-11-01'},{primaryPmId:'sample'},{name:'x'.repeat(256)},{handoverFileIds:['fake.pdf']}]) await assert.rejects(s.createProject({...input,...patch}))
    state.user.role=roles.PROJECT_MANAGER;await assert.rejects(s.createProject(input),/Giám sát/);assert.equal(writes,0)
  })
  await test('409 codes and CSRF are distinct and session switch cannot accept stale receipt', async () => {
    for(const [status,code,pattern] of [[409,'project_code_conflict',/đã tồn tại/],[409,'duplicate_request',/trùng lặp/],[409,'project_closed',/project_closed/],[403,'csrf_failed',/CSRF/]]) {
      const s=project({post:async()=>{throw fail(status,code)}})
      await assert.rejects(s.createProject(input),e=>e.code===code&&pattern.test(e.message))
    }
    const s=project({post:async()=>{state.authEpoch++;return{status:201,data:{id:'created'}}}})
    await assert.rejects(s.createProject(input),/Phiên/)
  })
  await test('project list remains server-scoped and partial dependency failure is visible without fake zero', async () => {
    const s=project({get:async url=>url==='/projects'?page([created]):url.endsWith('/repair-packages')?page([]):Promise.reject(fail(503,'stats'))},{'./personnelService':{personnelService:{fetchStaffDirectory:async()=>{throw fail(503,'directory')}}}})
    const result=await s.fetchProjects();assert.equal(result.length,1);assert.equal(result[0].id,'created');assert.ok(Number.isNaN(result[0].open_defects));assert.equal(result[0].repair_packages,0);assert.ok(result[0].stats_error)
    const stale=project({get:async()=>{state.authEpoch++;return page([])}})
    await assert.rejects(stale.fetchProjects(),/Phiên/)
  })
  await test('modal blocks missing/inactive PM, freezes retry payload and disables filename upload', async () => {
    const C=load('src/pages/(pm)/projects/CreateProjectModal.tsx',{}).CreateProjectModal
    const props={isOpen:true,projectName:'Test',projectCode:'TEST',projectPM:input.primaryPmId,projectRegion:'',startDate:input.handoverDate,endDate:input.warrantyEndDate,onSubmit(){},onClose(){}}
    const nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)]
    for(const status of [undefined,'SUSPENDED'])assert.equal(nodes(C({...props,pmOptions:[{id:input.primaryPmId,status}]})).find(n=>n.props?.type==='submit').props.disabled,true)
    const view=C({...props,pendingCreate:true,receivedCreate:true,pmOptions:[]});assert.equal(nodes(view).find(n=>n.type==='fieldset').props.disabled,true);assert.equal(nodes(view).find(n=>n.props?.type==='file').props.disabled,true);assert.equal(nodes(view).find(n=>n.props?.type==='submit').props.disabled,false)
    const html=renderToStaticMarkup(view);assert.ok(html.includes('Đọc lại kết quả'));assert.ok(!html.includes('fake.pdf'))
  })
  await test('overview drops old project success/error and keeps independent primary when members fail', async () => {
    let id = 'a', slot = 0, view
    const values = [], effects = [], calls = []
    const hooks = {
      ...React,
      useState(initial) { const i=slot++; if (!(i in values)) values[i]=typeof initial==='function'?initial():initial; return [values[i], next=>{values[i]=typeof next==='function'?next(values[i]):next}] },
      useRef(initial) { const i=slot++; if (!(i in values)) values[i]={current:initial}; return values[i] },
      useCallback(fn,deps) { const i=slot++,old=values[i]; if(!old||deps.some((d,j)=>d!==old.deps[j])) values[i]={fn,deps}; return values[i].fn },
      useEffect(setup,deps) { const i=slot++,old=effects[i]; if(!old||deps.some((d,j)=>d!==old.deps[j])) effects[i]={setup,deps,cleanup:old?.cleanup,pending:true} }
    }
    const names=['ProjectOverviewHeader','ProjectHighlightsGrid','ProjectTimelineStepper','ProjectSegmentsTable','ProjectPersonnelCard','ProjectMapPreviewCard']
    const mocks={
      react:{__esModule:true,default:hooks,...hooks}, 'react-router-dom':{useParams:()=>({id}),useNavigate:()=>()=>{}},
      '../../api/services':{projectService:{fetchProjectById:id=>new Promise((resolve,reject)=>calls.push({id,resolve,reject})),fetchProjectMembers:async()=>{throw fail(503,'members')}},personnelService:{getPrimaryProjectManager:async()=>({userId:'pm',displayName:'Server primary'})}},
      '../../api/services/alignmentService':{alignmentService:{getAlignmentData:()=>({coords:[],branches:[],segments:[]})}},
      '../../api/services/personnelService':{}, '../../components/ui/Icon':{Icon:()=>null},
      './alignment/alignmentGeometryHelpers':{calculateCoordsLengthKm:()=>0}, './projects/CloseProjectModal':{CloseProjectModal:'CloseProjectModal'}
    }
    names.forEach(n=>mocks['./project-overview/'+n]={[n]:n})
    const C=load('src/pages/(pm)/ProjectOverview.tsx',{},mocks).ProjectOverview
    // The VM uses this event-only mock; it does not emulate browser runtime.
    const render=()=>{slot=0;view=C();effects.forEach(e=>{if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}})}
    const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();render()}
    render(); id='b'; render()
    calls[1].resolve({id:'b',code:'B',name:'B'});await flush()
    calls[0].reject(Error('old project failure'));await flush()
    const nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)]
    const card=nodes(view).find(n=>n.type==='ProjectPersonnelCard')
    assert.equal(card.props.project.id,'b');assert.ok(card.props.memberError);assert.equal(card.props.primaryPm.displayName,'Server primary')
    id='c';render();effects.forEach(e=>e?.cleanup?.());calls[2].resolve({id:'c',code:'C',name:'C'});await flush()
    assert.ok(!nodes(view).some(n=>n.type==='ProjectPersonnelCard'&&n.props.project.id==='c'))
  })
  await test('render missing statistics never claims no damage or renders NaN; real zero and partial counts survive', async () => {
    const C=load('src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx',{}).ProjectHighlightsGrid
    const base={id:'p',name:'P',code:'P',status:'ACTIVE',warranty_data_missing:true}
    for(const value of [NaN,null,undefined]) {
      const html=renderToStaticMarkup(React.createElement(C,{project:{...base,open_defects:value,repair_packages:4}}))
      assert.ok(html.includes('Chưa tải được'));assert.ok(html.includes('4 gói sửa chữa'))
      for(const text of ['NaN','undefined','null','Chưa phát hiện hư hỏng','Ổn định','Cần xử lý','width:70%','width:100%'])assert.ok(!html.includes(text),text)
    }
    const html=renderToStaticMarkup(React.createElement(C,{project:{...base,open_defects:0,repair_packages:0}}))
    assert.ok(html.includes('0 điểm'));assert.ok(html.includes('0 gói sửa chữa'));assert.ok(!html.includes('Ổn định 100%'))
  })
  await test('mapper and all warranty surfaces reject absent/invalid/reversed dates and CLOSED inference; valid dates remain visible', async () => {
    const components=[['project-overview/ProjectHighlightsGrid.tsx','ProjectHighlightsGrid'],['projects/ProjectGridView.tsx','ProjectGridView'],['projects/ProjectTableView.tsx','ProjectTableView']]
    for(const dates of [{},{handoverDate:'bad',warrantyEndDate:'2099-01-01'},{handoverDate:'2026-02-30',warrantyEndDate:'2099-01-01'},{handoverDate:'2099-01-01',warrantyEndDate:'2026-01-01'},{handoverDate:'2020-01-01',warrantyEndDate:'2099-01-01'}]) {
      const s=project({get:async url=>url==='/projects'?page([{...created,...dates,status:'CLOSED'}]):url.endsWith('/defect-statistics')?{data:{statistics:{openDefectsCount:0}}}:page([])})
      const [mapped]=await s.fetchProjects();const valid=dates.handoverDate==='2020-01-01'
      assert.equal(mapped.warranty_data_missing,!valid)
      if(valid){assert.ok(mapped.days_remaining>0);assert.ok(mapped.warranty_passed_percent<100)}else{assert.ok(Number.isNaN(mapped.days_remaining));assert.ok(Number.isNaN(mapped.warranty_passed_percent))}
      for(const [file,name] of components){const C=load('src/pages/(pm)/'+file,{} )[name];const render=p=>renderToStaticMarkup(React.createElement(C,{project:p,filteredProjects:[p],totalProjectsCount:1,isSupervisor:false}));const html=render(mapped)
        if(valid){assert.ok(html.includes(`Còn ${mapped.days_remaining} ngày`));assert.ok(html.includes(`${mapped.warranty_passed_percent}%`))}
        else{for(const text of ['NaN','Còn 0 ngày','0%','3 năm từ bàn giao','width:100%'])assert.ok(!html.includes(text),file+' '+text);assert.ok(html.includes('Chưa cập nhật'))}
        const invalid=render({...mapped,warranty_data_missing:false,handover_date:'bad',warranty_end_date:'bad',days_remaining:0,warranty_passed_percent:0});assert.ok(!invalid.includes('Còn 0 ngày'));assert.ok(!invalid.includes('0%'))
      }
    }
  })
  await test('Web reassignment stays blocked without dispatch despite valid membership version', async () => {
    let writes=0
    await assert.rejects(staff({put:async()=>{writes++}}).reassignPrimaryProjectManager('p',{primaryProjectManagerUserId:input.primaryPmId,effectiveFrom:'2026-11-06',reason:'test',expectedCurrentMembershipRowVersion:'AAAAAAAAAAE='}),e=>e.code==='web_cookie_unsupported')
    assert.equal(writes,0)
  })
  console.log(`${passed} Step 2 regression scenarios PASS (mock HTTP/SSR; NOT runtime E2E).`)
})().catch(e=>{console.error(e);process.exitCode=1})
