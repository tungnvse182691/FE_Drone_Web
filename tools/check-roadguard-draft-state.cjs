const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript')
const base='src/pages/(pm)/alignment/',sample=fs.readFileSync('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json','utf8'),plain=v=>JSON.parse(JSON.stringify(v))
function harness(root=false,saveMode=false,mapMode=false){
 let slot=0,changed=false,pending=[],view,project='p',inputScope='p:a',ready=true,crs=32648
 const values=[],effects=[],readers=[],applied=[],messages=[],mapInputs=[]
 const model={draftId:'a',projects:[],context:null,geometry:null,draft:null,invalidate(){}}
 const react={useState(initial){const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>{const v=typeof next==='function'?next(values[i]):next;if(!Object.is(v,values[i])){values[i]=v;changed=true}}]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useMemo:fn=>fn(),useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j])))pending.push({i,setup,deps})}}
 const workflow={form:{origin:'',widths:'',reason:'',surveyWidth:''},busy:false,conflict:false,setForm(next){workflow.form=typeof next==='function'?next(workflow.form):next}}
 const mocks={react,'maplibre-gl':{},'react-router-dom':{useNavigate:()=>()=>{},useParams:()=>({id:project})},'../../../store/authStore':{useAuthStore:()=>({user:{role:'PROJECT_MANAGER'},authEpoch:1})},'../../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'./data':{SEGMENT_COLORS:['#C9A227']},'./useGeometryReadModel':{useGeometryReadModel:()=>model},'./useGeometryDraftWorkflow':{useGeometryDraftWorkflow(_p,model,_text,setText){react.useEffect(()=>{if(model.draft){workflow.form={origin:'-99',widths:'server'};setText('server')}},[model.draft]);return workflow}},'./useAlignmentMapState':{useAlignmentMapState(params){mapInputs.push(params.currentCoords);return{syncMap(){},handleFitBounds(){},mapRef:{current:null}}}}}
 const calls=[],journal=new Map(),control={error:null,badReceipt:false,badReadback:false,badVersion:false,badSection:false},authState={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1,isAuthenticated:true}
 const v1='"AAAAAAAAAAE="',v2='"AAAAAAAAAAI="'
 let serverDraft={...JSON.parse(sample),id:'saved-draft',projectId:'p',roadSectionId:'road',status:'DRAFT',version:'AAAAAAAAAAI='}
 const response=data=>({data,headers:{etag:v2}})
 const client={async post(url,body,config){return write('POST',url,body,config)},async put(url,body,config){return write('PUT',url,body,config)},async get(url){calls.push({method:'GET',url});return{data:{...serverDraft,...(control.badReadback?{id:'wrong-draft'}:{}),...(control.badSection?{roadSectionId:'other'}:{})},headers:{etag:control.badVersion?v1:v2}}}}
 async function write(method,url,body,config){calls.push({method,url,body:plain(body),headers:config.headers});if(control.error)throw control.error;serverDraft={...serverDraft,...plain(body)};return response(control.badReceipt?{...serverDraft,version:null}:serverDraft)}
 mocks['../../store/authStore']={useAuthStore:{subscribe(){}}};mocks['../client']={apiClient:client};mocks['./projectService']={projectService:{}}
 const maps=[],fits=[]
 if(mapMode){
  delete mocks['./useAlignmentMapState'];mocks['maplibre-gl/dist/maplibre-gl.css']={};mocks['../../../utils/maplibre']={getMapLibreStyle:()=>({})};mocks['../../../api/services/projectService']={projectService:{}}
  class MapMock{constructor(){this.ready=false;this.events={};maps.push(this)}on(name,fn){this.events[name]=fn;return this}isStyleLoaded(){return this.ready}getLayer(){return null}getCanvas(){return{style:{}}}fitBounds(bounds){fits.push(bounds.points)}flyTo(){}remove(){}}
  class Bounds{constructor(){this.points=[]}extend(point){this.points.push(point);return this}}
  mocks['maplibre-gl']={Map:MapMock,LngLatBounds:Bounds}
  const draw=(map,segments,coords,kms,selected)=>{if(map?.ready)map.centerline=load(base+'data.ts').buildSegmentsGeoJSON(segments,coords,kms,selected)}
  mocks['./alignmentMapSetup']={initAlignmentMapLayers:p=>draw(p.map,p.segments,p.currentCoords,p.currentKmPoints,p.selectedSegmentId),syncMapDataDirect:(map,segments,selected,coords,kms)=>draw(map,segments,coords,kms,selected)}
 }
 if(saveMode){
  delete mocks['./useGeometryDraftWorkflow'];model.draftId='';model.profiles=[]
  mocks['../../../store/authStore']={useAuthStore:Object.assign(()=>authState,{getState:()=>authState,subscribe(){}})};mocks['../../store/authStore']=mocks['../../../store/authStore']
  mocks['../../types/enums']=mocks['../../../types/enums'];mocks['../client']={apiClient:client};mocks['./projectService']={projectService:{}}
  model.openDraft=id=>{model.draftId=id};model.retry=()=>{model.draft=null;model.draftLoading=true};model.openConfirmed=()=>{throw Error('Must not confirm')}
 }
 class FileReader{constructor(){readers.push(this)}readAsText(){}}
 const modules=new Map()
 function load(file){file=path.normalize(file);if(modules.has(file))return modules.get(file);const module={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;modules.set(file,module.exports);vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name in mocks)return mocks[name];if(name.startsWith('.'))return load(path.join(path.dirname(file),name+'.ts'));throw Error('Unexpected '+name)},Error,FileReader,console,setTimeout(){},crypto:require('crypto').webcrypto,sessionStorage:{getItem:k=>journal.get(k)||null,setItem:(k,v)=>journal.set(k,v),removeItem:k=>journal.delete(k)}});return module.exports}
 const hook=load(base+(root?'useAlignmentState.ts':'useAlignmentImportState.ts'))[root?'useAlignmentState':'useAlignmentImportState']
 function flush(){for(let i=0;i<25;i++){changed=false;slot=0;pending=[];view=root?hook():hook({inputScope,contextReady:ready,engineeringCrs:crs,onRoadGuardDraft:draft=>applied.push(draft),onDraftInput(){},defaultManualText:'',showToast:m=>messages.push(m),currentCoords:[],currentKmPoints:[],importedLengthKm:0});if(changed)continue;if(mapMode)view.mapState.mapContainerRef.current={};for(const e of pending){effects[e.i]?.cleanup?.();effects[e.i]={deps:e.deps,cleanup:e.setup()}}if(!changed)return view}throw Error('Hook did not settle')}
 flush()
 return{model,workflow,readers,applied,messages,mapInputs,calls,control,maps,fits,flush,v1,v2,convert:load('src/api/services/alignmentService.ts').utm48NToWgs84,loadMap(){maps[0].ready=true;maps[0].events.load()},get view(){return view},hydrate(){model.draft={data:serverDraft,etag:v2};model.draftLoading=false;flush()},scope(v){inputScope=v;flush()},context(v,c){ready=v;crs=c;flush()},project(v){project=v;flush()},read(text){(root?view.importState:view).processGeoJSONFile({name:'input.json'});const r=readers.at(-1);if(text!==undefined){r.onload({target:{result:text}});flush()}return r},unmount(){effects.forEach(e=>e?.cleanup?.())}}
}
const tests=[];function test(name,run){tests.push({name,run})}
test('sample waits for context and CRS match, preserves full DTO and remains unsaved',()=>{
 const h=harness();h.context(false,null);h.read(sample);assert.equal(h.applied.length,0);assert.match(h.view.readMessage,/context/)
 h.context(true,32649);assert.equal(h.applied.length,0);assert.match(h.view.readMessage,/không khớp/)
 h.context(true,32648);assert.deepEqual(plain(h.applied[0]),JSON.parse(sample));assert.equal(h.view.hasUnverifiedFile,true);assert.match(h.view.readMessage,/chưa lưu/);assert.match(h.view.manualCoordsText,/^798577.937027, 1269894.645247/);h.unmount()
})
test('malformed JSON, invalid DTO and read failure retain valid file input',()=>{
 const h=harness();h.read(sample);const before=h.view.manualCoordsText
 for(const text of ['{',JSON.stringify({...JSON.parse(sample),sourceCrs:4326})]){h.read(text);assert.equal(h.applied.length,1);assert.equal(h.view.manualCoordsText,before);assert.equal(h.view.hasUnverifiedFile,true)}
 h.read().onerror();h.flush();assert.equal(h.view.manualCoordsText,before);assert.equal(h.applied.length,1);h.unmount()
})
test('new file, scope changes and unmount reject old reads and cancel pending files',()=>{
 for(const scope of ['p:b','other:a','2:p:a']){const h=harness(),r=h.read();h.scope(scope);r.onload({target:{result:sample}});h.flush();assert.equal(h.applied.length,0);h.unmount()}
 const h=harness(),old=h.read(),next=h.read();next.onload({target:{result:sample}});h.flush();old.onload({target:{result:JSON.stringify({...JSON.parse(sample),stationOriginMeters:99})}});h.flush();assert.equal(h.applied.length,1)
 h.context(false,null);h.read(sample);h.read('{');h.context(true,32648);assert.equal(h.applied.length,1)
 h.context(false,null);h.read(sample);h.scope('p:b');h.context(true,32648);assert.equal(h.applied.length,1)
 const late=h.read();h.unmount();late.onload({target:{result:sample}});assert.equal(h.applied.length,1)
})
test('GeoJSON uses original inspection and stays unverified',()=>{
 const h=harness();h.read(sample);h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}));assert.equal(h.applied.at(-1),null);assert.equal(h.view.manualCoordsText,'108, 16\n108.1, 16.1');assert.equal(h.view.hasUnverifiedFile,true);h.unmount()
})
test('real import/state/segments populate sidebar, isolate UTM from map and survive late hydrate',()=>{
 const h=harness(true);h.read(sample);assert.equal(h.view.fileDraft,null)
 h.model.context={projectId:'other',engineeringUtmSrid:32648,roadSections:[]};h.flush();assert.equal(h.view.fileDraft,null)
 h.model.context={projectId:'p',engineeringUtmSrid:32649,roadSections:[]};h.flush();assert.equal(h.view.fileDraft,null);assert.match(h.view.importState.readMessage,/không khớp/)
 h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush()
 assert.deepEqual(plain(h.view.fileDraft),JSON.parse(sample));assert.equal(h.view.localDraftDirty,true);assert.equal(h.workflow.form.origin,'0');assert.equal(h.workflow.form.surveyWidth,'12');assert.equal(h.workflow.form.reason,JSON.parse(sample).changeReason);assert.equal(h.workflow.form.widths,'0, 701.290518512277, 7')
 assert.equal(h.view.activeSegments[0].roadWidthM,7);assert.equal(h.view.activeSegments[0].statusText,'BẢN CHỈNH CHƯA LƯU');assert.equal(h.view.rightTab,'WIDTH_PROFILE');assert.equal(h.view.alignmentStatus,'DRAFT');assert.equal(h.view.currentCoords.length,119);assert.equal(h.view.currentKmPoints.length,119);assert.ok(h.mapInputs.every(c=>c.every(([lng,lat])=>Math.abs(lng)<=180&&Math.abs(lat)<=90)));assert.equal(h.view.segmentsState.slabs.length,0)
 h.read('{');assert.equal(h.view.activeSegments[0].roadWidthM,7)
 h.model.draft={data:{id:'a',projectId:'p',stationOriginMeters:-99,status:'CONFIRMED'}};h.flush();assert.equal(h.workflow.form.origin,'0');assert.match(h.view.importState.manualCoordsText,/^798577/);assert.equal(h.view.alignmentStatus,'DRAFT')
 const delayed=h.read();h.model.draftId='b';h.flush();assert.equal(h.view.fileDraft,null);assert.equal(h.view.activeSegments.length,0)
 delayed.onload({target:{result:sample}});h.flush();assert.equal(h.view.fileDraft,null);assert.equal(h.view.activeSegments.length,0);h.unmount()
})
test('replacing Draft A 7m with Draft B 9m closes old editors only after valid matching input',()=>{
 const h=harness(true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 const a=h.view.activeSegments[0],s=h.view.segmentsState
 s.setEditingSegment(a);s.setSplitModalSegment(a);s.setSelectedSegmentId(a.id);s.setIsAddSegmentModalOpen(true);s.setNewSegForm(old=>({...old,code:'A',roadWidthM:7}));s.setCustomSplitKm(.2);s.setSplitDistance(.1);h.flush()
 h.model.geometry={projectId:'p',lengthMeters:999};h.flush();assert.equal(h.view.segmentsState.editingSegment,a);assert.equal(h.view.segmentsState.selectedSegmentId,a.id)
 h.read('{');assert.equal(h.view.segmentsState.editingSegment,a);assert.equal(h.view.activeSegments[0].roadWidthM,7)
 const b=JSON.parse(sample);b.widthProfile[0].widthMeters=9;b.stationOriginMeters=100;b.changeReason='Draft B'
 h.read(JSON.stringify({...b,sourceCrs:32649}));assert.equal(h.view.segmentsState.editingSegment,a);assert.equal(h.view.activeSegments[0].roadWidthM,7)
 h.read(JSON.stringify(b));assert.equal(h.view.activeSegments[0].roadWidthM,9);assert.equal(h.view.activeSegments[0].startKm,.1);assert.equal(h.workflow.form.reason,'Draft B');assert.equal(h.workflow.form.origin,'100')
 assert.equal(h.view.segmentsState.editingSegment,null);assert.equal(h.view.segmentsState.splitModalSegment,null);assert.equal(h.view.segmentsState.selectedSegmentId,null);assert.equal(h.view.segmentsState.isAddSegmentModalOpen,false);assert.equal(h.view.segmentsState.newSegForm.code,'');assert.ok(Number.isNaN(h.view.segmentsState.newSegForm.roadWidthM));assert.ok(Number.isNaN(h.view.segmentsState.customSplitKm));assert.ok(Number.isNaN(h.view.segmentsState.splitDistance));assert.equal(h.view.localDraftDirty,true);h.unmount()
})
test('Draft to GeoJSON removes old width length chainage and technical form without inventing new values',()=>{
 const h=harness(true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 const s=h.view.segmentsState,a=h.view.activeSegments[0];s.setEditingSegment(a);s.setSplitModalSegment(a);s.setSelectedSegmentId(a.id);h.flush()
 h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}))
 assert.equal(h.view.fileDraft,null);assert.equal(h.view.importState.manualCoordsText,'108, 16\n108.1, 16.1');assert.equal(h.view.activeSegments.length,0);assert.ok(!Number.isFinite(h.view.importedLengthKm));assert.equal(h.view.currentCoords.length,0);assert.equal(h.view.currentKmPoints.length,0)
 for(const key of ['origin','reason','surveyWidth','widths','profileId'])assert.equal(h.workflow.form[key],'')
 assert.equal(h.view.segmentsState.editingSegment,null);assert.equal(h.view.segmentsState.splitModalSegment,null);assert.equal(h.view.segmentsState.selectedSegmentId,null);assert.equal(h.view.localDraftDirty,true);assert.equal(h.view.importState.hasUnverifiedFile,true)
 h.model.geometry={projectId:'p',lengthMeters:701.290518512277};h.flush();assert.ok(!Number.isFinite(h.view.importedLengthKm));assert.equal(h.view.activeSegments.length,0);h.unmount()
})
test('JSX/UI files are unchanged, including existing json accept',()=>{
 const cp=require('child_process');for(const name of ['ImportPanel','AlignmentImportModal','AlignmentSidebar','SidebarWidthProfileTab']){const file=base+name+'.tsx';assert.equal(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'),cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}).replaceAll('\r\n','\n'))}
})
test('Draft JSON create uses current sidebar width and exact coordinates; receipt hydrate fences repeated clicks',async()=>{
 const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',name:'Road'}]};h.flush();h.read(sample)
 h.view.handleUpdateSegmentWidth(h.view.activeSegments[0].id,9);h.view.markWidthDraft();h.flush();assert.equal(h.view.draftWorkflow.saveReason,'')
 const save=h.view.handleSubmitAlignment;await Promise.all([save(),save()]);h.flush()
 const writes=h.calls.filter(c=>c.method!=='GET');assert.equal(writes.length,1);assert.equal(writes[0].method,'POST');assert.equal(writes[0].url,'/projects/p/road-sections/road/geometry-drafts');assert.ok(writes[0].headers['Idempotency-Key']);assert.equal(writes[0].body.widthProfile[0].widthMeters,9);assert.equal(writes[0].body.widthProfile[0].toOffsetMeters,JSON.parse(sample).widthProfile[0].toOffsetMeters);assert.deepEqual(writes[0].body.coordinates,JSON.parse(sample).coordinates);assert.equal(writes[0].body.sourceCrs,32648);assert.equal(writes[0].body.surveyWidthMeters,12)
 assert.equal(h.view.draftWorkflow.busy,true);await h.view.handleSubmitAlignment();assert.equal(h.calls.filter(c=>c.method!=='GET').length,1)
 h.hydrate();assert.equal(h.view.draftWorkflow.busy,false);assert.match(h.view.draftWorkflow.message,/Đã đọc lại bản nháp đã lưu/);h.unmount()
})
test('Draft JSON update sends loaded If-Match and current edited fields',async()=>{
 const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',name:'Road'}]};h.model.draftId='saved-draft';h.model.draft={data:{...JSON.parse(sample),id:'saved-draft',projectId:'p',roadSectionId:'road',status:'DRAFT',originalCoordinates:JSON.parse(sample).coordinates},etag:h.v1};h.flush();h.read(sample)
 h.view.handleUpdateAllWidths(10);h.view.markWidthDraft();h.view.draftWorkflow.setForm(old=>({...old,origin:'100',reason:'Lý do mới',surveyWidth:'15'}));h.flush();assert.equal(h.view.draftWorkflow.saveReason,'')
 await h.view.handleSubmitAlignment();h.flush();const write=h.calls.find(c=>c.method==='PUT');assert.ok(write);assert.equal(write.headers['If-Match'],h.v1);assert.equal(write.body.widthProfile[0].widthMeters,10);assert.equal(write.body.stationOriginMeters,100);assert.equal(write.body.changeReason,'Lý do mới');assert.equal(write.body.surveyWidthMeters,15);h.hydrate();assert.equal(h.view.draftWorkflow.busy,false);h.unmount()
})
test('missing or ambiguous target, wrong CRS/project, unknown GeoJSON and invalid edited width never write',async()=>{
 const h=harness(true,true),sections=[{roadSectionId:'r1',code:'R1'},{roadSectionId:'r2',code:'R2'}];h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:sections};h.flush();h.read(sample);assert.match(h.view.draftWorkflow.saveReason,/một tuyến/);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0)
 h.view.draftWorkflow.setForm(old=>({...old,sectionId:'r1'}));h.flush();assert.equal(h.view.draftWorkflow.saveReason,'')
 h.model.context={...h.model.context,engineeringUtmSrid:32649};h.flush();assert.match(h.view.draftWorkflow.saveReason,/không khớp/);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0)
 h.model.context={...h.model.context,projectId:'other'};h.flush();assert.match(h.view.draftWorkflow.saveReason,/context/)
 h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:sections};h.flush();h.view.handleUpdateAllWidths(99);h.view.markWidthDraft();h.flush();await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0)
 h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}));assert.match(h.view.draftWorkflow.saveReason,/chưa có mapping/);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0);h.unmount()
})
test('HTTP failure retains current draft and sidebar without automatic replay',async()=>{
 const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R'}]};h.flush();h.read(sample);h.view.handleUpdateAllWidths(9);h.view.markWidthDraft();h.flush();const text=h.view.importState.manualCoordsText;h.control.error=Object.assign(Error('503'),{response:{status:503,data:{code:'dependency_unavailable'}}})
 await h.view.handleSubmitAlignment();h.flush();assert.equal(h.view.importState.manualCoordsText,text);assert.equal(h.view.activeSegments[0].roadWidthM,9);assert.equal(h.view.fileDraft.sourceCrs,32648);assert.ok(h.view.draftWorkflow.pending);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,1);h.unmount()
})
test('receipt missing version or readback with wrong draft/section/version is held and never acknowledged or rewritten',async()=>{
 for(const field of ['badReceipt','badReadback','badVersion','badSection']){const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R'}]};h.flush();h.read(sample);h.control[field]=true;await h.view.handleSubmitAlignment();h.flush();assert.equal(h.model.draftId,'');assert.ok(h.view.draftWorkflow.pending.receipt);await h.view.handleSubmitAlignment();assert.equal(h.calls.filter(c=>c.method==='POST').length,1);if(field!=='badReceipt'){h.control[field]=false;await h.view.draftWorkflow.retryCommand();h.flush();assert.equal(h.calls.filter(c=>c.method==='POST').length,1);h.hydrate();assert.equal(h.view.draftWorkflow.busy,false)}h.unmount()}
})
test('existing converter matches independent PROJ references, not merely its inverse',()=>{
 const h=harness()
 // pyproj Transformer.from_crs(32648,4326,always_xy=True); tolerance ~1cm.
 for(const [x,y,lng,lat]of [[500000,0,105,0],[500000,1105412.4913010783,105,10],[798577.937027,1269894.645247,107.73664210994504,11.474765619995503],[799082.92577,1269497.285237,107.7412322799448,11.47113272999294]]){const p=h.convert(x,y);assert.ok(Math.abs(p[0]-lng)<1e-7);assert.ok(Math.abs(p[1]-lat)<1e-7)}h.unmount()
})
test('file before map load draws and fits latest preview on existing centerline; replacement and scope clear it',()=>{
 const h=harness(true,false,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 const draft=plain(h.view.fileDraft),length=h.view.importedLengthKm,preview=plain(h.view.currentCoords)
 assert.equal(h.fits.length,0);assert.equal(h.maps[0].centerline,undefined);h.loadMap()
 const line=h.maps[0].centerline.features.find(f=>f.geometry.type==='LineString');assert.equal(line.geometry.coordinates.length,119);assert.deepEqual(plain(line.geometry.coordinates[0]),preview[0]);assert.deepEqual(plain(h.fits.at(-1)),preview)
 assert.deepEqual(plain(h.view.fileDraft),draft);assert.equal(h.view.importedLengthKm,length);assert.ok(Math.abs(h.view.currentKmPoints.at(-1)*1000-701.2905185122771)<1e-9);assert.equal(h.view.activeSegments[0].roadWidthM,7);assert.equal(h.view.alignmentStatus,'DRAFT');assert.equal(h.calls.length,0)
 h.read('{');assert.deepEqual(plain(h.view.currentCoords),preview)
 const next=JSON.parse(sample);next.coordinates.forEach(p=>p.x+=10);h.read(JSON.stringify(next));assert.notDeepEqual(plain(h.fits.at(-1)),preview)
 h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}));assert.equal(h.maps[0].centerline.features.length,0)
 h.read(sample);h.model.draftId='b';h.flush();assert.equal(h.maps[0].centerline.features.length,0);h.unmount()
 const waiting=harness(true,false,true);waiting.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};waiting.flush();waiting.read(sample);waiting.model.draftId='b';waiting.flush();waiting.loadMap();assert.equal(waiting.maps[0].centerline.features.length,0);assert.equal(waiting.fits.length,0);waiting.unmount()
})
test('zone49 and CRS mismatch keep engineering input but never render a zone48 preview or stale queued line',()=>{
 const h=harness(true,false,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 h.model.context={projectId:'p',engineeringUtmSrid:32649,roadSections:[]};h.flush();assert.equal(h.view.currentCoords.length,0)
 const zone49={...JSON.parse(sample),sourceCrs:32649};h.read(JSON.stringify(zone49));assert.deepEqual(plain(h.view.fileDraft),zone49);assert.match(h.view.importState.readMessage,/Chưa hỗ trợ preview.*32649/);assert.equal(h.view.currentCoords.length,0)
 h.loadMap();assert.ok(h.maps[0].centerline.features.every(f=>f.geometry.coordinates.length===0));assert.equal(h.fits.length,0);assert.ok(h.view.importedLengthKm>0);assert.equal(h.calls.length,0);h.unmount()
})
;(async()=>{let count=0;for(const {name,run}of tests){await run();console.log('PASS '+name);count++}console.log(`${count} Draft import/state/save/map scenarios PASS (mock HTTP/MapLibre; no runtime writes).`)})().catch(error=>{console.error(error);process.exitCode=1})
