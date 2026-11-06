const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript'),{webcrypto}=require('crypto')
let epoch=1,actor={id:'pm',role:'PROJECT_MANAGER'};const listeners=[]
const auth={useAuthStore:Object.assign(selector=>selector?selector({authEpoch:epoch,user:actor,isAuthenticated:true}):{authEpoch:epoch,user:actor,isAuthenticated:true},{getState:()=>({authEpoch:epoch,user:actor,isAuthenticated:true}),subscribe:fn=>listeners.push(fn)})}
function load(file,mocks={}){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8').replaceAll('import.meta.env','({})'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require:n=>{if(n==='react'&&n in mocks)return {useRef:v=>({current:v}),useEffect(){},...mocks[n]};if(n in mocks)return mocks[n];if(n.endsWith('/geometryCommandErrors'))return load('src/api/services/geometryCommandErrors.ts');if(n.endsWith('/authStore'))return auth;if(n==='./projectService')return{projectService:{}};throw Error('Missing '+n)},console,Error,FileReader:mocks.__FileReader,crypto:webcrypto,localStorage:{getItem:()=>null},sessionStorage:mocks.__sessionStorage||{getItem:()=>null,setItem(){},removeItem(){}},setTimeout,clearTimeout,AbortController,URLSearchParams});return module.exports}
const ok=data=>({data,headers:{etag:'"AAAAAAAAAAE="'}})
const service=client=>load('src/api/services/alignmentService.ts',{'../client':{apiClient:client}}).alignmentService
let count=0;async function test(name,run){epoch=1;actor={id:'pm',role:'PROJECT_MANAGER'};await run();console.log('PASS '+name);count++}
;(async()=>{
await test('CRS failure/wrong project/null never becomes empty; no automatic checksum profile',async()=>{
 for(const data of [null,{},[{projectId:'other'}]])await assert.rejects(service({get:async()=>ok(data)}).fetchCrsProfiles('p'))
 assert.equal((await service({get:async()=>ok([])}).fetchCrsProfiles('p')).length,0)
 let posts=0;await assert.rejects(service({post:()=>posts++}).ensureUtm48NCrsProfile('p'),/provenance/);assert.equal(posts,0)
})
await test('draft identity/version is server-owned and epoch fences old cached draft',async()=>{
 const s=service({get:async()=>ok({id:'d',projectId:'p',version:'AAAAAAAAAAE='})});assert.equal((await s.getGeometryDraft('p','d')).etag,'"AAAAAAAAAAE="')
 await assert.rejects(s.getGeometryDraft('other','d'),/sai/)
 const stale=service({get:async()=>{epoch++;return ok({id:'d',projectId:'p'})}});await assert.rejects(stale.getGeometryDraft('p','d'),/Phiên/);assert.equal(stale.getActiveDraftInfo('p'),undefined)
})
await test('readiness/context malformed payload propagates errors rather than claiming ready',async()=>{
 await assert.rejects(service({get:async()=>ok({ready:true})}).readDraftReadiness('p','d'),/contract/)
 await assert.rejects(service({get:async()=>ok({projectId:'other',roadSections:[]})}).readProjectContext('p'),/contract/)
})
await test('read model keeps draft when readiness fails; old project/epoch cannot replace it',async()=>{
 const React=require('react');let slot=0,id='a',query=new URLSearchParams('draftId=11111111-1111-4111-8111-111111111111'),view
 const values=[],effects=[],calls=[]
 const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={setup,deps,cleanup:old?.cleanup,pending:true}}}
 const alignmentService={fetchCrsProfiles:async()=>[],getGeometryDraft:(projectId,draftId)=>new Promise((resolve,reject)=>calls.push({projectId,draftId,resolve,reject})),readDraftReadiness:async()=>{throw Error('unavailable')},readProjectContext:async projectId=>({projectId,roadSections:[]})}
 const hook=load('src/pages/(pm)/alignment/useGeometryReadModel.ts',{react:hooks,'react-router-dom':{useSearchParams:()=>[query,next=>query=next]},'../../../api/client':{apiClient:{get:async()=>ok({items:[{projectId:'a'},{projectId:'b'}]})}},'../../../api/services/alignmentService':{alignmentService}}).useGeometryReadModel
 const render=()=>{slot=0;view=hook(id);effects.forEach(e=>{if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}})}
 const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();render()}
 render();id='b';render();calls[1].resolve({data:{id:calls[1].draftId,projectId:'b'}});await flush();assert.equal(view.draft.data.projectId,'b');assert.ok(view.draftError);assert.equal(view.readiness,null)
 calls[0].resolve({data:{id:calls[0].draftId,projectId:'a'}});await flush();assert.equal(view.draft.data.projectId,'b')
 epoch++;render();calls[2].reject(Error('old'));await flush();assert.equal(view.draft,null)
 view.openGeometry('road-from-server','version-from-server');assert.equal(query.get('roadSectionId'),'road-from-server');assert.equal(query.get('routeVersionId'),'version-from-server');view.openDraft('22222222-2222-4222-8222-222222222222');assert.equal(query.get('draftId'),'22222222-2222-4222-8222-222222222222');assert.equal(query.get('routeVersionId'),null)
 effects.forEach(e=>e?.cleanup?.())
})
await test('GeoJSON inspection preserves vertices and unknown CRS without axis guesses or generated segments',async()=>{
 const parser=load('src/pages/(pm)/alignment/alignmentImportHelpers.ts',{'./data':{SEGMENT_COLORS:[]},'./alignmentGeometryHelpers':{smoothRoadPolyline(){throw Error('must not smooth')}}})
 const coords=[[500000,1000000],[500000,1000000],[500020,1000010]]
 const value=parser.inspectGeoJsonCenterline(JSON.stringify({type:'LineString',coordinates:coords}));assert.equal(JSON.stringify(value.coords),JSON.stringify(coords));assert.ok(value.sourceCrs.includes('UNKNOWN'));assert.equal(value.estimatedLengthMeters,null);assert.equal(value.adjacentDuplicates,1)
 await assert.rejects(async()=>parser.inspectGeoJsonCenterline(JSON.stringify({type:'MultiLineString',coordinates:[coords]})))
})
await test('active editor cannot restore or publish local approval; manual/preset imports do not manufacture engineering facts',async()=>{
 const state=fs.readFileSync('src/pages/(pm)/alignment/useAlignmentState.ts','utf8')
 for(const text of ['getAlignmentState(', 'getAlignmentData(', 'saveAlignmentData(', 'updateProjectAlignment(', 'wgs84ToUtm48N'])assert.ok(!state.includes(text),text)
 const React=require('react');let message='';let writes=0
 const hook=load('src/pages/(pm)/alignment/useAlignmentImportState.ts',{react:{useState:v=>[v,()=>{}]},'maplibre-gl':{},'./alignmentImportHelpers':{inspectGeoJsonCenterline:()=>({coords:[]})}}).useAlignmentImportState
 const model=hook({defaultManualText:'',showToast:m=>message=m,onAutoSave:()=>writes++,setSegments:()=>writes++,setSlabs:()=>writes++,setCurrentCoords:()=>writes++})
 model.processManualCoordinates('[[1,2],[3,4]]');assert.ok(message.includes('chưa lưu server'));model.handleLoadPreset('sample',1);assert.equal(writes,0)
})
await test('map panel rejects missing metrics in main/all/branch paths while valid dimensions/counts remain correct',async()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
 const C=load('src/pages/(pm)/alignment/AlignmentMap.tsx',{react:{__esModule:true,default:React,...React},'lucide-react':new Proxy({},{get:()=>()=>null}),'./AlignmentMapLegend':{AlignmentMapLegend:()=>null},'./alignmentGeometryHelpers':{calculateCoordsLengthKm:()=>0}}).AlignmentMap
 const base={mapContainerRef:{current:null},mapRef:{current:null},mapLayer:'VECTOR',cursorPos:{lat:NaN,lng:NaN,elevation:'Chưa có dữ liệu',station:''},segments:[],importedLengthKm:NaN,slabLengthM:NaN,slabThicknessCm:NaN,contractionSpacingM:NaN,expansionSpacingM:NaN,expansionGapMm:NaN,selectedSegmentId:'ALL'}
 const render=patch=>renderToStaticMarkup(React.createElement(C,{...base,...patch}))
 const missing=html=>{assert.ok(html.includes('Chưa có dữ liệu'));for(const text of ['NaN','Infinity','W = 8.0m','-4.0m','+4.0m','~400 tấm','5.0m ×','mỗi 50m'])assert.ok(!html.includes(text),text)}
 for(const value of [NaN,null,undefined,Infinity,-Infinity]) {
   const seg={id:'s',code:'S',roadWidthM:value,lengthKm:value}
   for(const selectedSegmentId of ['s','ALL','unknown']) missing(render({segments:[seg],selectedSegmentId,slabLengthM:value,slabThicknessCm:value,contractionSpacingM:value,expansionSpacingM:value,expansionGapMm:value}))
   for(const selectedSegmentId of ['s','ALL','unknown']) missing(render({selectedTargetType:'b',currentBranch:{id:'b',code:'B',roadWidthM:value,lengthKm:value,segments:[seg]},selectedSegmentId}))
   missing(render({branches:[{id:'b',code:'B',roadWidthM:value,lengthKm:value}],selectedSegmentId:'b'}))
 }
 const valid={slabLengthM:10,slabThicknessCm:24,contractionSpacingM:6,expansionSpacingM:60,expansionGapMm:15}
 const a={id:'a',code:'A',roadWidthM:12,lengthKm:0.1},b={id:'b',code:'B',roadWidthM:6,lengthKm:0.2}
 let html=render({...valid,segments:[a],selectedSegmentId:'a'});for(const text of ['W = 12.0m','-6.0m','+6.0m','10.0m × 6.0m × 24cm','~20 tấm','15mm','mỗi 60m','Co: 6m'])assert.ok(html.includes(text),text)
 html=render({...valid,segments:[a,b]});assert.ok(html.includes('W = 8.0m'));assert.ok(html.includes('~60 tấm'))
 html=render({...valid,selectedTargetType:'branch',currentBranch:{id:'branch',code:'R',segments:[a]}});assert.ok(html.includes('W = 12.0m'));assert.ok(html.includes('~20 tấm'))
 html=render({...valid,selectedTargetType:'branch',currentBranch:{id:'branch',code:'R',segments:[],roadWidthM:12},importedLengthKm:99});assert.ok(!html.includes('~')); // never borrow mainline length for an unknown branch
 html=render({...valid,segments:[a,{...b,roadWidthM:NaN}]});assert.ok(!html.includes('W = 8.0m'));assert.ok(!html.includes('~60 tấm'))
})
await test('GeoJSON import preserves syntax/ambiguity/geometry/CRS/validation errors and handles reader failures without writes',async()=>{
 const parser=load('src/pages/(pm)/alignment/alignmentImportHelpers.ts',{'./data':{SEGMENT_COLORS:[]},'./alignmentGeometryHelpers':{}})
 let reader,message='',writes=0
 class Reader{constructor(){reader=this}readAsText(){}}
 const make=inspector=>load('src/pages/(pm)/alignment/useAlignmentImportState.ts',{react:{useState:v=>[v,()=>{}]},'maplibre-gl':{},'./alignmentImportHelpers':{inspectGeoJsonCenterline:inspector,GeoJsonValidationError:parser.GeoJsonValidationError},__FileReader:Reader}).useAlignmentImportState({defaultManualText:'',showToast:m=>message=m,onAutoSave:()=>writes++,setSegments:()=>writes++,setCurrentCoords:()=>writes++})
 const model=make(parser.inspectGeoJsonCenterline)
 const line={type:'Feature',geometry:{type:'LineString',coordinates:[[1,2],[3,4]]},properties:{}}
 for(const [input,expected] of [['{',/sai cú pháp JSON/],[JSON.stringify({type:'FeatureCollection',features:[line,line]}),/đúng một Centerline/],[JSON.stringify({type:'FeatureCollection',features:[]}),/Không chọn được tim tuyến/],[JSON.stringify({type:'FeatureCollection',features:[{...line,properties:{type:'RoadEdge'}}]}),/Không chọn được tim tuyến/],[JSON.stringify({type:'Polygon',coordinates:[]}),/Geometry không hỗ trợ/],[JSON.stringify({type:'MultiLineString',coordinates:[]}),/Geometry không hỗ trợ/],[JSON.stringify({type:'LineString',coordinates:[[1,2],[3,4]],crs:{name:'unverified'}}),/chưa xác minh/],[JSON.stringify({type:'LineString',coordinates:[[1,2]]}),/2–100000/]]) {
  model.processGeoJSONFile({});reader.onload({target:{result:input}});assert.match(message,expected)
 }
 model.processGeoJSONFile({});reader.onerror();assert.match(message,/Không đọc được tệp/)
 model.processGeoJSONFile({});reader.onabort();assert.match(message,/hủy đọc/)
 model.processGeoJSONFile({});reader.onload({target:{result:null}});assert.match(message,/Không đọc được nội dung/)
 for(const error of [null,Error('Unexpected internal failure'),new TypeError('Unexpected shape')]){const unknown=make(()=>{throw error});unknown.processGeoJSONFile({});reader.onload({target:{result:'{}'}});assert.match(message,/Không thể kiểm tra nội dung/)}
 const sync=load('src/pages/(pm)/alignment/useAlignmentImportState.ts',{react:{useState:v=>[v,()=>{}]},'maplibre-gl':{},'./alignmentImportHelpers':parser,__FileReader:class{readAsText(){throw Error('read failure')}}}).useAlignmentImportState({defaultManualText:'',showToast:m=>message=m});sync.processGeoJSONFile({});assert.match(message,/Không đọc được tệp/)
 model.processGeoJSONFile({});reader.onload({target:{result:JSON.stringify({type:'LineString',coordinates:[[1,2],[3,4]]})}});assert.match(message,/CRS UNKNOWN/);assert.equal(writes,0)
})

