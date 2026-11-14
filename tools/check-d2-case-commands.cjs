// Isolated production service/hook/modal tests. Never calls a running backend.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react'),{webcrypto}=require('crypto')
let state={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1},posts=[],gets=[],rows={},failPost,failGet
const journal=new Map(), storage={getItem:k=>journal.get(k)||null,setItem:(k,v)=>journal.set(k,v),removeItem:k=>journal.delete(k)}
const auth={useAuthStore:Object.assign(fn=>typeof fn==='function'?fn(state):state,{getState:()=>state,subscribe:()=>()=>{}})}
function load(file,mocks={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,{module:m,exports:m.exports,require:n=>{if(n in mocks)return mocks[n];if(n==='axios')return require(n);if(n.endsWith('authStore'))return auth;if(n.endsWith('/enums'))return {RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}};if(n==='./storageHelper')return{saveToStorage(){},STORAGE_KEYS:{TRIAGE_CASES:'cases'}};if(n==='./triageProjectEligibility')return{};throw Error('Missing mock '+n)},crypto:webcrypto,sessionStorage:storage,AbortController,URLSearchParams,setTimeout(){},console});return m.exports}
const old='AAAAAAAAAAE=',next='AAAAAAAAAAI=',caseRow=(id,reports,extra={})=>({id,projectId:'p',status:'OPEN',version:old,reportIds:reports,...extra}),response=data=>({data,headers:{etag:'"'+data.version+'"'}})
const client={get:async url=>{gets.push(url);if(failGet)throw Error('GET unavailable');return response(rows[url.split('/').pop()])},post:async(url,body,config)=>{posts.push({url,body,headers:config.headers});if(failPost)throw failPost;const id=url.split('/')[2];if(url.endsWith('publications')){rows[id]={...rows[id],version:next};return response({id:'publication',caseId:id,status:'PUBLISHED',version:next})}if(url.endsWith('report-links')){for(const sourceId of Object.keys(body.sourceCaseVersions)){rows[sourceId]={...rows[sourceId],reportIds:rows[sourceId].reportIds.filter(r=>!body.reportIds.includes(r)),status:'LINKED',version:next}}rows[id]={...rows[id],reportIds:[...new Set([...rows[id].reportIds,...body.reportIds])],version:next};return response(rows[id])}rows[id]={...rows[id],reportIds:['r1'],version:next};rows.created=caseRow('created',['r2'],{version:next});return response(rows.created)}}
const service=()=>load('src/api/services/triageService.ts',{'../client':{apiClient:client}}).triageService
function reset(){journal.clear();posts=[];gets=[];rows={master:caseRow('master',['r1','r2']),source:caseRow('source',['r2'])};failPost=null;failGet=false;state={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1}}
let count=0;async function test(name,fn){reset();await fn();console.log('PASS '+name);count++}
const publish={summary:'Public summary',reportIds:['r1'],version:old}

