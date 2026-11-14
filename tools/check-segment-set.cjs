const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),ts=require('typescript'),{webcrypto}=require('crypto')
const plain=v=>JSON.parse(JSON.stringify(v)),pins={projectId:'p',roadSectionId:'road',routeVersionId:'route'},v1='"AAAAAAAAAAE="',v2='"AAAAAAAAAAI="'
const input={targetLengthMeters:5,remainderMode:'KEEP'},parts=[{id:'part-1',sequence:1,fromOffsetMeters:0,toOffsetMeters:5,startStationMeters:100,endStationMeters:105,lengthMeters:5,metricGeometry:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]},missingMetadata:[]}]
const dto={id:'set-1',routeVersionId:'route',status:'DRAFT',version:'AAAAAAAAAAE=',definition:input,geometryHash:'hash',segments:parts,metadataStatus:'COMPLETE',missingMetadata:[]}
const tests=[];function test(name,run){tests.push({name,run})}
function env(){
 const state={isAuthenticated:true,user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1},storage=new Map(),calls=[],control={},cache=new Map();let server=plain(dto)
 const react={};const auth={useAuthStore:Object.assign(selector=>selector?selector(state):state,{getState:()=>state})}
 const client={get:async(url,config)=>{calls.push({method:'GET',url,config});if(control.getError)throw control.getError;if(url.endsWith('segment-sets'))return {data:{items:control.items||[],nextCursor:control.cursor}};return {data:{...server,...control.bad},headers:{etag:'"'+server.version+'"'}}},post:async(url,body,config)=>write('POST',url,body,config),put:async(url,body,config)=>write('PUT',url,body,config)}
 async function write(method,url,body,config){calls.push({method,url,body:plain(body),headers:plain(config.headers)});if(control.pause)await control.pause;if(control.error)throw control.error
 if(url.endsWith('/preview'))return {data:{routeVersionId:'route',totalLengthMeters:5,boundariesMeters:[0,5],segments:plain(parts),definitionHash:'hash'}}
 server={...server,...(url.endsWith('/publish')?{status:'PUBLISHED',version:'AAAAAAAAAAI='}:{definition:plain(body)} )};return {data:plain(server),headers:{etag:'"'+server.version+'"'}}
 }
 function load(file,mocks={}){file=path.normalize(file);if(cache.has(file))return cache.get(file);const mod={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText
 const requires=n=>{if(n in mocks)return mocks[n];if(n==='react')return react;if(n.endsWith('/authStore'))return auth;if(n.endsWith('/enums'))return {RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}};if(n==='../client')return {apiClient:client};if(n==='./alignmentImportHelpers')return {previewCenterlineCoordinates:coords=>coords.map(()=>[105,10])};if(n.endsWith('alignmentService'))return {alignmentService:{readConfirmedGeometry:async()=>({projectId:'p',roadSectionId:'road',routeVersionId:'route',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:100,lengthMeters:5,metadataStatus:'COMPLETE',approvedBy:'supervisor',approvedAt:'2026-11-10T00:00:00Z',isCurrent:true})}};if(n.startsWith('.'))return load(path.join(path.dirname(file),n+'.ts'));throw Error('Missing mock '+n)}
 cache.set(file,mod.exports);vm.runInNewContext(code,{module:mod,exports:mod.exports,require:requires,crypto:webcrypto,console,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},URLSearchParams});return mod.exports}
 return {state,storage,calls,control,react,load,reloadModules:()=>cache.clear(),get server(){return server},set server(v){server=v}}
}
test('contract paths, exact definition, If-Match/key, preview/list/read scopes and empty DB',async()=>{
 const e=env(),s=e.load('src/api/services/segmentSetService.ts').segmentSetService
 assert.deepEqual(plain(await s.list(pins)),[]);await s.preview(pins,input);await s.write(pins,null,input,'key');await s.write(pins,'set-1',input,'key-edit',v1);await s.publish(pins,'set-1',{expectedPublishedSetId:null,reason:'PM reason'},'key-pub',v1);await s.read(pins,'set-1')
 const writes=e.calls.filter(c=>c.method!=='GET');assert.ok(writes.every(c=>c.url.startsWith('/projects/p/road-sections/road/versions/route/segment-sets')));assert.deepEqual(writes[2].body,input);assert.equal(writes[2].headers['If-Match'],v1);assert.equal(writes[3].headers['Idempotency-Key'],'key-pub');assert.equal(writes[3].body.expectedPublishedSetId,null)
 e.control.items=[{id:'s',routeVersionId:'wrong',status:'DRAFT'}];await assert.rejects(s.list(pins),/phạm vi/)
})
test('create edit publish readback persists only server status and references',async()=>{
 const e=env(),c=e.load('src/api/services/segmentSetCommands.ts');const created=await c.runSegment(pins,{pins,kind:'create',input});assert.equal(created.data.id,'set-1');assert.equal(e.storage.size,0)
 const edited=await c.runSegment(pins,{pins,kind:'edit',setId:'set-1',etag:v1,input:{...input,targetLengthMeters:2.5}});assert.equal(edited.data.definition.targetLengthMeters,2.5)
 const published=await c.runSegment(pins,{pins,kind:'publish',setId:'set-1',etag:v1,input:{expectedPublishedSetId:null,reason:'PM publish'}});assert.equal(published.data.status,'PUBLISHED');assert.equal(published.etag,v2);assert.equal(e.calls.filter(c=>c.method!=='GET').length,3)
})
test('timeout reload replay keeps immutable key/body and receipt GET failure never writes twice',async()=>{
 const e=env(),c=e.load('src/api/services/segmentSetCommands.ts');e.control.error=Error('timeout');const intent={pins,kind:'create',input:plain(input)};await assert.rejects(c.runSegment(pins,intent),/timeout/);intent.input.targetLengthMeters=99
 await assert.rejects(c.runSegment(pins,intent),/cũ/);e.reloadModules();const reloaded=e.load('src/api/services/segmentSetCommands.ts');e.control.error=null;e.control.getError=Error('read-fail');await assert.rejects(reloaded.runSegment(pins),/read-fail/);assert.ok(c.pendingSegment(pins).receipt);const writes=e.calls.filter(c=>c.method!=='GET');assert.equal(writes.length,2);assert.deepEqual(writes[0],writes[1]);e.control.getError=null;await c.runSegment(pins);assert.equal(e.calls.filter(c=>c.method!=='GET').length,2);assert.equal(e.storage.size,0)
})
test('readback wrong set route version definition geometry never clears receipt or writes again',async()=>{
 for(const bad of [{id:'wrong'},{routeVersionId:'other'},{version:'AAAAAAAAAAI='},{geometryHash:'wrong'},{definition:{...input,targetLengthMeters:99}},{segments:[{...parts[0],metricGeometry:null}]}]){
 const e=env(),c=e.load('src/api/services/segmentSetCommands.ts');e.control.bad=bad;await assert.rejects(c.runSegment(pins,{pins,kind:'create',input}));assert.ok(c.pendingSegment(pins).receipt);await assert.rejects(c.runSegment(pins));assert.equal(e.calls.filter(c=>c.method==='POST').length,1)
 }
})
test('412/409 publication conflict and rejected input require explicit review decision; no silent ETag update',async()=>{
 for(const status of [412,409,422,403]){const e=env(),c=e.load('src/api/services/segmentSetCommands.ts');e.control.error=Object.assign(Error('rejected'),{response:{status,data:{code:'segment_publication_conflict'}}});await assert.rejects(c.runSegment(pins,{pins,kind:'edit',setId:'set-1',etag:v1,input}));await assert.rejects(c.runSegment(pins),/đối chiếu/);assert.equal(e.calls.length,1);c.reviseSegment(pins);assert.equal(e.storage.size,0)}
})
test('actor epoch route journals and concurrent writes fence stale outcomes and Sup cannot mutate',async()=>{
 const e=env(),c=e.load('src/api/services/segmentSetCommands.ts');let release;e.control.pause=new Promise(r=>release=r);const request=c.runSegment(pins,{pins,kind:'create',input});await assert.rejects(c.runSegment(pins),/Đang/);e.state.authEpoch++;release();await assert.rejects(request,/Phiên/);assert.ok(c.pendingSegment(pins));e.state.user={id:'sup',role:'SUPERVISOR'};assert.equal(c.pendingSegment(pins),null);await assert.rejects(c.runSegment(pins,{pins,kind:'create',input}),/PM/);e.state.user={id:'pm',role:'PROJECT_MANAGER'};assert.equal(c.pendingSegment({...pins,routeVersionId:'other'}),null)
})
function hookHarness(setId='',items){
 const e=env();if(items)e.control.items=items;let slot=0,pending=[],view,changed=false,params=new URLSearchParams({segmentSetId:setId,roadSectionId:'road',routeVersionId:'route'}),project='p',section='road',route='route',distance=NaN,notices=[];const values=[],effects=[]
 Object.assign(e.react,{useState(initial){const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i],next=>{const v=typeof next==='function'?next(values[i]):next;if(!Object.is(v,values[i])){values[i]=v;changed=true}}]},useRef(initial){const i=slot++;return values[i]||(values[i]={current:initial})},useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||deps.some((v,j)=>!Object.is(v,old.deps[j])))pending.push({i,setup,deps})}})
 const mod=e.load('src/pages/(pm)/alignment/useSegmentSetWorkflow.ts',{'react-router-dom':{useSearchParams:()=>[params,next=>{params=typeof next==='function'?next(params):next;changed=true}]}})
 const geometry={projectId:'p',roadSectionId:'road',routeVersionId:'route',lengthMeters:5,sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:100,metadataStatus:'COMPLETE',approvedBy:'supervisor',approvedAt:'2026-11-10T00:00:00Z',isCurrent:true}
 const render=()=>{for(let tries=0;tries<30;tries++){changed=false;slot=0;pending=[];view=mod.useSegmentSetWorkflow(project,section,route,geometry,true,distance,n=>{distance=n;changed=true},text=>notices.push(text));for(const eff of pending){effects[eff.i]?.cleanup?.();effects[eff.i]={deps:eff.deps,cleanup:eff.setup()}}if(!changed)return}throw Error('render loop')}
 const flush=async()=>{for(let i=0;i<30;i++){await Promise.resolve();render()}}
 render();return {...e,mod,geometry,render,flush,notices,get server(){return e.server},set server(v){e.server=v},get view(){return view},get params(){return params},distance(n){distance=n;render()},switchRoute(){route='route-B';render()},unmount(){effects.forEach(e=>e?.cleanup?.())}}
}
test('hook F5 reads selected set, new empty DB stays empty, PM preview/save URL then Sup reads same reference',async()=>{
 const h=hookHarness('set-1');await h.flush();assert.equal(h.view.snapshot.data.id,'set-1');assert.equal(h.view.display[0].id,'part-1');assert.equal(h.calls.filter(c=>c.method!=='GET').length,0);h.distance(.0025);await h.view.loadPreview();await h.flush();assert.ok(h.view.preview);await h.view.save();await h.flush();assert.equal(h.params.get('segmentSetId'),'set-1');assert.equal(h.view.snapshot.data.status,'DRAFT');h.unmount()
 const empty=hookHarness();await empty.flush();assert.equal(empty.view.display,null);assert.deepEqual(plain(empty.view.sets),[]);empty.distance(.005);await empty.view.loadPreview();await empty.flush();await empty.view.save();await empty.flush();assert.equal(empty.params.get('segmentSetId'),'set-1');empty.unmount()
 const sup=hookHarness('set-1');sup.state.user={id:'sup',role:'SUPERVISOR'};sup.render();await sup.flush();assert.equal(sup.view.snapshot.data.id,'set-1');await sup.view.save();assert.equal(sup.calls.filter(c=>c.method!=='GET').length,0);sup.unmount()
})
test('published set is immutable; new draft must be explicit and no latest selection from multiple sets',async()=>{
 const h=hookHarness('set-1');h.server={...h.server,status:'PUBLISHED'};await h.flush();assert.equal(h.view.editable,false);await h.view.save();assert.equal(h.calls.filter(c=>c.method!=='GET').length,0);h.view.openSet('');h.render();await h.flush();assert.equal(h.view.snapshot,null);h.unmount()
 const multi=hookHarness('',[{id:'a',routeVersionId:'route',status:'DRAFT'},{id:'b',routeVersionId:'route',status:'DRAFT'}]);await multi.flush();assert.equal(multi.view.snapshot,null);assert.equal(multi.params.get('segmentSetId'),'');multi.unmount()
})
test('PM/Sup auto-open only unique publication; explicit draft/new choice and anomalies remain distinct',async()=>{
 const pub={...dto,id:'published',status:'PUBLISHED'},draft={...dto,id:'draft-new'}
 for(const role of ['PROJECT_MANAGER','SUPERVISOR']){
  const h=hookHarness('',[pub,draft]);h.server=pub;h.state.user.role=role;await h.flush();assert.equal(h.params.get('segmentSetId'),'published');assert.equal(h.view.snapshot.data.status,'PUBLISHED');assert.equal(h.calls.filter(c=>c.method!=='GET').length,0)
  if(role==='PROJECT_MANAGER'){h.view.openSet('');h.render();await h.flush();assert.equal(h.params.get('segmentSetId'),null);assert.equal(h.view.snapshot,null)}h.unmount()
 }
 const editing=hookHarness('draft-new',[pub,draft]);editing.server=draft;await editing.flush();assert.equal(editing.params.get('segmentSetId'),'draft-new');assert.equal(editing.view.snapshot.data.status,'DRAFT');editing.unmount()
 for(const rows of [[],[draft]]){const h=hookHarness('',rows);await h.flush();assert.match(h.view.message,/PM chưa công bố phân đoạn/);assert.equal(h.view.snapshot,null);h.unmount()}
 for(const rows of [[pub,{...pub,id:'another'}],[{...pub,routeVersionId:'wrong'}],[pub,pub]]){const h=hookHarness('',rows);await h.flush();assert.ok(h.view.error);assert.equal(h.view.snapshot,null);assert.notEqual(h.params.get('segmentSetId'),'published');h.unmount()}
})

