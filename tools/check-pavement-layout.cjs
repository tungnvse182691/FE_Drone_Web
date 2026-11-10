const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),ts=require('typescript'),{webcrypto}=require('crypto')
const plain=x=>JSON.parse(JSON.stringify(x)),project='p',pins={projectId:project,roadSectionId:'road',routeVersionId:'route',segmentSetId:'set',lengthMeters:10}
const editor={stripWidthMeters:'3.5',slabLengthM:'5',slabThicknessCm:'5.25',contractionSpacingM:'4.75',expansionSpacingM:'20.125',expansionGapMm:'0'}
const widths=[{fromOffsetMeters:0,toOffsetMeters:10,widthMeters:7}]
function fixture(input){return{id:'layout',projectId:project,routeVersionId:'route',segmentSetId:'set',kind:'PLANNED',contentHash:'a'.repeat(64),layout:plain(input.layout),geometry:{displayToleranceMeters:input.displayToleranceMeters,plan:{analyticLengthMeters:10,cells:[{sequence:1,fromOffsetMeters:0,toOffsetMeters:5,fromLateralMeters:0,toLateralMeters:3.5}]},slabs:[{key:'1',plannedSequence:1,lengthMeters:5,widthMeters:3.5,footprint:[{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:1,y:1}]}]}}}
function environment(){
 const storage=new Map(),calls=[],cache=new Map(),state={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1,isAuthenticated:true}
 let result,readError=false,createError=false,delay=null
 const client={async post(url,body,options){calls.push({method:'POST',url,body:plain(body),key:options.headers['Idempotency-Key']});if(delay)await delay;if(createError)throw Error('timeout');return{data:result||fixture(body)}},async get(url,options){calls.push({method:'GET',url,options});if(readError)throw Error('GET failed');if(url.endsWith('/work-package'))return{data:{projectId:project,status:'ACTIVE',roadSections:[{roadSectionId:'road',currentVersionId:'route'}]}};if(url.endsWith('/geometry'))return{data:{projectId:project,roadSectionId:'road',routeVersionId:'route',engineeringSrid:32648,stationOriginMeters:0,lengthMeters:10}};if(url.endsWith('/pavement-layouts'))return{data:{items:[],nextCursor:null}};if(url.endsWith('/segment-sets'))return{data:{items:[{id:'set',routeVersionId:'route',status:'PUBLISHED'}],nextCursor:null}};if(url.endsWith('/segment-sets/set'))return{data:{id:'set',routeVersionId:'route',status:'PUBLISHED'}};return{data:result}}}
 const auth={useAuthStore:Object.assign(()=>state,{getState:()=>state,subscribe(){}})},mocks={'../../../api/services/alignmentService':{utm48NToWgs84:(x,y)=>[x/100000,y/100000]},'../client':{apiClient:client},'../../store/authStore':auth,'../../../store/authStore':auth,'../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'../../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'./alignmentService':{alignmentService:{readProjectContext:async p=>(await client.get('/projects/'+p+'/work-package')).data,readConfirmedGeometry:async(p,r,v)=>(await client.get(`/projects/${p}/road-sections/${r}/versions/${v}/geometry`)).data}}}
 function load(file){file=path.normalize(file);if(cache.has(file))return cache.get(file);const module={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;cache.set(file,module.exports);vm.runInNewContext(code,{module,exports:module.exports,require(n){if(n in mocks)return mocks[n];return load(path.join(path.dirname(file),n+'.ts'))},console,Error,document:{createElement:()=>({})},URLSearchParams,crypto:webcrypto,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});return module.exports}
 const service=load('src/api/services/pavementService.ts').pavementService,commands=load('src/api/services/pavementCommands.ts')
 return{service,commands,storage,calls,state,mocks,load,client,setResult:v=>result=v,setReadError:v=>readError=v,setCreateError:v=>createError=v,setDelay:v=>delay=v}
}
let count=0;async function test(name,run){if(process.env.RG_PAVEMENT_FILTER&&!new RegExp(process.env.RG_PAVEMENT_FILTER,'i').test(name))return;await run();console.log('PASS '+name);count++}
;(async()=>{
await test('payload maps editor decimals with no rounding, zero gap and optional absence',()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1)
 assert.equal(input.layout.slabThicknessCentimeters,5.25);assert.equal(input.layout.expansionJointGapMillimeters,0);assert.equal(input.layout.expansionJointSpacingMeters,20.125);assert.equal(input.displayToleranceMeters,.1)
 const optional=e.commands.pavementInput({...editor,slabThicknessCm:'',contractionSpacingM:NaN,expansionSpacingM:' ',expansionGapMm:''},widths,10,.1)
 assert.ok(!('slabThicknessCentimeters'in optional.layout));assert.ok(!('expansionJointGapMillimeters'in optional.layout));assert.deepEqual(plain(input.layout.widthProfile),widths)
})
await test('validation blocks invalid numbers, residual strips, gaps and wrong coverage without changing design',()=>{
 const e=environment(),build=(ed=editor,w=widths,l=10,t=.1)=>e.commands.pavementInput(ed,w,l,t)
 for(const value of ['abc','Infinity','0','-1','',Infinity])assert.throws(()=>build({...editor,slabLengthM:value}))
 assert.throws(()=>build({...editor,expansionGapMm:'-1'}));assert.throws(()=>build(editor,widths,10,''));assert.throws(()=>build({...editor,stripWidthMeters:'3'}),/chia hết/)
 assert.throws(()=>build(editor,[{...widths[0],fromOffsetMeters:.1}]));assert.throws(()=>build(editor,[{...widths[0],toOffsetMeters:9}]));assert.equal(widths[0].widthMeters,7)
 assert.doesNotThrow(()=>build({...editor,stripWidthMeters:'.1'},[{...widths[0],widthMeters:.3}]))
})
await test('discovery uses scoped server route and published sets; empty/ambiguous or wrong refs block',async()=>{
 const e=environment();assert.deepEqual(plain(await e.service.discover(project)),pins)
 const get=e.client.get;e.client.get=async(url,o)=>url.endsWith('/segment-sets')?{data:{items:[],nextCursor:null}}:get(url,o)
 await assert.rejects(e.service.discover(project),/0 set/);assert.equal(e.calls.filter(x=>x.method==='POST').length,0)
 e.client.get=async(url,o)=>url.endsWith('/segment-sets')?{data:{items:[{id:'set',routeVersionId:'other',status:'PUBLISHED'}]}}:get(url,o)
 await assert.rejects(e.service.discover(project),/không thuộc/)
})
await test('publication pins reject explicit wrong/draft sets and duplicate publications without writes',async()=>{
 const e=environment();await assert.rejects(e.service.discover(project,'road','route','draft-on-screen'),/Reference segment set/);assert.equal(e.calls.filter(c=>c.method==='POST').length,0)
 const get=e.client.get;e.client.get=async(url,o)=>url.endsWith('/segment-sets')?{data:{items:[{id:'set',routeVersionId:'route',status:'PUBLISHED'},{id:'second',routeVersionId:'route',status:'PUBLISHED'}]}}:get(url,o);await assert.rejects(e.service.discover(project,'road','route'),/nhiều segment set PUBLISHED/)
})
await test('layout list paginates exact pins; empty distinct from API/schema/scope/cursor errors',async()=>{
 const e=environment(),row={layoutId:'a',projectId:project,roadSectionId:'road',routeVersionId:'route',segmentSetId:'set',kind:'PLANNED',sourcePlanId:null,createdAt:'2026-11-10T01:00:00Z',contentHash:'a'.repeat(64)},calls=[]
 e.client.get=async(url,options)=>{calls.push({url,options});return{data:options.params.cursor?{items:[{...row,layoutId:'b',kind:'AS_BUILT',sourcePlanId:'a'}],nextCursor:null}:{items:[row],nextCursor:'a'}}}
 const result=await e.service.list(pins);assert.equal(result.length,2);assert.equal(calls[1].options.params.cursor,'a');assert.match(calls[0].url,/road-sections\/road\/versions\/route\/segment-sets\/set\/pavement-layouts$/)
 e.client.get=async()=>({data:{items:[],nextCursor:null}});assert.equal((await e.service.list(pins)).length,0)
 for(const bad of [{...row,projectId:'other'},{...row,roadSectionId:'other'},{...row,routeVersionId:'other'},{...row,segmentSetId:'other'},{...row,kind:'UNKNOWN'}]){e.client.get=async()=>({data:{items:[bad],nextCursor:null}});await assert.rejects(e.service.list(pins),/reference/)}
 e.client.get=async()=>({data:{items:[],nextCursor:'repeat'}});await assert.rejects(e.service.list(pins),/Cursor/)
 e.client.get=async()=>{throw Object.assign(Error('403'),{response:{status:403}})};await assert.rejects(e.service.list(pins),/403/)
})
await test('layout discovery hook auto-opens unique server reference and preserves multi-choice explicit historical ID; late scope rejected',async()=>{
 for(const mode of ['one','many','empty','error','late','draft','new','late-selection']){
  const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);e.setResult(fixture(input));let slot=0,view,query=new URLSearchParams('routeVersionId=route&segmentSetId=set'),id=project,finish;const values=[],effects=[]
  e.mocks.react={useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],n=>values[i]=typeof n==='function'?n(values[i]):n]},useRef(v){const i=slot++;return values[i]||(values[i]={current:v})},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
  e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=typeof next==='function'?next(query):next]}
  if(mode==='draft')query.set('segmentSetId','draft-on-screen');if(mode==='new')query.delete('segmentSetId')
  const row={layoutId:'layout',projectId:project,roadSectionId:'road',routeVersionId:'route',segmentSetId:'set',kind:'PLANNED',sourcePlanId:null,createdAt:'2026-11-10T01:00:00Z',contentHash:'a'.repeat(64)}
  e.service.list=async()=>{if(mode==='late'||mode==='late-selection')return new Promise(r=>finish=r);if(mode==='error')throw Object.assign(Error('503'),{response:{status:503}});return mode==='empty'?[]:mode==='many'?[row,{...row,layoutId:'other'}]:[row]}
  const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow,render=()=>{slot=0;view=hook(id,'road',editor,widths,false,true,()=>{},()=>{});for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}},flush=async()=>{for(let i=0;i<35;i++){await Promise.resolve();render()}}
  render();await flush()
  if(mode==='one'){assert.equal(query.get('layoutId'),'layout');assert.equal(view.snapshot.id,'layout');assert.ok(view.display)}
  if(mode==='many'){assert.equal(query.get('layoutId'),null);assert.equal(view.layouts.length,2);view.openLayout('layout');render();await flush();assert.equal(query.get('layoutId'),'layout');assert.equal(view.snapshot.id,'layout')}
  if(mode==='empty')assert.equal(view.layoutDiscoveryMessage,'Chưa có layout')
  if(mode==='error'){assert.match(view.listError,/503/);assert.notEqual(view.layoutDiscoveryMessage,'Chưa có layout')}
  if(mode==='draft'||mode==='new'){assert.equal(query.get('segmentSetId'),mode==='draft'?'draft-on-screen':null);assert.equal(query.get('layoutId'),null);assert.equal(view.snapshot,null);assert.equal(view.layouts.length,0);query.set('segmentSetId','set');render();await flush();assert.equal(query.get('layoutId'),'layout');assert.equal(view.snapshot.id,'layout')}
  if(mode==='late-selection'){query.set('segmentSetId','draft-on-screen');render();finish([row]);await flush();assert.equal(query.get('segmentSetId'),'draft-on-screen');assert.equal(query.get('layoutId'),null);assert.equal(view.snapshot,null)}
  if(mode==='late'){id='other-project';render();finish([row]);await flush();assert.equal(query.get('layoutId'),null);assert.equal(view.layouts.length,0)}
  assert.equal(e.calls.filter(x=>x.method==='POST').length,0);effects.forEach(f=>f?.cleanup?.())
 }
})
await test('POST receipt then GET failure persists identity; retry only GETs and verifies server config/geometry',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);e.setResult(fixture(input));e.setReadError(true)
 await assert.rejects(e.commands.savePavement(project,{pins,input}),/GET failed/);assert.equal(e.commands.pendingPavement(project).receipt.id,'layout')
 e.setReadError(false);await e.commands.savePavement(project);assert.equal(e.calls.filter(x=>x.method==='POST').length,1);assert.equal(e.commands.pendingPavement(project),null)
})
await test('timeout retry keeps key and immutable payload; duplicate click cannot dispatch and new intent cannot replace pending',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);e.setCreateError(true)
 await assert.rejects(e.commands.savePavement(project,{pins,input}));input.layout.slabLengthMeters=99
 await assert.rejects(e.commands.savePavement(project,{pins,input}),/Command cũ/);e.setCreateError(false);e.setResult(fixture(e.commands.pendingPavement(project).input));await e.commands.savePavement(project)
 const writes=e.calls.filter(x=>x.method==='POST');assert.equal(writes.length,2);assert.equal(writes[0].key,writes[1].key);assert.deepEqual(writes[0].body,writes[1].body);assert.equal(writes[1].body.layout.slabLengthMeters,5)
 const other=environment(),body=other.commands.pavementInput(editor,widths,10,.1);let release;other.setDelay(new Promise(r=>release=r));const first=other.commands.savePavement(project,{pins,input:body});await assert.rejects(other.commands.savePavement(project,{pins,input:body}),/Đang/);release();other.setResult(fixture(body));await first;assert.equal(other.calls.filter(x=>x.method==='POST').length,1)
})
await test('explicit revised input after definitive rejection gets a new key; timeout/receipt cannot be discarded',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1),post=e.client.post
 e.client.post=async(...args)=>{await post(...args);throw Object.assign(Error('invalid'),{response:{status:422}})}
 await assert.rejects(e.commands.savePavement(project,{pins,input}));const old=e.commands.pendingPavement(project);assert.equal(old.rejected,true)
 e.commands.revisePavement(project);e.client.post=post;const revised={...input,layout:{...input.layout,slabLengthMeters:4}};e.setResult(fixture(revised));await e.commands.savePavement(project,{pins,input:revised})
 const writes=e.calls.filter(x=>x.method==='POST');assert.notEqual(writes[0].key,writes[1].key);assert.equal(writes[0].body.layout.slabLengthMeters,5);assert.equal(writes[1].body.layout.slabLengthMeters,4)
 const uncertain=environment();uncertain.setCreateError(true);await assert.rejects(uncertain.commands.savePavement(project,{pins,input}));assert.throws(()=>uncertain.commands.revisePavement(project),/không được/)
})
await test('readback mismatch and malformed server cells/codes/footprints never report success or POST twice',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1),result=fixture(input);result.layout.expansionJointGapMillimeters=2;e.setResult(result)
 await assert.rejects(e.commands.savePavement(project,{pins,input}),/không khớp/);await assert.rejects(e.commands.savePavement(project));assert.equal(e.calls.filter(x=>x.method==='POST').length,1)
 const invalid=fixture(input);invalid.geometry.slabs[0].plannedSequence=99;assert.throws(()=>e.commands.verifyPavementGeometry(invalid))
})
await test('AS_BUILT uses sourcePlanId for config; absent planned fields remain absent, cross-project/source pins fail',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1),source=fixture(input),built={...source,id:'built',kind:'AS_BUILT',sourcePlanId:'layout',layout:null}
 e.client.get=async url=>({data:url.endsWith('/built')?built:source});const value=await e.service.readConfiguration(project,'built');assert.equal(value.snapshot.kind,'AS_BUILT');assert.equal(value.configuration.id,'layout')
 e.client.get=async()=>({data:{...source,projectId:'wrong'}});await assert.rejects(e.service.read(project,'layout'),/sai project/)
})
await test('actor/epoch fences prevent an old command accepting results or new actor borrowing journal',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);let release;e.setDelay(new Promise(r=>release=r));const request=e.commands.savePavement(project,{pins,input});e.state.authEpoch++;release();await assert.rejects(request,/Phiên/)
 e.state.user={id:'sup',role:'SUPERVISOR'};assert.equal(e.commands.pendingPavement(project),null);await assert.rejects(e.commands.savePavement(project,{pins,input}),/Chỉ PM/)
})
await test('F5 hook hydrates server fields/tolerance, Sup reads without writes and old project response is fenced',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);delete input.layout.slabThicknessCentimeters;e.setResult(fixture(input));e.state.user.role='SUPERVISOR'
 let slot=0,changed=false,view,projectId=project,query=new URLSearchParams('layoutId=layout'),restored=[],deferred
 const values=[],effects=[];e.mocks.react={useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],next=>{const n=typeof next==='function'?next(values[i]):next;if(!Object.is(n,values[i])){values[i]=n;changed=true}}]},useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=typeof next==='function'?next(query):next]}
 const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 const restore=layout=>restored.push(layout)
 function render(){for(let i=0;i<15;i++){changed=false;slot=0;view=hook(projectId,'road',editor,widths,false,true,restore,()=>{});for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}if(!changed)return}throw Error('did not settle')}
 async function flush(){for(let i=0;i<25;i++){await Promise.resolve();render()}}
 render();await flush();assert.equal(view.snapshot.id,'layout');assert.equal(restored.at(-1).slabThicknessCentimeters,undefined);assert.equal(restored.at(-1).expansionJointGapMillimeters,0);assert.match(view.disabledReason,/Chỉ PM/);assert.equal(e.calls.filter(x=>x.method==='POST').length,0)
 const oldRead=e.service.readConfiguration;e.service.readConfiguration=()=>new Promise(r=>deferred=r);query=new URLSearchParams('layoutId=late');render();const old=deferred;projectId='q';query=new URLSearchParams();render();old({snapshot:fixture(input),configuration:fixture(input)});await flush();assert.equal(view.snapshot,null);assert.equal(restored.length,1);assert.equal(e.calls.filter(x=>x.method==='POST').length,0)
})
await test('PM hook save keeps layoutId in scoped URL after verified readback without resetting the editor',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);e.setResult(fixture(input));e.storage.set('unused','not a tolerance default')
 let slot=0,changed=false,view,query=new URLSearchParams(),restored=[];const values=[],effects=[]
 e.mocks.react={useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],next=>{const n=typeof next==='function'?next(values[i]):next;if(!Object.is(n,values[i])){values[i]=n;changed=true}}]},useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=typeof next==='function'?next(query):next]}
 const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 function render(){for(let i=0;i<15;i++){changed=false;slot=0;view=hook(project,'road',editor,widths,false,true,x=>restored.push(x),()=>{});for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}if(!changed)return}throw Error('did not settle')}
 async function flush(){for(let i=0;i<25;i++){await Promise.resolve();render()}}
 query=new URLSearchParams('routeVersionId=route&segmentSetId=draft-on-screen')
 const oldCommand={key:'held-key',pins:{...pins,segmentSetId:'old-published'},input:heldInputPlaceholder(),rejected:true}
 function heldInputPlaceholder(){return e.commands.pavementInput(editor,widths,10,.1)}
 const journal='rg_pavement_command_pm_'+project,raw=JSON.stringify(oldCommand);e.storage.set(journal,raw)
 render();await flush();assert.equal(e.storage.get(journal),raw);assert.equal(view.pending.pins.segmentSetId,'old-published');assert.equal(e.calls.filter(x=>x.method==='POST').length,0);e.storage.delete(journal);view.retry();render();await flush();assert.equal(query.get('segmentSetId'),'draft-on-screen');assert.match(view.scopeMessage,/segment set set đã PUBLISHED/);assert.equal(view.disabledReason,'');assert.equal(e.calls.filter(x=>x.method==='POST').length,0);await view.save();render();await flush()
 assert.equal(query.get('layoutId'),'layout');assert.equal(query.get('routeVersionId'),'route');assert.equal(query.get('segmentSetId'),'set');assert.equal(e.calls.filter(x=>x.method==='POST').length,1);assert.equal(view.pending,null)
 assert.equal(restored.length,0);assert.equal(view.snapshot.id,'layout');assert.equal(view.disabledReason,'')
})
await test('saved snapshot uses server widths/codes/footprints for map list HUD; unsupported CRS fails without synthesis',()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.37),snapshot=fixture(input)
 const build=e.load('src/pages/(pm)/alignment/savedPavementDisplay.ts').buildSavedPavement
 const localWidths=[{...widths[0],widthMeters:99}]
 const view=build(snapshot,input.layout,32648,1000)
 assert.equal(view.segments[0].roadWidthM,7);assert.equal(localWidths[0].widthMeters,99)
 assert.equal(view.slabs[0].id,snapshot.geometry.slabs[0].key);assert.equal(view.slabs[0].lengthM,5)
 assert.equal(view.preview.slabsGeoJSON.features[0].properties.id,view.slabs[0].id)
 assert.deepEqual(plain(view.preview.slabsGeoJSON.features[0].geometry.coordinates[0][0]),[.00001,.00001])
 assert.equal(view.preview.slabsGeoJSON.features.length,view.slabs.length);assert.equal(view.preview.jointsGeoJSON.features.length,0);assert.match(view.label,/.37/)
 assert.throws(()=>build(snapshot,input.layout,32649,0),/adapter/);assert.equal(snapshot.geometry.slabs[0].footprint[0].x,1)
})
await test('layout retry reissues GET after error, preserves server tolerance and rejects late responses and newer PM edits',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.37),snapshot=fixture(input)
 let slot=0,changed=false,view,id=project,revision=0,query=new URLSearchParams('layoutId=layout'),restored=[],fail=true,reads=0,resolve
 e.service.readConfiguration=async()=>{reads++;if(fail)throw Error('network');return{snapshot,configuration:snapshot}}
 const values=[],effects=[];e.mocks.react={useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],next=>{const n=typeof next==='function'?next(values[i]):next;if(!Object.is(n,values[i])){values[i]=n;changed=true}}]},useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=typeof next==='function'?next(query):next]};const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 function render(){for(let i=0;i<20;i++){changed=false;slot=0;view=hook(id,'road',editor,widths,false,true,x=>restored.push(x),()=>{},revision);for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}if(!changed)return}throw Error('settle')}
 async function flush(){for(let i=0;i<35;i++){await Promise.resolve();render()}}
 render();await flush();assert.match(view.error,/network/);assert.equal(view.loading,false);assert.equal(restored.length,0)
 fail=false;view.retry();render();await flush();assert.equal(reads,2);assert.equal(view.error,'');assert.equal(view.display.slabs.length,1);assert.equal(restored.length,1)
 assert.match(view.display.label,/.37/);e.setResult(fixture({...input,displayToleranceMeters:.1}));await view.save();render();await flush();const write=e.calls.find(x=>x.method==='POST');assert.equal(write.body.displayToleranceMeters,.1)
 revision++;render();assert.ok(view.display);assert.match(view.message,/Chưa đủ quan hệ/)
 e.service.readConfiguration=()=>new Promise(r=>resolve=r);view.retry();render();const late=resolve;revision++;render();late({snapshot,configuration:snapshot});await flush();assert.equal(restored.length,1);assert.ok(view.display)
 query=new URLSearchParams('layoutId=other');render();const old=resolve;id='other-project';query=new URLSearchParams();render();old({snapshot,configuration:snapshot});await flush();assert.equal(view.snapshot,null);assert.equal(view.display,null)
})
await test('PLANNED preview uses authoritative metric offsets, never haversine; incomplete/native chainage keeps snapshot',()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.37),snapshot=fixture(input),build=e.load('src/pages/(pm)/alignment/savedPavementDisplay.ts').buildSavedPavement
 const route={projectId:project,routeVersionId:'route',stationOriginMeters:1000,lengthMeters:10,metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500004,1000000],[500010,1000000]]}}
 const view=build(snapshot,input.layout,32648,1000,route);assert.equal(view.previewReady,true);assert.deepEqual(plain(view.kmPoints),[1,1.004,1.01]);assert.equal(view.previewCoordinates.length,3)
 const plan=e.load('src/pages/(pm)/alignment/alignmentPavementHelpers.ts').planMainlinePavement
 assert.ok(plan(view.segments,{stripWidthMeters:3.5,slabLenM:2}).slabs.length>view.slabs.length);assert.equal(view.slabs.length,1);assert.equal(snapshot.geometry.slabs[0].lengthMeters,5)
 assert.equal(build(snapshot,input.layout,32648,1000,{...route,lengthMeters:12}).previewReady,false)
 assert.equal(build(snapshot,input.layout,32648,1000,{...route,crsProfileRevisionId:'native'}).previewReady,false)
 assert.equal(build(snapshot,input.layout,32648,null,route).previewReady,false)
})
await test('snapshot popup binds actual cell/slab metadata and escapes missing values; AS_BUILT accepts plan null with real footprint',()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.37),snapshot=fixture(input),build=e.load('src/pages/(pm)/alignment/savedPavementDisplay.ts').buildSavedPavement,popup=e.load('src/pages/(pm)/alignment/alignmentSlabPopup.ts').slabPopupValues
 const view=build(snapshot,input.layout,32648,1000),p=view.preview.slabsGeoJSON.features[0].properties,text=popup(p)
 assert.equal(p.fromLateralMeters,0);assert.equal(p.toLateralMeters,3.5);assert.match(text.station,/1000–1005/);assert.match(text.lane,/0–3.5/);assert.match(text.status,/Đã lưu trên máy chủ.*layout/);assert.ok(!text.status.includes('Preview'));assert.ok(!JSON.stringify(text).includes('undefined'))
 const built={...snapshot,kind:'AS_BUILT',layout:null,geometry:{...snapshot.geometry,plan:null,slabs:[{...snapshot.geometry.slabs[0],plannedSequence:null,lengthMeters:null,widthMeters:null}]}}
 const actual=build(built,input.layout,32648,1000);assert.equal(actual.slabs.length,1);assert.deepEqual(plain(actual.preview.slabsGeoJSON.features[0].geometry.coordinates),plain(view.preview.slabsGeoJSON.features[0].geometry.coordinates))
 const unknown=popup(actual.preview.slabsGeoJSON.features[0].properties);assert.equal(unknown.station,'Chưa có dữ liệu');assert.match(unknown.dimensions,/Chưa có dữ liệu/);assert.ok(!JSON.stringify(unknown).includes('undefined'));assert.ok(!Number.isFinite(actual.slabs[0].lengthM))
 assert.throws(()=>build({...snapshot,geometry:{...snapshot.geometry,plan:null}},input.layout,32648,0),/cells/)
 assert.match(popup({code:'<script>'}).code,/&lt;script&gt;/);assert.match(popup({}).status,/Preview/)
})
await test('actual slab click handler uses snapshot status/layoutId and missing AS_BUILT values without undefined',()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.37),snapshot=fixture(input),build=e.load('src/pages/(pm)/alignment/savedPavementDisplay.ts').buildSavedPavement
 let html='',selected;class Marker{setLngLat(){return this}addTo(){return this}remove(){}}
 class Popup{setLngLat(){return this}setHTML(s){html=s;return this}addTo(){return this}remove(){}}
 e.mocks['maplibre-gl']={Marker,Popup}
 const handlers={},map={on(event,layer,fn){if(typeof layer==='string')handlers[event+layer]=fn},getZoom:()=>19,flyTo(){}}
 e.load('src/pages/(pm)/alignment/alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,{current:null},id=>selected=id)
 const saved=build(snapshot,input.layout,32648,1000).preview.slabsGeoJSON.features[0]
 handlers['clickslabs-fill-layer']({features:[saved],originalEvent:{},lngLat:{lng:1,lat:1}})
 assert.match(html,/Đã lưu trên máy chủ/);assert.match(html,/layoutId: layout/);assert.match(html,/1000–1005/);assert.match(html,/Vị trí dải ngang/);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('Preview — chưa lưu'))
 const built={...snapshot,kind:'AS_BUILT',geometry:{...snapshot.geometry,plan:null,slabs:[{...snapshot.geometry.slabs[0],plannedSequence:null,lengthMeters:null,widthMeters:null}]}}
 const actual=build(built,null,32648).preview.slabsGeoJSON.features[0]
 handlers['clickslabs-fill-layer']({features:[actual],originalEvent:{},lngLat:{lng:1,lat:1}})
 assert.match(html,/Chưa có dữ liệu/);assert.ok(!html.includes('undefined'));assert.ok(selected)
})
await test('confirmed metric-only restore uses adapter and exact engineering station origin; WGS server preferred without mutation',()=>{
 const e=environment();e.mocks['./alignmentImportHelpers']={previewCenterlineCoordinates:(coords,srid)=>{assert.equal(srid,32648);return coords.map(([x,y])=>[x/100000,y/100000])}};const build=e.load('src/pages/(pm)/alignment/confirmedGeometryDisplay.ts').confirmedGeometryDisplay
 // Load real supported adapter dependencies via this harness.
 const metric=[[500000,1000000],[500003,1000004],[500006,1000008]],route={projectId:project,roadSectionId:'road',routeVersionId:'route',sourceDraftId:'draft',metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:1234.123456789,lengthMeters:10,widthProfile:widths,metricCenterline:{type:'LineString',coordinates:metric}}
 const before=JSON.stringify(route),result=build(route);assert.equal(result.coordinates.length,3);assert.deepEqual(plain(result.kmPoints),metric.map((_,i)=>(route.stationOriginMeters+i*5)/1000));assert.equal(JSON.stringify(route),before)
 const server={type:'LineString',coordinates:result.coordinates.map(p=>[p[0]+1e-8,p[1]])},preferred=build({...route,wgs84Centerline:server});assert.deepEqual(plain(preferred.coordinates),server.coordinates)
 const unsupported=build({...route,engineeringSrid:32649,sourceCrs:32649});assert.equal(unsupported.coordinates.length,0);assert.match(unsupported.warnings.join(' '),/32649/)
 const missing=build({...route,stationOriginMeters:null});assert.equal(missing.kmPoints.length,0);assert.match(missing.warnings.join(' '),/stationOriginMeters/)
 assert.equal(build({...route,crsProfileRevisionId:'native'}).kmPoints.length,0);assert.equal(build({...route,lengthMeters:12}).kmPoints.length,0)
})
console.log(`${count} pavement scoped groups PASS (mock HTTP/hooks, not live persistence).`)
})().catch(error=>{console.error(error);process.exitCode=1})