// Runs the production state -> action -> service -> intake snapshot chain with isolated HTTP.
function publicationHarness() {
  const a='11111111-1111-4111-8111-111111111111', b='22222222-2222-4222-8222-222222222222'
  rows[a]=caseRow(a,['r1','r2']); rows[b]=caseRow(b,['r3'])
  let query=new URLSearchParams('caseId='+a), slot=0, view
  const values=[],effects=[]
  const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useRef(initial){const i=slot++;return values[i]||(values[i]={current:initial})},useMemo:fn=>fn(),useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
  const react={__esModule:true,default:hooks,...hooks},s=service()
  const readService={...s,getTriageProjects:async()=>[{id:'p',code:'P',name:'Project'}],getCases:async()=>Promise.all([a,b,...(rows.created?['created']:[])].map(id=>s.getCaseById(id))),pendingTriage:()=>null}
  const triage={'../../../api/services/triageService':{...load('src/api/services/triageService.ts',{'../client':{apiClient:client}}),triageService:readService}}
  const intake=load('src/pages/(pm)/ai-review/useCaseIntake.ts',{react,...triage,'react-router-dom':{useSearchParams:()=>[query,v=>query=v]},'../../../api/services/triageProjectEligibility':{readEligibleTriageProjects:async()=>[]}})
  const actions=load('src/pages/(pm)/ai-review/useAIReviewActions.ts',{react,...triage,'react-router-dom':{useNavigate:()=>()=>{}},'./useAIReviewSurveyActions':{useAIReviewSurveyActions:()=>({})},'../../../api/services/caseNoDefectService':{caseNoDefectService:{pending:()=>null}}})
  const module=load('src/pages/(pm)/ai-review/useAIReviewState.ts',{react,'./useCaseIntake':intake,'./useAIReviewActions':actions,'./useCaseEvidenceRequest':{useCaseEvidenceRequest:()=>({})},'./useAIReviewFilters':{useAIReviewFilters:()=>({filteredCases:[]})},'./useAIReviewDrawer':{useAIReviewDrawer:()=>({})},'./useAIReviewLinkActions':load('src/pages/(pm)/ai-review/useAIReviewLinkActions.ts',{react,...triage})})
  const render=()=>{slot=0;view=module.useAIReviewState();for(const effect of effects)if(effect?.pending){effect.pending=false;effect.cleanup?.();effect.cleanup=effect.fn()}return view}
  const flush=async()=>{for(let i=0;i<20;i++){await Promise.resolve();render()}}
  const open=()=>{view.handleOpenPublishModal();render();view.setPublishPublicNote('Public summary');render()}
  return{a,b,render,flush,open,get view(){return view},close(){effects.forEach(e=>e?.cleanup?.())}}
}