test('hook late preview after route switch does not replace new scope and boundary offsets preserve precision',async()=>{
 const h=hookHarness();await h.flush();h.distance(.005);let release;h.control.pause=new Promise(r=>release=r);const request=h.view.loadPreview();h.switchRoute();release();await request;await h.flush();assert.equal(h.view.preview,null);h.unmount()
 const input=h.mod.segmentDefinition(.123456789,[0,1.23456789,5]);assert.equal(input.targetLengthMeters,123.456789);assert.deepEqual(plain(input.boundariesMeters),[0,1.23456789,5]);assert.throws(()=>h.mod.segmentDefinition(NaN),/cự ly/)
})
test('hook publish requires PM reason and fresh publication; only receipt GET recovery after publish',async()=>{
 const h=hookHarness('set-1');await h.flush();h.view.openPublish();h.render();assert.equal(h.view.reason,'');await h.view.publish();assert.equal(h.calls.filter(c=>c.method==='POST').length,0)
 h.view.setReason('PM chọn publish');h.render();h.control.items=[{id:'previous',routeVersionId:'route',status:'PUBLISHED'}];await h.view.publish();assert.equal(h.calls.filter(c=>c.method==='POST').length,0);assert.match(h.notices.at(-1),/Publication/)
 h.control.items=[];await h.view.publish();await h.flush();const pub=h.calls.find(c=>c.url.endsWith('/publish'));assert.ok(pub);assert.equal(pub.body.expectedPublishedSetId,null);assert.equal(pub.body.reason,'PM chọn publish');assert.equal(pub.headers['If-Match'],v1);assert.equal(h.view.snapshot.data.status,'PUBLISHED');assert.equal(h.view.editable,false);h.unmount()
})
test('list failure exposes explicit error and cursor repetition never becomes empty success',async()=>{
 const h=hookHarness();h.control.getError=Error('list failure');h.view.reload();h.render();await h.flush();assert.match(h.view.error,/list failure/);assert.equal(h.view.editable,false);h.unmount()
 const e=env(),s=e.load('src/api/services/segmentSetService.ts').segmentSetService;e.control.cursor='loop';await assert.rejects(s.list(pins),/Cursor/)
})
test('actual sidebar enables only segment splitting for PM and preserves geometry/width locks',()=>{
 const e=env(),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),react={__esModule:true,default:React,...React},icons=new Proxy({},{get:()=>()=>null}),base='src/pages/(pm)/alignment/'
 const Card=e.load(base+'SidebarSegmentCard.tsx',{react,'lucide-react':icons}).SidebarSegmentCard
 const Tab=e.load(base+'SidebarSegmentsTab.tsx',{react,'lucide-react':icons,'./SidebarSegmentCard':{SidebarSegmentCard:Card}}).SidebarSegmentsTab
 const baseProps={segments:[{id:'server-part',code:'1 · server-part',startKm:0,endKm:.005,lengthKm:.005,roadWidthM:7,statusText:'SEGMENT SET DRAFT'}],alignmentStatus:'CONFIRMED',currentCoords:[[105,10],[105.1,10.1]],currentKmPoints:[0,.005],importedLengthKm:.005,selectedTargetType:'MAINLINE',branches:[],segmentSetStatus:'DRAFT'}
 const html=renderToStaticMarkup(React.createElement(Tab,{...baseProps,segmentPlanning:true}));assert.ok(html.includes('Áp dụng chia đoạn tự động'));assert.ok(html.includes('Tách phân đoạn này tại mốc Km'));assert.ok(!html.includes('Chỉnh sửa lý trình &amp; thông số'));assert.ok(!html.includes('title="Xóa phân đoạn"'))
 const sup=renderToStaticMarkup(React.createElement(Tab,{...baseProps,isSupervisor:true,segmentPlanning:false}));assert.ok(!sup.includes('Tách phân đoạn này tại mốc Km'));assert.ok(!sup.includes('Áp dụng chia đoạn tự động'))
})
test('pending set B cannot retry command for set A without explicitly opening its reference',async()=>{
 const h=hookHarness('set-1');await h.flush();const commands=h.load('src/api/services/segmentSetCommands.ts');h.control.error=Error('timeout');await assert.rejects(commands.runSegment(pins,{pins,kind:'edit',setId:'set-A',etag:v1,input}),/timeout/);h.control.error=null;h.view.reload();h.render();await h.flush();const writes=h.calls.filter(c=>c.method!=='GET').length;await h.view.retry();assert.equal(h.calls.filter(c=>c.method!=='GET').length,writes);assert.match(h.notices.at(-1),/reference/);h.unmount()
})
test('split uses server stations and offsets for source4326 engineering32648 and reports unsupported mappings',async()=>{
 const h=hookHarness('set-1');h.geometry.sourceCrs=4326;await h.flush();h.view.split(.1025);await h.flush();const preview=h.calls.find(c=>c.url.endsWith('/preview'));assert.ok(preview,'different source CRS must not suppress preview');assert.deepEqual(preview.body.boundariesMeters,[0,2.5,5]);assert.equal(h.calls.filter(c=>c.method==='PUT'||c.url.endsWith('/publish')).length,0);h.unmount()
 const bad=hookHarness('set-1');await bad.flush();bad.server={...bad.server,segments:[{...parts[0],endStationMeters:110}]};bad.view.reload();bad.render();await bad.flush();bad.view.split(.1025);await bad.flush();assert.match(bad.notices.at(-1),/lý trình|offset/);assert.equal(bad.calls.filter(c=>c.method==='POST').length,0);bad.unmount()
})
test('width profile tab receives geometry intervals rather than a crossing server segment through actual caller',()=>{
 const e=env(),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),react={__esModule:true,default:React,...React},base='src/pages/(pm)/alignment/'
 const Width=e.load(base+'SidebarWidthProfileTab.tsx',{react,'lucide-react':new Proxy({},{get:()=>()=>null})}).SidebarWidthProfileTab
 const Sidebar=e.load(base+'AlignmentSidebar.tsx',{react,'lucide-react':new Proxy({},{get:()=>()=>null}),'./AsBuiltPanel':{AsBuiltPanel:()=>null},'./MapPublicationPanel':{MapPublicationPanel:()=>null},'./SidebarSegmentsTab':{SidebarSegmentsTab:()=>null},'./SidebarWidthProfileTab':{SidebarWidthProfileTab:Width},'./SidebarSlabsTab':{SidebarSlabsTab:()=>null},'./SidebarFooterKpis':{SidebarFooterKpis:()=>null}}).AlignmentSidebar
 const src=fs.readFileSync('src/pages/(pm)/AlignmentSegments.tsx','utf8'),ast=ts.createSourceFile('caller.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let element,rowsDeclaration;function walk(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='AlignmentSidebar')element=n;if(ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(ast)==='segmentRows'))rowsDeclaration=n.getText(ast);ts.forEachChild(n,walk)}walk(ast)
 const attrs=element.attributes.properties.filter(p=>ts.isJsxAttribute(p)&&['segments','rightTab','alignmentStatus','selectedTargetType'].includes(p.name.text)).map(p=>p.getText(ast)).join(' ')
 const code=ts.transpileModule('function renderCaller(rightTab,activeSegments,display){const submitted=false,isMainline=true,selectedTargetType="MAINLINE",alignmentStatus="CONFIRMED",segmentWorkflow={display},pavementWorkflow={};'+rowsDeclaration+';const displayedSegments=segmentRows||activeSegments;return <AlignmentSidebar '+attrs+' />}',{compilerOptions:{jsx:ts.JsxEmit.React}}).outputText
 const renderCaller=vm.runInNewContext(code+';renderCaller',{React,AlignmentSidebar:Sidebar})
 const widths=[{id:'width-1',code:'Khoảng bề rộng 1',startKm:.1,endKm:.102,lengthKm:.002,roadWidthM:7},{id:'width-2',code:'Khoảng bề rộng 2',startKm:.102,endKm:.105,lengthKm:.003,roadWidthM:9}]
 const html=renderToStaticMarkup(renderCaller('WIDTH_PROFILE',widths,[{id:'crossing',code:'Server segment crossing widths',startKm:.1,endKm:.105,lengthKm:.005,roadWidthM:NaN}]))
 assert.ok(html.includes('Khoảng bề rộng 1'));assert.ok(html.includes('Khoảng bề rộng 2'));assert.ok(!html.replace(/<[^>]*>/g,'').includes('Chưa có dữ liệu'));assert.ok(html.includes('value="7"'));assert.ok(html.includes('value="9"'))
})
test('caller badge and footer keep selected set count across segments widths slabs tabs and unknown states',()=>{
 const e=env(),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),react={__esModule:true,default:React,...React},base='src/pages/(pm)/alignment/'
 const Footer=e.load(base+'SidebarFooterKpis.tsx',{react}).SidebarFooterKpis
 const Sidebar=e.load(base+'AlignmentSidebar.tsx',{react,'lucide-react':new Proxy({},{get:()=>()=>null}),'./AsBuiltPanel':{AsBuiltPanel:()=>null},'./MapPublicationPanel':{MapPublicationPanel:()=>null},'./SidebarSegmentsTab':{SidebarSegmentsTab:()=>null},'./SidebarWidthProfileTab':{SidebarWidthProfileTab:()=>null},'./SidebarSlabsTab':{SidebarSlabsTab:()=>null},'./SidebarFooterKpis':{SidebarFooterKpis:Footer}}).AlignmentSidebar
 const src=fs.readFileSync('src/pages/(pm)/AlignmentSegments.tsx','utf8'),ast=ts.createSourceFile('caller.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let element;const declarations=[]
 function walk(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='AlignmentSidebar')element=n;if(ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>['segmentRows','displayedSegments','segmentCount','segmentCountMessage'].includes(d.name.getText(ast))))declarations.push(n.getText(ast));ts.forEachChild(n,walk)}walk(ast)
 const attrs=element.attributes.properties.filter(p=>ts.isJsxAttribute(p)&&['segments','rightTab','alignmentStatus','selectedTargetType','segmentCount','segmentCountMessage'].includes(p.name.text)).map(p=>p.getText(ast)).join(' ')
 const code=ts.transpileModule('function renderCaller(rightTab,segmentWorkflow,isMainline=true){const submitted=false,draftContentSaved=false,selectedTargetType=isMainline?"MAINLINE":"local",alignmentStatus="CONFIRMED",activeSegments=[{id:"width",lengthKm:.1}],pavementWorkflow={display:{segments:[{id:"slab1"},{id:"slab2"}]}};'+declarations.join(';')+';return <AlignmentSidebar '+attrs+' />}',{compilerOptions:{jsx:ts.JsxEmit.React}}).outputText
 const renderCaller=vm.runInNewContext(code+';renderCaller',{React,AlignmentSidebar:Sidebar}),segments=[{},{},{},{}],baseWorkflow={display:segments,snapshot:{data:{segments}},preview:null,loading:false,error:''}
 const render=(tab,w=baseWorkflow)=>renderToStaticMarkup(renderCaller(tab,w)).replace(/<[^>]*>/g,'')
 for(const tab of ['SEGMENTS','WIDTH_PROFILE','SLABS']){const html=render(tab);assert.match(html,/Phân đoạn4/);assert.match(html,/4 đoạnPhân đoạn/)}
 const preview={...baseWorkflow,snapshot:null,preview:{value:{segments}}};assert.match(render('WIDTH_PROFILE',preview),/4 đoạnPhân đoạn/)
 for(const [patch,label]of [[{loading:true},'Đang đọc'],[{error:'failed'},'Lỗi đọc set'],[{snapshot:null,display:null},'Chưa chọn set']]){const html=render('WIDTH_PROFILE',{...baseWorkflow,...patch});assert.ok(html.includes(label));assert.ok(!html.includes('4 đoạn'));assert.ok(!html.includes('1 đoạn'))}
})
test('explicit DRAFT save/edit keeps published reference unchanged and labels selection versus publication without extra publish',async()=>{
 const published={...dto,id:'published-server',status:'PUBLISHED'},draft={...dto,id:'set-1',status:'DRAFT'},h=hookHarness('set-1',[published,draft]);h.server=draft;await h.flush();assert.equal(h.view.publishedSet.id,published.id);assert.ok(h.view.selectionLabel.includes('bản nháp'));assert.ok(h.view.selectionLabel.includes('chưa áp dụng'));assert.ok(h.view.publicationLabel.includes('PUBLISHED'));assert.ok(h.view.publicationLabel.includes(published.version));assert.ok(!h.view.publicationLabel.includes(published.id));h.distance(.0025);await h.view.loadPreview();await h.flush();await h.view.save();await h.flush();assert.equal(h.view.snapshot.data.status,'DRAFT');assert.equal(h.view.publishedSet.id,published.id);assert.equal(h.params.get('segmentSetId'),'set-1');assert.equal(h.calls.filter(c=>c.url.endsWith('/publish')).length,0);assert.ok(h.calls.some(c=>c.method==='PUT'));h.unmount()
})
test('GET geometry COMPLETE alone grants no segment mutation; verified approval is required without altering read-only publication access',async()=>{const h=hookHarness('set-1');delete h.geometry.approvedBy;delete h.geometry.approvedAt;await h.flush();assert.equal(h.view.editable,false);assert.equal(h.view.snapshot.data.id,'set-1');await h.view.loadPreview();await h.view.save();assert.equal(h.calls.filter(c=>c.method!=='GET').length,0);h.unmount()})
;(async()=>{for(const t of tests){await t.run();console.log('PASS '+t.name)}console.log(`${tests.length} segment-set groups PASS (mock HTTP/hooks; runtime mutations not implied).`)})().catch(e=>{console.error(e);process.exitCode=1})