const roles={PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}
const draftInput={sourceKind:'COORDINATES',sourceCrs:32648,stationOriginMeters:0,coordinates:[{x:500000,y:1000000},{x:500100,y:1000000}],widthProfile:[{fromOffsetMeters:0,toOffsetMeters:100,widthMeters:6}],surveyWidthMeters:10,changeReason:'Hồ sơ đo đã kiểm',roadCode:'R'}
const dto={id:'11111111-1111-4111-8111-111111111111',projectId:'p',roadSectionId:'road',status:'DRAFT',sourceKind:'COORDINATES',version:'AAAAAAAAAAE=',stationOriginMeters:0,surveyWidthMeters:10,widthProfile:draftInput.widthProfile,originalCoordinates:draftInput.coordinates}
const storage=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}
const commands=(client,journal=storage())=>load('src/api/services/geometryDraftCommands.ts',{'./alignmentService':{alignmentService:service(client)},'../../types/enums':{RoleCode:roles},__sessionStorage:journal})
const fail=(status,code)=>Object.assign(Error(code),{response:{status,data:{code}}})
await test('create timeout/F5 holds key/body and explicit retry; another intent or actor cannot borrow it',async()=>{
 const journal=storage(),posts=[];let timeout=true
 const client={post:async(url,body,config)=>{posts.push({url,body:JSON.stringify(body),key:config.headers['Idempotency-Key']});if(timeout)throw Error('timeout');return{...ok(dto),status:201}},get:async()=>ok(dto)}
 const c=commands(client,journal);await assert.rejects(c.runDraftCommand('p',{kind:'create',sectionId:'road',input:draftInput}),/timeout/)
 await assert.rejects(c.runDraftCommand('p',{kind:'create',sectionId:'road',input:{...draftInput,changeReason:'different'}}),/Yêu cầu cũ/);assert.equal(posts.length,1)
 actor={id:'other',role:'PROJECT_MANAGER'};assert.equal(c.pendingDraftCommand('p'),null);actor={id:'pm',role:'PROJECT_MANAGER'}
 const reloaded=commands(client,journal);assert.ok(reloaded.pendingDraftCommand('p'));assert.equal(posts.length,1);timeout=false
 const result=await reloaded.runDraftCommand('p');assert.equal(result.draft.data.id,dto.id);assert.deepEqual(posts[0],posts[1]);assert.ok(posts[0].url.includes('/road-sections/road/geometry-drafts'));assert.equal(reloaded.pendingDraftCommand('p'),null)
})
await test('201 with readback503 keeps receipt and retry never POSTs again',async()=>{
 let writes=0,broken=true;const c=commands({post:async()=>{writes++;return{...ok(dto),status:201}},get:async()=>{if(broken)throw fail(503,'dependency_unavailable');return ok(dto)}})
 await assert.rejects(c.runDraftCommand('p',{kind:'create',sectionId:'road',input:draftInput}),e=>!!e.receipt)
 assert.ok(c.pendingDraftCommand('p').receipt);broken=false;await c.runDraftCommand('p');assert.equal(writes,1)
})
await test('update conflict preserves input/key and requires explicit new-version decision; exact If-Match',async()=>{
 const calls=[];let conflict=true
 const c=commands({put:async(url,body,config)=>{calls.push({body:JSON.stringify(body),headers:config.headers});if(conflict)throw fail(412,'concurrency_conflict');return ok({...dto,version:'AAAAAAAAAAI='})},get:async()=>ok({...dto,version:'AAAAAAAAAAI='})})
 await assert.rejects(c.runDraftCommand('p',{kind:'update',draftId:dto.id,etag:'"AAAAAAAAAAE="',input:draftInput}),e=>e.response.status===412)
 assert.equal(c.pendingDraftCommand('p').command.input.changeReason,draftInput.changeReason);await assert.rejects(c.runDraftCommand('p'),/phiên bản mới/);assert.equal(calls.length,1)
 c.acceptFreshDraftVersion('p');conflict=false;await c.runDraftCommand('p',{kind:'update',draftId:dto.id,etag:'"AAAAAAAAAAI="',input:draftInput})
 assert.equal(calls[0].headers['If-Match'],'"AAAAAAAAAAE="');assert.equal(calls[1].headers['If-Match'],'"AAAAAAAAAAI="');assert.notEqual(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);assert.equal(calls[0].body,calls[1].body)
})
await test('PM cannot confirm; Sup confirmation receipt/F5 readback is fenced and never resubmitted',async()=>{
 let writes=0,broken=true;const geometry={projectId:'p',roadSectionId:'road',routeVersionId:'route-new',sourceDraftId:dto.id,metadataStatus:'COMPLETE'}
 const c=commands({post:async(url,body,config)=>{writes++;assert.equal(body.expectedCurrentVersionId,'route-old');assert.equal(config.headers['If-Match'],'"AAAAAAAAAAE="');return{...ok(geometry),status:201}},get:async()=>{if(broken)throw fail(503,'read_failed');return ok(geometry)}})
 const intent={kind:'confirm',draftId:dto.id,etag:'"AAAAAAAAAAE="',input:{expectedCurrentVersionId:'route-old',effectiveFrom:'2026-11-07T01:00:00Z',reason:'Đối chiếu hồ sơ'}}
 await assert.rejects(c.runDraftCommand('p',intent),/Vai trò/);assert.equal(writes,0);actor={id:'sup',role:'SUPERVISOR'}
 await assert.rejects(c.runDraftCommand('p',intent),e=>!!e.receipt);broken=false;const result=await c.runDraftCommand('p');assert.equal(result.geometry.routeVersionId,'route-new');assert.equal(writes,1)
})
await test('late mutation after epoch change never returns accepted result or clears another session intent',async()=>{
 let finish;const c=commands({post:()=>new Promise(resolve=>finish=resolve)})
 const request=c.runDraftCommand('p',{kind:'create',sectionId:'road',input:draftInput});epoch++;finish({...ok(dto),status:201});await assert.rejects(request,/Phiên/);assert.ok(c.pendingDraftCommand('p'))
})
await test('coordinate form requires sourced matching EN/metre profile and never invents engineering data',async()=>{
 const module=load('src/pages/(pm)/alignment/useGeometryDraftWorkflow.ts',{react:{},'../../../types/enums':{RoleCode:roles},'../../../api/services/alignmentService':{alignmentService:{}},'../../../api/services/geometryDraftCommands':{}})
 const form={sectionId:'road',profileId:'profile',origin:'0',surveyWidth:'10',widths:'0, 100, 6',reason:'Đo từ hồ sơ'}
 const model={context:{projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',name:'Road'}]},profiles:[{id:'profile',projectId:'p',definition:{sourceSrid:32648,axisOrder:'EN',metresPerUnit:1,datum:'authority datum',projection:'authority projection',sourceReference:'authority document',sourceChecksum:'a'.repeat(64),sampleOnly:false}}]}
 const input=module.coordinateDraftInput(form,'500000, 1000000\n500100, 1000000',model);assert.equal(input.sourceCrs,32648);assert.equal(input.stationOriginMeters,0);assert.equal(input.widthProfile[0].widthMeters,6)
 assert.throws(()=>module.coordinateDraftInput(form,'1,2\n3,4',{...model,context:null}),/phạm vi tuyến/)
 for(const patch of [{axisOrder:'NE'},{metresPerUnit:0.001},{sourceSrid:32649},{sourceChecksum:''},{sampleOnly:true}]){const profiles=[{...model.profiles[0],definition:{...model.profiles[0].definition,...patch}}];assert.throws(()=>module.coordinateDraftInput(form,'500000,1000000\n500100,1000000',{...model,profiles}))}
 assert.throws(()=>module.coordinateDraftInput({...form,origin:''},'500000,1000000\n500100,1000000',model));assert.throws(()=>module.coordinateDraftInput({...form,widths:'0,99,6'},'500000,1000000\n500100,1000000',model))
})

await test('rejected HTTP retry keeps key until explicit input revision',async()=>{
 const keys=[];const c=commands({post:async(_,__,cfg)=>{keys.push(cfg.headers['Idempotency-Key']);throw fail(403,'access_forbidden')}})
 await assert.rejects(c.runDraftCommand('p',{kind:'create',sectionId:'road',input:draftInput}));await assert.rejects(c.runDraftCommand('p'));assert.equal(keys[0],keys[1]);assert.equal(c.pendingDraftCommand('p').rejected,true);c.reviseRejectedDraftCommand('p');assert.equal(c.pendingDraftCommand('p'),null)
})
await test('workflow fences create/update receipt-to-URL transition, previews without confirming and Sup confirms exact fresh snapshot',async()=>{
 const React=require('react');let slot=0,view,coords='',opened,confirmedRef;const values=[],effects=[],writes=[]
 const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={setup,deps,cleanup:old?.cleanup,pending:true}}}
 const model={draftId:'',draft:null,readiness:{ready:true,missingFields:[],errors:[]},profiles:[{id:'profile',projectId:'p',definition:{sourceSrid:32648,axisOrder:'EN',metresPerUnit:1,datum:'sourced',projection:'sourced',sourceReference:'test source',sourceChecksum:'a'.repeat(64),sampleOnly:false}}],context:{projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',name:'R',currentVersionId:'route-old'}]},retry(){},openDraft:id=>opened=id,openConfirmed:(id,geometry)=>confirmedRef={id,geometry},setReadiness:value=>model.readiness=value}
 let next=1
 const commandMock={pendingDraftCommand:()=>null,acceptFreshDraftVersion(){},reviseRejectedDraftCommand(){},runDraftCommand:async(_,intent)=>{writes.push(JSON.parse(JSON.stringify(intent)));if(intent.kind==='confirm')return{kind:'confirm',draftId:dto.id,geometry:{projectId:'p',roadSectionId:'road',routeVersionId:'route-new',sourceDraftId:dto.id}};return{kind:intent.kind,draft:{data:{...dto,version:next===1?'AAAAAAAAAAE=':'AAAAAAAAAAI='},etag:next++===1?'"AAAAAAAAAAE="':'"AAAAAAAAAAI="'}}}}
 const api={getGeometryDraft:async()=>model.draft,readDraftReadiness:async()=>model.readiness,readProjectContext:async()=>model.context,previewGeometryDraft:async()=>({lengthMeters:100,warnings:[]})}
 const hook=load('src/pages/(pm)/alignment/useGeometryDraftWorkflow.ts',{react:hooks,'../../../types/enums':{RoleCode:roles},'../../../api/services/alignmentService':{alignmentService:api},'../../../api/services/geometryDraftCommands':commandMock}).useGeometryDraftWorkflow
 const render=()=>{slot=0;view=hook('p',model,coords,text=>coords=text,()=>{});effects.forEach(e=>{if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}})}
 const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();render()}
 render();await flush();coords='500000,1000000\n500100,1000000';view.setForm({sectionId:'road',profileId:'profile',origin:'0',surveyWidth:'10',widths:'0,100,6',reason:'Tài liệu nguồn'});render();assert.equal(view.saveReason,'')
 const oldSave=view.save;await oldSave();await oldSave();assert.equal(writes.length,1);assert.equal(opened,dto.id);render();assert.match(view.saveReason,/Đang nạp/)
 model.draftId=dto.id;model.draft={data:{...dto},etag:'"AAAAAAAAAAE="'};render();await flush();view.setForm({...view.form,profileId:'profile',reason:'Bản nhập sửa'});render();const oldUpdate=view.save;await oldUpdate();await oldUpdate();assert.equal(writes.length,2);assert.equal(writes[1].kind,'update')
 model.draft={data:{...dto,version:'AAAAAAAAAAI='},etag:'"AAAAAAAAAAI="'};render();await flush();await view.loadPreview();await flush();assert.equal(writes.length,2);assert.ok(view.preview)
 actor={id:'sup',role:'SUPERVISOR'};epoch++;render();await flush();view.setEffectiveFrom('2026-11-07T10:00');view.setReason('Đã xem hồ sơ');render();await view.loadPreview();await flush();assert.equal(view.confirmReason,'');const confirm=view.confirm;await confirm();await confirm();assert.equal(writes.length,3);assert.equal(writes[2].kind,'confirm');assert.equal(writes[2].input.expectedCurrentVersionId,'route-old');assert.equal(writes[2].etag,'"AAAAAAAAAAI="');assert.equal(confirmedRef.geometry.routeVersionId,'route-new')
 effects.forEach(e=>e?.cleanup?.())
})
await test('late GeoJSON FileReader cannot replace another project/draft input',async()=>{
 let reader,messages=[],setInputs=0,refSlot=0,stateSlot=0;const refs=[]
 const React={useState:v=>{const i=stateSlot++;return[v,()=>{if(i===2)setInputs++}]},useRef:v=>refs[refSlot++]||(refs[refSlot-1]={current:v}),useEffect(){}}
 class Reader{constructor(){reader=this}readAsText(){}}
 const hook=load('src/pages/(pm)/alignment/useAlignmentImportState.ts',{react:React,'maplibre-gl':{},'./alignmentImportHelpers':{GeoJsonValidationError:class extends Error{},inspectGeoJsonCenterline:()=>({coords:[[1,2],[3,4]]})},__FileReader:Reader}).useAlignmentImportState
 const render=inputScope=>{refSlot=0;stateSlot=0;return hook({inputScope,defaultManualText:'',showToast:m=>messages.push(m)})}
 const a=render('epoch1:p:d1');a.processGeoJSONFile({});const old=reader;render('epoch2:q:d2');old.onload({target:{result:'{}'}});old.onerror();assert.equal(setInputs,0);assert.equal(messages.length,0)
})

