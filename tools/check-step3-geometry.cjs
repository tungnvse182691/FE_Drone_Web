const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript'),{webcrypto}=require('crypto')
let epoch=1;const listeners=[]
const auth={useAuthStore:Object.assign(selector=>selector({authEpoch:epoch}),{getState:()=>({authEpoch:epoch}),subscribe:fn=>listeners.push(fn)})}
function load(file,mocks={}){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8').replaceAll('import.meta.env','({})'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require:n=>{if(n in mocks)return mocks[n];if(n.endsWith('/authStore'))return auth;if(n==='./projectService')return{projectService:{}};throw Error('Missing '+n)},console,crypto:webcrypto,localStorage:{getItem:()=>null},sessionStorage:{getItem:()=>null},setTimeout,clearTimeout,AbortController,URLSearchParams});return module.exports}
const ok=data=>({data,headers:{etag:'"AAAAAAAAAAE="'}})
const service=client=>load('src/api/services/alignmentService.ts',{'../client':{apiClient:client}}).alignmentService
let count=0;async function test(name,run){epoch=1;await run();console.log('PASS '+name);count++}
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
 view.openDraft('22222222-2222-4222-8222-222222222222');assert.equal(query.get('draftId'),'22222222-2222-4222-8222-222222222222')
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
console.log(`${count} Step 3 scoped scenarios PASS (mock/hooks/static; NOT E2E).`)
})().catch(e=>{console.error(e);process.exitCode=1})
