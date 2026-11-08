const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),ts=require('typescript'),{webcrypto}=require('crypto')
const plain=x=>JSON.parse(JSON.stringify(x)),project='p',pins={projectId:project,roadSectionId:'road',routeVersionId:'route',segmentSetId:'set',lengthMeters:10}
const editor={stripWidthMeters:'3.5',slabLengthM:'5',slabThicknessCm:'5.25',contractionSpacingM:'4.75',expansionSpacingM:'20.125',expansionGapMm:'0'}
const widths=[{fromOffsetMeters:0,toOffsetMeters:10,widthMeters:7}]
function fixture(input){return{id:'layout',projectId:project,routeVersionId:'route',segmentSetId:'set',kind:'PLANNED',contentHash:'a'.repeat(64),layout:plain(input.layout),geometry:{displayToleranceMeters:input.displayToleranceMeters,plan:{analyticLengthMeters:10,cells:[{sequence:1,fromOffsetMeters:0,toOffsetMeters:5,fromLateralMeters:0,toLateralMeters:3.5}]},slabs:[{key:'1',plannedSequence:1,lengthMeters:5,widthMeters:3.5,footprint:[{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:1,y:1}]}]}}}
function environment(){
 const storage=new Map(),calls=[],cache=new Map(),state={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1,isAuthenticated:true}
 let result,readError=false,createError=false,delay=null
 const client={async post(url,body,options){calls.push({method:'POST',url,body:plain(body),key:options.headers['Idempotency-Key']});if(delay)await delay;if(createError)throw Error('timeout');return{data:result||fixture(body)}},async get(url,options){calls.push({method:'GET',url,options});if(readError)throw Error('GET failed');if(url.endsWith('/work-package'))return{data:{projectId:project,status:'ACTIVE',roadSections:[{roadSectionId:'road',currentVersionId:'route'}]}};if(url.endsWith('/geometry'))return{data:{projectId:project,roadSectionId:'road',routeVersionId:'route',lengthMeters:10}};if(url.endsWith('/segment-sets'))return{data:{items:[{id:'set',routeVersionId:'route',status:'PUBLISHED'}],nextCursor:null}};if(url.endsWith('/segment-sets/set'))return{data:{id:'set',routeVersionId:'route',status:'PUBLISHED'}};return{data:result}}}
 const auth={useAuthStore:Object.assign(()=>state,{getState:()=>state,subscribe(){}})},mocks={'../client':{apiClient:client},'../../store/authStore':auth,'../../../store/authStore':auth,'../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'../../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'./alignmentService':{alignmentService:{readProjectContext:async p=>(await client.get('/projects/'+p+'/work-package')).data,readConfirmedGeometry:async(p,r,v)=>(await client.get(`/projects/${p}/road-sections/${r}/versions/${v}/geometry`)).data}}}
 function load(file){file=path.normalize(file);if(cache.has(file))return cache.get(file);const module={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;cache.set(file,module.exports);vm.runInNewContext(code,{module,exports:module.exports,require(n){if(n in mocks)return mocks[n];return load(path.join(path.dirname(file),n+'.ts'))},console,Error,URLSearchParams,crypto:webcrypto,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});return module.exports}
 const service=load('src/api/services/pavementService.ts').pavementService,commands=load('src/api/services/pavementCommands.ts')
 return{service,commands,storage,calls,state,mocks,load,client,setResult:v=>result=v,setReadError:v=>readError=v,setCreateError:v=>createError=v,setDelay:v=>delay=v}
}
let count=0;async function test(name,run){await run();console.log('PASS '+name);count++}
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
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=next]}
 const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 const restore=layout=>restored.push(layout)
 function render(){for(let i=0;i<15;i++){changed=false;slot=0;view=hook(projectId,'road',editor,widths,false,true,restore,()=>{});for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}if(!changed)return}throw Error('did not settle')}
 async function flush(){for(let i=0;i<25;i++){await Promise.resolve();render()}}
 render();await flush();assert.equal(view.snapshot.id,'layout');assert.equal(restored.at(-1).slabThicknessCentimeters,undefined);assert.equal(restored.at(-1).expansionJointGapMillimeters,0);assert.match(view.disabledReason,/Chỉ PM/);assert.equal(e.calls.filter(x=>x.method==='POST').length,0)
 const oldRead=e.service.readConfiguration;e.service.readConfiguration=()=>new Promise(r=>deferred=r);query=new URLSearchParams('layoutId=late');render();const old=deferred;projectId='q';query=new URLSearchParams();render();old({snapshot:fixture(input),configuration:fixture(input)});await flush();assert.equal(view.snapshot,null);assert.equal(restored.length,1);assert.equal(e.calls.filter(x=>x.method==='POST').length,0)
})
await test('PM hook save keeps layoutId in scoped URL after verified readback without resetting the editor',async()=>{
 const e=environment(),input=e.commands.pavementInput(editor,widths,10,.1);e.setResult(fixture(input));e.storage.set('rg_pavement_tolerance_p',JSON.stringify({source:'operator',value:.1}))
 let slot=0,changed=false,view,query=new URLSearchParams(),restored=[];const values=[],effects=[]
 e.mocks.react={useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],next=>{const n=typeof next==='function'?next(values[i]):next;if(!Object.is(n,values[i])){values[i]=n;changed=true}}]},useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=next]}
 const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 function render(){for(let i=0;i<15;i++){changed=false;slot=0;view=hook(project,'road',editor,widths,false,true,x=>restored.push(x),()=>{});for(const fx of effects)if(fx?.pending){fx.pending=false;fx.cleanup?.();fx.cleanup=fx.fn()}if(!changed)return}throw Error('did not settle')}
 async function flush(){for(let i=0;i<25;i++){await Promise.resolve();render()}}
 render();await flush();assert.equal(view.disabledReason,'');await view.save();render();await flush()
 assert.equal(query.get('layoutId'),'layout');assert.equal(query.get('routeVersionId'),'route');assert.equal(query.get('segmentSetId'),'set');assert.equal(e.calls.filter(x=>x.method==='POST').length,1);assert.equal(view.pending,null)
 assert.equal(restored.length,0);assert.equal(view.snapshot.id,'layout');assert.equal(view.disabledReason,'')
})
console.log(`${count} pavement scoped groups PASS (mock HTTP/hooks, not live persistence).`)
})().catch(error=>{console.error(error);process.exitCode=1})