await test('native edit is specifically blocked but preview remains usable; pending confirmation inputs restore after F5',async()=>{
 const React=require('react');let slot=0,view,held=null;const values=[],effects=[]
 const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={setup,deps,cleanup:old?.cleanup,pending:true}}}
 const model={draftId:dto.id,draft:{data:{...dto,sourceKind:'NATIVE_ALIGNMENT'},etag:'"AAAAAAAAAAE="'},context:{projectId:'p',roadSections:[{roadSectionId:'road',currentVersionId:'v'}]},profiles:[],readiness:{ready:true,missingFields:[],errors:[]},setReadiness(){},retry(){}}
 let previews=0
 const hook=load('src/pages/(pm)/alignment/useGeometryDraftWorkflow.ts',{react:hooks,'../../../types/enums':{RoleCode:roles},'../../../api/services/alignmentService':{alignmentService:{previewGeometryDraft:async()=>{previews++;return{lengthMeters:100}},readDraftReadiness:async()=>model.readiness}},'../../../api/services/geometryDraftCommands':{pendingDraftCommand:()=>held}}).useGeometryDraftWorkflow
 const render=()=>{slot=0;view=hook('p',model,'',()=>{},()=>{});effects.forEach(e=>{if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}})}
 const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();render()}
 render();await flush();assert.match(view.saveReason,/native/);await view.loadPreview();await flush();assert.equal(previews,1)
 held={key:'held',command:{kind:'confirm',draftId:dto.id,etag:'"AAAAAAAAAAE="',input:{expectedCurrentVersionId:'v',effectiveFrom:'2026-11-07T03:00:00Z',reason:'Lý do đã nhập trước F5'}}};actor={id:'sup',role:'SUPERVISOR'};epoch++;render();await flush();await flush();assert.equal(view.reason,'Lý do đã nhập trước F5');assert.ok(view.effectiveFrom);assert.ok(view.pending);let reference;model.openConfirmed=(id,geometry)=>reference={id,geometry};held={...held,receipt:{projectId:'p',roadSectionId:'road',routeVersionId:'confirmed-version',sourceDraftId:dto.id}};model.draftId='';model.draft=null;epoch++;render();await flush();assert.equal(reference.geometry.routeVersionId,'confirmed-version');assert.equal(view.preview,null);effects.forEach(e=>e?.cleanup?.())
})
await test('command never dispatches when browser cannot retain stable identity',async()=>{
 let writes=0;const c=commands({post:async()=>writes++},{getItem:()=>null,setItem(){throw Error('quota')},removeItem(){}})
 await assert.rejects(c.runDraftCommand('p',{kind:'create',sectionId:'road',input:draftInput}),/Không giữ được yêu cầu/);assert.equal(writes,0)
})
await test('first dispatch uses the same immutable payload that was journaled, even if caller changes its object',async()=>{
 let finish,observed;const input=JSON.parse(JSON.stringify(draftInput))
 const c=commands({post:async(_,body)=>{await new Promise(resolve=>finish=resolve);observed=body.changeReason;return{...ok(dto),status:201}},get:async()=>ok(dto)})
 const request=c.runDraftCommand('p',{kind:'create',sectionId:'road',input});input.changeReason='Changed after dispatch';finish();await request;assert.equal(observed,draftInput.changeReason)
})