;(async()=>{
await test('API021 sends only selected recipient, explicit empty evidence/defects, validates receipt and GET',async()=>{const result=await service().publishCase('master',publish);assert.equal(result.is_published,true);assert.equal(posts.length,1);assert.deepEqual(JSON.parse(JSON.stringify(posts[0].body)),{summary:publish.summary,reportIds:['r1'],evidenceIds:[],defectIds:[]});assert.equal(posts[0].headers['If-Match'],'"'+old+'"');assert.equal(journal.size,0);assert.equal(gets.length,2)})
await test('API021 invalid/empty recipients and blank summary never POST',async()=>{for(const input of [{...publish,reportIds:[]},{...publish,reportIds:['foreign']},{...publish,summary:''}])await assert.rejects(service().publishCase('master',input));assert.equal(posts.length,0)})
await test('API021 timeout/F5 replay retains key/body/version and rejects changed intent',async()=>{failPost=Error('timeout');await assert.rejects(service().publishCase('master',publish));const key=posts[0].headers['Idempotency-Key'];await assert.rejects(service().publishCase('master',{...publish,reportIds:['r2']}));assert.equal(posts.length,1);failPost=null;await service().publishCase('master',publish);assert.equal(posts[1].headers['Idempotency-Key'],key);assert.equal(JSON.stringify(posts[1].body),JSON.stringify(posts[0].body))})
await test('API021 receipt then GET failure/F5 performs only GET on confirmation',async()=>{const original=client.post;client.post=async(...args)=>{const r=await original(...args);failGet=true;return r};try{await assert.rejects(service().publishCase('master',publish));assert.equal(journal.size,1);failGet=false;await service().publishCase('master',publish);assert.equal(posts.length,1);assert.equal(journal.size,0)}finally{client.post=original}})
await test('malformed publication receipt remains held and never claims success/reposts',async()=>{const original=client.post;client.post=async(...args)=>{const r=await original(...args);r.data.caseId='wrong';return r};try{await assert.rejects(service().publishCase('master',publish));await assert.rejects(service().publishCase('master',publish));assert.equal(posts.length,1);assert.equal(journal.size,1)}finally{client.post=original}})
await test('API022 uses actual source Report IDs/sourceCaseVersions and GET verifies membership',async()=>{rows.master=caseRow('master',['r1']);const result=await service().linkDuplicateReports('master',['source'],'duplicate');assert.equal(result.success,true);assert.equal(posts[0].body.sourceCaseVersions.source,old);assert.equal(posts[0].body.reportIds[0],'r2');assert.equal(journal.size,0)})
await test('API022 cross-project/self/empty source reject before POST',async()=>{rows.source.projectId='foreign';await assert.rejects(service().linkDuplicateReports('master',['source'],'duplicate'));await assert.rejects(service().linkDuplicateReports('master',['master'],'duplicate'));assert.equal(posts.length,0)})
await test('API023 uses Report reference and verifies both source/new Case',async()=>{await service().splitReport('master','r2','split');assert.equal(posts[0].body.reportIds[0],'r2');assert.ok(gets.includes('/cases/created'));assert.equal(journal.size,0)})
await test('API023 foreign/last Report and blank reason never POST',async()=>{await assert.rejects(service().splitReport('master','foreign'));rows.master.reportIds=['r1'];await assert.rejects(service().splitReport('master','r1'));assert.equal(posts.length,0)})
await test('PM-only API020/021/022/023, including stale handler, never POST for Sup',async()=>{state.user.role='SUPERVISOR';const s=service();for(const run of [()=>s.concludeCase('master',{outcome:'NEEDS_EVIDENCE'}),()=>s.publishCase('master',publish),()=>s.linkDuplicateReports('master',['source'],'duplicate'),()=>s.splitReport('master','r2')])await assert.rejects(run());assert.equal(posts.length,0)})
await test('definitive 412 exposes error and never automatically retries',async()=>{failPost={response:{status:412,data:{code:'concurrency_conflict'}}};await assert.rejects(service().splitReport('master','r2'));assert.equal(posts.length,1);assert.equal(journal.size,0)})
await test('production link caller opens existing modal, confirms exact selected cases and refreshes server list',async()=>{let values=[],cursor=0,called=[],listed;const hooks={...React,useRef:v=>({current:v}),useState:v=>{const i=cursor++;if(!(i in values))values[i]=v;return[values[i],n=>values[i]=typeof n==='function'?n(values[i]):n]}};const module=load('src/pages/(pm)/ai-review/useAIReviewLinkActions.ts',{react:{__esModule:true,default:hooks,...hooks},'../../../api/services/triageService':{getCaseSessionKey:()=> 'same',triageService:{pendingD2:()=>null,linkDuplicateReports:async(...args)=>called.push(args),getCases:async()=>['server']}}});const props={cases:[{id:'master',project_id:'p'},{id:'source',project_id:'p'}],setCases:v=>listed=v,selectedCaseId:'master',applyCaseReadback(){},filteredCases:[],showToast(){}};const render=()=>{cursor=0;return module.useAIReviewLinkActions(props)};let a=render();a.setSelectedReportIds(['master','source']);a=render();a.handleOpenLinkReportsModal();a=render();assert.equal(a.isLinkReportsModalOpen,true);a.setLinkAuditNotes('duplicate');a=render();await a.handleConfirmLinkReports();assert.equal(called[0][0],'master');assert.equal(called[0][1][0],'source');assert.equal(listed[0],'server')})
await test('API022/023 timeout reload preserves command identity without preparing new versions',async()=>{for(const action of ['link','split']){reset();failPost=Error('timeout');let s=service();const run=()=>action==='link'?s.linkDuplicateReports('master',['source'],'duplicate'):s.splitReport('master','r2','split');await assert.rejects(run());const original=posts[0];failPost=null;s=service();await run();assert.equal(posts[1].headers['Idempotency-Key'],original.headers['Idempotency-Key']);assert.equal(posts[1].headers['If-Match'],original.headers['If-Match']);assert.equal(JSON.stringify(posts[1].body),JSON.stringify(original.body))}})
await test('actor change during preparation cannot send any D2 mutation',async()=>{const original=client.get;client.get=async(...args)=>{const r=await original(...args);state={...state,user:{id:'sup',role:'SUPERVISOR'},authEpoch:2};return r};try{await assert.rejects(service().publishCase('master',publish));assert.equal(posts.length,0)}finally{client.get=original}})
await test('existing publication modal starts with no recipient selected and submits only the checked Report',async()=>{let cursor=0,values=[[{reportId:'r1',reporterDisplayName:'First'},{reportId:'r2',reporterDisplayName:'Second'}],[],'',false,0,false],sent;const hooks={...React,useEffect(){},useState:v=>{const i=cursor++;return[values[i]===undefined?v:values[i],n=>values[i]=typeof n==='function'?n(values[i]):n]}};const C=load('src/pages/(pm)/ai-review/PublishModal.tsx',{react:{__esModule:true,default:hooks,...hooks},'../../../api/services/caseReportService':{caseReportService:{}},'../../../api/services/triageService':{triageService:{}},'../../../components/ui/Icon':{Icon:()=>null}}).PublishModal;const props={isOpen:true,targetTriageCase:{id:'master',code:'Case'},publishPublicNote:'summary',onConfirmPublishResult:ids=>sent=ids};const render=()=>{cursor=0;return C(props)},nodes=x=>!x||typeof x!=='object'?[]:Array.isArray(x)?x.flatMap(nodes):[x,...nodes(x.props?.children)];let tree=render(),inputs=nodes(tree).filter(n=>n.type==='input');assert.equal(inputs.length,2);assert.ok(inputs.every(n=>n.props.checked===false));inputs[1].props.onChange({target:{checked:true}});tree=render();const confirm=nodes(tree).filter(n=>n.type==='button').pop();assert.equal(confirm.props.disabled,false);await confirm.props.onClick();assert.equal(sent.length,1);assert.equal(sent[0],'r2')})
await test('committed POST then timeout followed by retry 4xx never erases journal or changes identity',async()=>{
  const original=client.post
  try {
    for(const status of [403,400,401,404,409,412,422,428]) {
      reset();let attempt=0,receipt
      client.post=async(...args)=>{attempt++;if(attempt===1){receipt=await original(...args);throw Error('response lost after commit')}if(attempt===2){posts.push({url:args[0],body:args[1],headers:args[2].headers});throw {response:{status,data:{code:'replay_rejected'}}}};posts.push({url:args[0],body:args[1],headers:args[2].headers});return receipt}
      await assert.rejects(service().publishCase('master',publish))
      assert.equal(rows.master.version,next)
      const held=[...journal.values()][0],first=posts[0]
      await assert.rejects(service().publishCase('master',publish),e=>e.response.status===status)
      assert.equal(journal.size,1);assert.equal([...journal.values()][0],held)
      await assert.rejects(service().publishCase('master',{...publish,summary:'different intent'}))
      assert.equal(posts.length,2)
      await service().publishCase('master',publish)
      assert.equal(posts.length,3)
      for(const post of posts){assert.equal(post.headers['Idempotency-Key'],first.headers['Idempotency-Key']);assert.equal(post.headers['If-Match'],first.headers['If-Match']);assert.equal(JSON.stringify(post.body),JSON.stringify(first.body))}
      assert.equal(journal.size,0)
    }
  } finally {client.post=original}
})
await test('first publication readback updates the real open intake snapshot; next publication uses its new version',async()=>{
  const h=publicationHarness()
  try{h.render();await h.flush();assert.equal(h.view.intake.selected.version,old)
    h.open();await h.view.handleConfirmPublishResult(['r1']);h.render()
    assert.equal(h.view.intake.selected.version,next);assert.equal(h.view.selectedCase.version,next);assert.equal(h.view.intake.selected.is_published,true);assert.equal(h.view.cases.find(c=>c.id===h.a).version,next)
    h.open();await h.view.handleConfirmPublishResult(['r1']);h.render()
    assert.equal(posts.length,2);assert.equal(posts[1].headers['If-Match'],'"'+next+'"')
  }finally{h.close()}
})
await test('publication response from Case A cannot replace B or close its modal after switching Case',async()=>{
  const h=publicationHarness(),original=client.post;let release
  try{h.render();await h.flush();h.open()
    client.post=async(...args)=>{const receipt=await original(...args);await new Promise(resolve=>release=resolve);return receipt}
    const pending=h.view.handleConfirmPublishResult(['r1']);await h.flush();assert.equal(typeof release,'function')
    h.view.intake.openCase(h.b);h.render();await h.flush();h.open();const selected=h.view.intake.selected
    release();await pending;h.render()
    assert.equal(h.view.intake.selected,selected);assert.equal(h.view.selectedCase.id,h.b);assert.equal(h.view.isPublishModalOpen,true);assert.equal(h.view.targetTriageCase.id,h.b);assert.equal(h.view.toastMessage,null)
  }finally{client.post=original;h.close()}
})
await test('publication response from a previous session cannot replace the current intake snapshot',async()=>{
  const h=publicationHarness(),original=client.post;let release
  try{h.render();await h.flush();h.open()
    client.post=async(...args)=>{const receipt=await original(...args);await new Promise(resolve=>release=resolve);return receipt}
    const pending=h.view.handleConfirmPublishResult(['r1']);await h.flush();state={...state,authEpoch:2};h.render();await h.flush();const selected=h.view.intake.selected
    release();await pending;h.render()
    assert.equal(h.view.intake.selected,selected);assert.equal(h.view.toastMessage,null)
  }finally{client.post=original;h.close()}
})
await test('split synchronizes real intake snapshot and list with GET source and receipt-created Case; no F5 needed',async()=>{
 const h=publicationHarness();try{h.render();await h.flush();await h.view.handleUnlinkReport('r2');h.render();assert.equal(posts.length,1);assert.equal(h.view.intake.selected.version,next);assert.equal(h.view.intake.selected.report_ids.length,1);assert.equal(h.view.intake.selected.report_ids[0],'r1');const created=h.view.cases.find(c=>c.id==='created');assert.equal(created.case_status,'OPEN');assert.equal(created.report_ids[0],'r2');assert.equal(h.view.selectedCase.version,next)}finally{h.close()}
})
await test('link updates currently open source Case to server LINKED history, not OPEN; list and drawer agree',async()=>{
 const h=publicationHarness();try{h.render();await h.flush();h.view.setSelectedReportIds([h.a,h.b]);h.render();h.view.setLinkMasterCaseId(h.b);h.view.setLinkAuditNotes('Test history');h.render();await h.view.handleConfirmLinkReports();h.render();assert.equal(posts.length,1);assert.equal(h.view.intake.selected.case_status,'LINKED');assert.equal(h.view.intake.selected.version,next);assert.equal(h.view.intake.selected.report_ids.length,0);assert.equal(h.view.cases.find(c=>c.id===h.b).report_ids.length,3);assert.equal(h.view.intake.selected.status_label,'Hồ sơ nguồn đã chuyển phản ánh')}finally{h.close()}
})
await test('late split response cannot replace the new Case selection or its list',async()=>{
 const h=publicationHarness(),original=client.post;let release;try{h.render();await h.flush();client.post=async(...args)=>{const receipt=await original(...args);await new Promise(resolve=>release=resolve);return receipt};const pending=h.view.handleUnlinkReport('r2');const checked=assert.rejects(pending,/Hồ sơ\/phiên đã thay đổi/);await h.flush();h.view.intake.openCase(h.b);h.render();await h.flush();const selected=h.view.intake.selected,list=h.view.cases;release();await checked;h.render();assert.equal(h.view.intake.selected,selected);assert.equal(h.view.cases,list)}finally{client.post=original;h.close()}
})
await test('Case summary never borrows Reporter name/contact/description from aggregate Case fields',()=>{
 const {renderToStaticMarkup}=require('react-dom/server'),react={__esModule:true,default:React,...React};const C=load('src/pages/(pm)/ai-review/DrawerReporterInfo.tsx',{react,'../../../components/ui/Icon':{Icon:()=>null}}).DrawerReporterInfo;const html=renderToStaticMarkup(React.createElement(C,{selectedCase:{id:'c',code:'#CAS-C',case_status:'LINKED',source:'UNKNOWN',reporter_name:'wrong aggregate name',reporter_phone:'wrong-phone',description:'wrong aggregate description',verification_method:'DRONE',project_id:'p',project_name:'Real project',source_label:'Unknown'}}));assert.ok(!html.includes('wrong aggregate'));assert.ok(!html.includes('wrong-phone'));assert.ok(!html.includes('Xem từng phản ánh'));assert.ok(html.includes('LINKED'));assert.ok(html.includes('DRONE'));assert.ok(html.includes('Real project'))
})
await test('each Report keeps its own stored description including raw JSON; wrong-Case rows excluded and LINKED empty state explains history',()=>{
 const {renderToStaticMarkup}=require('react-dom/server'),react={__esModule:true,default:React,...React},raw='{"description":"stored text","evidence":[{"fileId":"stored-file"}]}';let media={caseId:'c',reports:[{caseId:'c',reportId:'r1',reporterDisplayName:'First',description:raw,originalEvidence:[],supplements:[]},{caseId:'other',reportId:'foreign',reporterDisplayName:'Foreign',description:'wrong Case data',originalEvidence:[],supplements:[]}]};const C=load('src/pages/(pm)/ai-review/DrawerReportDetails.tsx',{react,'../../../api/services/triageService':{triageService:{pendingD2:()=>null}},'./useCaseReportMedia':{useCaseReportMedia:()=>media,reportError:e=>e.message}}).DrawerReportDetails;const html=renderToStaticMarkup(React.createElement(C,{caseId:'c',caseStatus:'OPEN'}));assert.ok(html.includes('data-report-id="r1"'));assert.ok(!html.includes('wrong Case data'));assert.ok(html.includes('&quot;description&quot;'));assert.ok(html.includes('stored-file'));assert.ok(!html.includes('Thông Tin Hồ Sơ'));media={caseId:'c',reports:[]};const empty=renderToStaticMarkup(React.createElement(C,{caseId:'c',caseStatus:'LINKED'}));assert.ok(empty.includes('LINKED lưu lịch sử'));assert.ok(empty.includes('không khôi phục hồ sơ này'))
})
await test('Case version readback reloads Report membership without F5 and rejects the previous media scope',async()=>{
 let slot=0,version='v1',reads=0,result=[{caseId:'c',reportId:'r1',originalEvidence:[],supplements:[]}],view;const values=[],effects=[];
 const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],v=>values[i]=typeof v==='function'?v(values[i]):v]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}};
 const C=load('src/pages/(pm)/ai-review/useCaseReportMedia.tsx',{react:{__esModule:true,default:hooks,...hooks},'../../../api/services/caseReportService':{caseReportService:{read:async()=>{reads++;return result}}},'../../../components/ui/Icon':{Icon:()=>null}}).useReportMediaState;
 const render=()=>{slot=0;view=C('c',version);for(const e of effects)if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.fn()}},flush=async()=>{for(let i=0;i<5;i++){await Promise.resolve();render()}};
 render();await flush();assert.equal(view.reports.length,1);result=[...result,{caseId:'c',reportId:'r2',originalEvidence:[],supplements:[]}];version='v2';render();assert.equal(view.reportsLoading,true);assert.equal(view.reports.length,0);await flush();assert.equal(reads,2);assert.equal(view.reports.length,2);effects.forEach(e=>e?.cleanup?.())
})
console.log(`${count} D2 checks PASS; live mutations NOT_RUN`)
})().catch(e=>{console.error(e);process.exit(1)})