function hydrateHarness(){
 const React=require('react');let slot=0,view,coords='',versionReads=0,held=null;const values=[],effects=[],writes=[]
 const hooks={...React,useState(initial){const i=slot++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={setup,deps,cleanup:old?.cleanup,pending:true}}}
 const model={draftId:dto.id,draft:{data:{...dto},etag:'"AAAAAAAAAAE="'},draftLoading:false,draftError:'',context:{projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',name:'R',currentVersionId:'route-old'}]},profiles:[{id:'profile',projectId:'p',definition:{sourceSrid:32648,axisOrder:'EN',metresPerUnit:1,datum:'sourced',projection:'sourced',sourceReference:'source',sourceChecksum:'a'.repeat(64),sampleOnly:false}}],readiness:{ready:true,missingFields:[],errors:[]},retry(){versionReads++;model.draft=null;model.draftLoading=true;model.draftError=''},openDraft(){},openConfirmed(){},setReadiness(){}}
 const notices=[]
 const api={getGeometryDraft:async()=>model.draft,readProjectContext:async()=>model.context,previewGeometryDraft:async()=>({lengthMeters:100}),readDraftReadiness:async()=>model.readiness}
 const commandMock={pendingDraftCommand:()=>held,acceptFreshDraftVersion(){held=null},reviseRejectedDraftCommand(){held=null},runDraftCommand:async(_,intent)=>{writes.push(intent);return{kind:'update',draft:{data:{...dto,version:'AAAAAAAAAAI='},etag:'"AAAAAAAAAAI="'}}}}
 const hook=load('src/pages/(pm)/alignment/useGeometryDraftWorkflow.ts',{react:hooks,'../../../types/enums':{RoleCode:roles},'../../../api/services/alignmentService':{alignmentService:api},'../../../api/services/geometryDraftCommands':commandMock}).useGeometryDraftWorkflow
 const render=()=>{slot=0;view=hook('p',model,coords,text=>coords=text,text=>notices.push(text));effects.forEach(e=>{if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.setup()}})}
 const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();render()}
 const prepare=async()=>{render();await flush();view.setForm({...view.form,profileId:'profile',reason:'Bản nhập chưa được quyết định'});render();return view}
 const hydrate=(etag)=>{model.draft={data:{...dto,version:etag.slice(1,-1),stationOriginMeters:999},etag};model.draftLoading=false;model.draftError='';render()}
 return{model,render,flush,prepare,hydrate,get view(){return view},get coords(){return coords},writes,notices,get reads(){return versionReads},setHeld:value=>held=value,unmount:()=>effects.forEach(e=>e?.cleanup?.())}
}
await test('saved V2 then hydrate a different opaque V3 releases busy without overwriting input, accepting it or writing again',async()=>{
 const h=hydrateHarness();await h.prepare();const save=h.view.save;await save();h.render();assert.equal(h.view.busy,true);assert.equal(h.writes.length,1)
 h.hydrate('"AAAAAAAAAAA="');await h.flush();assert.equal(h.view.busy,false);assert.equal(h.view.conflict,true);assert.equal(h.view.freshVersion,false);assert.equal(h.view.form.origin,'0');assert.equal(h.view.form.reason,'Bản nhập chưa được quyết định');assert.ok(h.coords.includes('500000'));assert.match(h.view.message,/phiên bản khác/);assert.ok(!h.view.saveReason.includes('Đang nạp'))
 await save();await h.view.save();assert.equal(h.writes.length,1);h.view.acceptVersion();h.render();assert.equal(h.view.conflict,true)
 await h.view.reviewConflict();await h.flush();h.hydrate('"AAAAAAAAAAA="');await h.flush();h.view.acceptVersion();h.render();assert.equal(h.view.conflict,false);assert.equal(h.view.form.origin,'0');assert.equal(h.writes.length,1);h.unmount()
})
await test('hydrate failure after save releases the latch; retry only reads and a later different version still requires a decision',async()=>{
 const h=hydrateHarness();await h.prepare();await h.view.save();h.render();h.model.draftLoading=false;h.model.draftError='mock read503';h.render();await h.flush();assert.equal(h.view.busy,false);assert.equal(h.view.hydrateReadError,true);assert.equal(h.view.form.reason,'Bản nhập chưa được quyết định');assert.match(h.view.message,/Đã lưu thành công nhưng chưa tải/)
 const reads=h.reads;h.view.retryHydrate();h.render();assert.equal(h.reads,reads+1);assert.equal(h.writes.length,1);assert.equal(h.view.busy,true);h.hydrate('"AAAAAAAAAAI="');await h.flush();assert.equal(h.view.busy,false);assert.equal(h.view.hydrateReadError,false);assert.match(h.view.message,/Đã đọc lại bản nháp đã lưu/);assert.equal(h.view.form.origin,'0');assert.equal(h.writes.length,1);h.unmount()
 const newer=hydrateHarness();await newer.prepare();await newer.view.save();newer.render();newer.model.draftLoading=false;newer.model.draftError='read failed';newer.render();await newer.flush();newer.view.retryHydrate();newer.render();newer.hydrate('\"AAAAAAAAAAM=\"');await newer.flush();assert.equal(newer.view.busy,false);assert.equal(newer.view.conflict,true);assert.equal(newer.view.form.origin,'0');assert.equal(newer.writes.length,1);newer.unmount()
})
await test('matching hydrate still fences repeated clicks and stale epoch outcomes cannot unlock a new scope',async()=>{
 const h=hydrateHarness();await h.prepare();const save=h.view.save;await save();await save();h.render();assert.equal(h.writes.length,1);assert.equal(h.view.busy,true);h.hydrate('"AAAAAAAAAAI="');await h.flush();assert.equal(h.view.busy,false);assert.equal(h.view.conflict,false);assert.equal(h.view.form.origin,'0')
 epoch++;h.render();await h.flush();h.model.draftLoading=false;h.model.draftError='late old error';h.render();await h.flush();assert.equal(h.view.hydrateReadError,false);assert.equal(h.writes.length,1);h.unmount()
})
await test('ProblemDetails codes distinguish CSRF, permissions, state/idempotency/version conflicts and never echo arbitrary error text',async()=>{
 const{geometryCommandErrorMessage:message}=load('src/api/services/geometryCommandErrors.ts')
 for(const[status,code,pattern]of [[422,'geometry_validation_failed',/hình học chưa hợp lệ/],[400,'validation_error',/chưa hợp lệ/],[403,'csrf_failed',/CSRF/],[403,'access_forbidden',/không có quyền/],[409,'project_closed',/Dự án đã đóng/],[409,'duplicate_request',/Khóa yêu cầu/],[409,'road_geometry_invalid_state',/Trạng thái bản nháp/],[409,'road_section_code_conflict',/Mã tuyến đã tồn tại/],[409,'road_section_concurrency_conflict',/Phiên bản tuyến/],[412,'concurrency_conflict',/Phiên bản/],[428,'validation_error',/Thiếu điều kiện/],[401,'auth_session_revoked',/không còn hiệu lực/]])assert.match(message(fail(status,code),true,null),pattern)
 assert.ok(!message(fail(403,'unknown'),true,null).includes('không có quyền'));assert.ok(!message(fail(409,'project_closed'),true,null).includes('Phiên bản'));assert.ok(!message(fail(409,'duplicate_request'),true,null).includes('Phiên bản'))
 assert.match(message(fail(401,'auth_unauthorized'),true,null),/chưa được xác thực/);assert.match(message(fail(401,'auth_unauthorized'),false,null),/không còn hiệu lực/)
 assert.match(message({code:'ERR_NETWORK',request:{}},true,null),/Không kết nối/);assert.match(message({code:'ERR_NETWORK'},true,{}),/Chưa rõ kết quả/);assert.match(message(fail(500,'internal_error'),true,{}),/Chưa rõ kết quả/)
 assert.match(message({receipt:dto,cause:fail(403,'access_forbidden')},true,{receipt:dto}),/đã tiếp nhận lệnh; chưa đọc/)
 const secret='STACK SECRET TOKEN';const result=message({message:secret,stack:secret,response:{status:409,data:{code:'unknown',detail:secret,title:secret}}},true,null);assert.ok(!result.includes(secret));assert.ok(!message(Error(secret),true,null).includes(secret))
})
console.log(`${count} Step 3 scoped scenarios PASS (mock/hooks/static; NOT E2E).`)
})().catch(e=>{console.error(e);process.exitCode=1})
