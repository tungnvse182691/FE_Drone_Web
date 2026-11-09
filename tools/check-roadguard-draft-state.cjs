const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript')
const base='src/pages/(pm)/alignment/',sample=fs.readFileSync('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json','utf8'),plain=v=>JSON.parse(JSON.stringify(v))
function harness(root=false,saveMode=false,mapMode=false){
 let slot=0,changed=false,pending=[],view,project='p',inputScope='p:a',ready=true,crs=32648,actorId='pm',actorEpoch=1
 const values=[],effects=[],readers=[],applied=[],messages=[],mapInputs=[]
 const model={draftId:'a',projects:[],context:null,geometry:null,draft:null,invalidate(){}}
 const react={useState(initial){const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>{const v=typeof next==='function'?next(values[i]):next;if(!Object.is(v,values[i])){values[i]=v;changed=true}}]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useMemo:fn=>fn(),useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j])))pending.push({i,setup,deps})}}
 const workflow={form:{origin:'',widths:'',reason:'',surveyWidth:''},busy:false,conflict:false,setForm(next){workflow.form=typeof next==='function'?next(workflow.form):next}}
 const mocks={'./usePavementWorkflow':{usePavementWorkflow(...args){mocks['./usePavementWorkflow'].restore=args[6];return{}}},react,'maplibre-gl':{},'react-router-dom':{useNavigate:()=>()=>{},useParams:()=>({id:project})},'../../../store/authStore':{useAuthStore:()=>({user:{id:actorId,role:'PROJECT_MANAGER'},authEpoch:actorEpoch})},'../../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'./data':{SEGMENT_COLORS:['#C9A227']},'./useGeometryReadModel':{useGeometryReadModel:()=>model},'./useGeometryDraftWorkflow':{useGeometryDraftWorkflow(_p,model,_text,setText,_notify,_unverified,fileInput){workflow.fileInput=fileInput;react.useEffect(()=>{if(model.draft){workflow.form={origin:'-99',widths:'server'};setText('server')}},[model.draft]);return workflow}},'./useAlignmentMapState':{useAlignmentMapState(params){mapInputs.push(params.currentCoords);return{syncMap(){},handleFitBounds(){},mapRef:{current:null}}}}}
 const calls=[],journal=new Map(),control={error:null,badReceipt:false,badReadback:false,badVersion:false,badSection:false},authState={user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1,isAuthenticated:true}
 const v1='"AAAAAAAAAAE="',v2='"AAAAAAAAAAI="'
 let serverDraft={...JSON.parse(sample),id:'saved-draft',projectId:'p',roadSectionId:'road',status:'DRAFT',version:'AAAAAAAAAAI='}
 const response=data=>({data,headers:{etag:v2}})
 const client={async post(url,body,config){return write('POST',url,body,config)},async put(url,body,config){return write('PUT',url,body,config)},async get(url){calls.push({method:'GET',url});return{data:{...serverDraft,...(control.badReadback?{id:'wrong-draft'}:{}),...(control.badSection?{roadSectionId:'other'}:{}),...(control.badCode?{roadCode:'WRONG-CODE'}:{}),...(control.badName?{roadName:'WRONG-NAME'}:{}),...(control.badCoordinates?{editedCoordinates:[{x:0,y:0},{x:1,y:1}]}:{})},headers:{etag:control.badVersion?v1:v2}}}}
 async function write(method,url,body,config){calls.push({method,url,body:plain(body),headers:config.headers});if(control.error)throw control.error;serverDraft={...serverDraft,...plain(body),id:method==='PUT'?url.split('/').at(-1):serverDraft.id,roadSectionId:method==='POST'?(url.includes('/road-sections/')?'road':null):(control.nullSection?null:serverDraft.roadSectionId),editedCoordinates:plain(body.coordinates)};if(control.beMetadata){serverDraft.roadCode=serverDraft.roadSectionId?model.context.roadSections.find(r=>r.roadSectionId===serverDraft.roadSectionId).code:body.roadCode.trim()}return response(control.badReceipt?{...serverDraft,version:null}:serverDraft)}
 mocks['../../types/enums']=mocks['../../../types/enums'];mocks['../../store/authStore']={useAuthStore:{subscribe(){}}};mocks['../client']={apiClient:client};mocks['./projectService']={projectService:{}}
 const maps=[],fits=[]
 if(mapMode){
  delete mocks['./useAlignmentMapState'];mocks['maplibre-gl/dist/maplibre-gl.css']={};mocks['../../../utils/maplibre']={getMapLibreStyle:()=>({}),hasMapBaseStyle:map=>load('src/utils/maplibre.ts').hasMapBaseStyle(map)};mocks['../../../api/services/projectService']={projectService:{}}
  class MapMock{constructor(){this.ready=false;this.tilesReady=false;this.events={};this.sources={};this.layers={};maps.push(this)}on(name,fn){this.events[name]=fn;return this}isStyleLoaded(){return this.ready&&this.tilesReady}getLayer(id){return this.layers[id]||(this.ready&&['satellite-layer','osm-layer'].includes(id)?{id}:null)}getSource(id){return this.sources[id]}addSource(id,definition){this.sources[id]={data:definition.data,setData:data=>{this.sources[id].data=data;if(id==='segments-source')this.centerline=data}};if(id==='segments-source')this.centerline=definition.data}addLayer(layer){this.layers[layer.id]=layer}moveLayer(){}setLayoutProperty(id,key,value){if(this.layers[id]){this.layers[id].layout??={};this.layers[id].layout[key]=value}}triggerRepaint(){}getCanvas(){return{style:{}}}fitBounds(bounds){fits.push(bounds.points)}flyTo(){}remove(){}}
  class Bounds{constructor(){this.points=[]}extend(point){this.points.push(point);return this}}
  mocks['maplibre-gl']={Map:MapMock,LngLatBounds:Bounds}
  mocks['./data']=new Proxy({SEGMENT_COLORS:['#C9A227']},{get:(target,key)=>key in target?target[key]:load(base+'data.ts')[key]})
  mocks['./alignmentMapInteractions']={setupAlignmentMapInteractions(){}}
  mocks['./alignmentMapMarkers']={renderAlignmentMarkers(){}}
  // Exercise actual layer/source setup and updates, with tiles permanently unavailable.
  mocks['./alignmentMapSetup']={initAlignmentMapLayers:p=>load(base+'alignmentMapSetup.ts').initAlignmentMapLayers(p),syncMapDataDirect:(...args)=>load(base+'alignmentMapSetup.ts').syncMapDataDirect(...args)}
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
 return{actor(id,epoch){actorId=id;actorEpoch=epoch;flush()},restoreLayout(layout){mocks['./usePavementWorkflow'].restore(layout);flush()},model,workflow,readers,applied,messages,mapInputs,calls,control,maps,fits,flush,v1,v2,buildInput:(...args)=>load(base+'useGeometryDraftWorkflow.ts').coordinateDraftInput(...args),convert:load('src/api/services/alignmentService.ts').utm48NToWgs84,loadMap(){maps[0].ready=true;maps[0].events['style.load']()},get view(){return view},hydrate(){model.draft={data:serverDraft,etag:v2};model.draftLoading=false;flush()},scope(v){inputScope=v;flush()},context(v,c){ready=v;crs=c;flush()},project(v){project=v;flush()},read(text){(root?view.importState:view).processGeoJSONFile({name:'input.json'});const r=readers.at(-1);if(text!==undefined){r.onload({target:{result:text}});flush()}return r},unmount(){effects.forEach(e=>e?.cleanup?.())}}
}
const tests=[];function test(name,run){tests.push({name,run})}

test('BE section code overrides file and normalized project code completes readback retry without extra POST',async()=>{
 for(const section of [true,false])for(const failGet of [true,false]){const h=harness(true,true);h.control.beMetadata=true;h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:section?[{roadSectionId:'road',code:'SERVER-CODE',name:'Server road'}]:[]};h.flush();const source={...JSON.parse(sample),roadCode:'  Roadguard1  '};h.read(JSON.stringify(source));assert.equal(h.view.fileDraft.roadCode,source.roadCode)
 h.control.badReadback=failGet;await h.view.handleSubmitAlignment();h.flush();if(failGet){assert.ok(h.view.draftWorkflow.pending.receipt);h.control.badReadback=false;await h.view.draftWorkflow.retryCommand();h.flush()}assert.equal(h.view.draftWorkflow.pending,null);assert.equal(h.calls.filter(c=>c.method==='POST').length,1);assert.equal(h.calls[0].body.roadCode,section?'SERVER-CODE':source.roadCode);h.unmount()}
})

test('GET nullable roadName with section restores F5 coordinates and edits without fabricated name',async()=>{
 const h=harness(true,true,true),source=JSON.parse(sample);h.control.beMetadata=true;h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'SERVER-CODE',name:'Tên section server'}]};h.model.draftId='a';h.flush();h.model.draft={data:{...source,id:'a',projectId:'p',roadSectionId:'road',roadCode:'SERVER-CODE',roadName:null,status:'DRAFT',editedCoordinates:source.coordinates,version:'AAAAAAAAAAI='},etag:h.v2};h.flush();h.loadMap();assert.equal(h.view.currentCoords.length,119);assert.equal(h.view.fileDraft.roadName,null);h.view.draftWorkflow.setForm(old=>({...old,reason:'Lý do mới'}));h.flush();assert.equal(h.view.draftWorkflow.saveReason,'');await h.view.handleSubmitAlignment();h.flush();assert.equal(h.view.draftWorkflow.pending,null);const put=h.calls.find(c=>c.method==='PUT');assert.equal(put.headers['If-Match'],h.v2);assert.equal(put.body.roadName,null);assert.deepEqual(put.body.coordinates,source.coordinates);h.unmount()
})

test('project-level missing source names or invalid project CRS never writes',async()=>{
 for(const field of ['roadCode','roadName']){const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(JSON.stringify({...JSON.parse(sample),[field]:undefined}));assert.equal(h.view.fileDraft,null);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0);h.unmount()}
 for(const crs of [null,4326,32649]){const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:crs,roadSections:[]};h.flush();h.read(sample);assert.ok(h.view.draftWorkflow.saveDisabledReason);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0);h.unmount()}
})

test('project-level JSON saves and reads null section without duplicate POST on GET failure',async()=>{
 const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 assert.equal(h.view.draftWorkflow.saveReason,'');h.control.badReadback=true
 await h.view.handleSubmitAlignment();h.flush();assert.ok(h.view.draftWorkflow.pending.receipt)
 h.control.badReadback=false;await h.view.draftWorkflow.retryCommand();h.flush()
 assert.equal(h.calls.filter(c=>c.method==='POST').length,1);assert.equal(h.calls[0].url,'/projects/p/road-geometry-drafts');h.hydrate();assert.equal(h.view.draftWorkflow.busy,false);h.unmount()
})

test('server draft restores engineering state and map after F5 without file/profile and fences another project',()=>{
 const h=harness(true,true,true),source=JSON.parse(sample)
 h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R',currentVersionId:'route'}]}
 h.model.draftId='a';h.flush()
 h.model.draft={data:{...source,changeReason:undefined,coordinates:undefined,editedCoordinates:source.coordinates,id:'a',projectId:'p',roadSectionId:'road',status:'DRAFT',version:'AAAAAAAAAAI='},etag:h.v2};h.flush();h.loadMap()
 assert.equal(h.view.currentCoords.length,119);assert.equal(h.view.currentKmPoints.length,119);assert.ok(h.view.mapState.mapRef.current.getSource('segments-source').data.features.length)
 assert.equal(h.view.draftWorkflow.form.origin,'0');assert.equal(h.view.draftWorkflow.form.surveyWidth,'12');assert.equal(h.view.draftWorkflow.form.reason,'')
 assert.match(h.view.draftWorkflow.saveReason,/changeReason/);assert.ok(!h.view.draftWorkflow.saveReason.includes('hồ sơ CRS'))
 h.view.draftWorkflow.setForm(old=>({...old,reason:'PM nhập lý do cập nhật'}));h.flush();assert.equal(h.view.draftWorkflow.saveReason,'')
 const input=h.buildInput(h.view.draftWorkflow.form,h.view.importState.manualCoordsText,h.model,h.view.fileDraft)
 assert.deepEqual(plain(input.coordinates),source.coordinates);assert.deepEqual(plain(input.widthProfile),source.widthProfile);assert.equal(h.calls.length,0)
 h.project('q');assert.equal(h.view.currentCoords.length,0);assert.equal(h.view.fileDraft,null);assert.equal(h.calls.length,0);h.unmount()
})

test('null-section F5 restores source and edits with latest GET ETag and new reason',async()=>{
 const h=harness(true,true,true),source=JSON.parse(sample);h.control.nullSection=true
 h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]}
 h.model.draftId='a';h.flush()
 h.model.draft={data:{...source,changeReason:undefined,coordinates:undefined,editedCoordinates:source.coordinates,id:'a',projectId:'p',roadSectionId:null,status:'DRAFT',version:'AAAAAAAAAAI='},etag:h.v2};h.flush();h.loadMap()
 assert.equal(h.view.currentCoords.length,119);assert.equal(h.view.currentKmPoints.length,119);assert.ok(h.view.mapState.mapRef.current.getSource('segments-source').data.features.length)
 assert.equal(h.view.draftWorkflow.form.origin,'0');assert.equal(h.view.draftWorkflow.form.surveyWidth,'12');assert.equal(h.view.draftWorkflow.form.reason,'')
 assert.match(h.view.draftWorkflow.saveReason,/changeReason/);assert.ok(!h.view.draftWorkflow.saveReason.includes('hồ sơ CRS'))
 h.view.draftWorkflow.setForm(old=>({...old,reason:'PM nhập lý do cập nhật'}));h.flush();assert.equal(h.view.draftWorkflow.saveReason,'')
 const input=h.buildInput(h.view.draftWorkflow.form,h.view.importState.manualCoordsText,h.model,h.view.fileDraft)
 assert.deepEqual(plain(input.coordinates),source.coordinates);assert.deepEqual(plain(input.widthProfile),source.widthProfile);assert.equal(h.calls.length,0)
 await h.view.handleSubmitAlignment();h.flush();const put=h.calls.find(c=>c.method==='PUT');assert.ok(put);assert.equal(put.headers['If-Match'],h.v2);assert.equal(h.view.draftWorkflow.pending,null);assert.equal(put.body.roadCode,source.roadCode);assert.equal(put.body.roadName,source.roadName);assert.equal(put.body.changeReason,'PM nhập lý do cập nhật');h.project('q');assert.equal(h.view.currentCoords.length,0);assert.equal(h.view.fileDraft,null);assert.equal(h.calls.filter(c=>c.method==='PUT').length,1);h.unmount()
})

test('pending order A URL→draft→geometry restores six pavement values only after confirmed references',()=>{
 const h=harness(true);h.model.draftId='a';h.model.draft={data:{id:'a',projectId:'p',roadSectionId:null,status:'DRAFT'}};h.model.roadReference='';h.model.versionReference='';h.model.geometry=null;h.flush()
 h.view.setStripWidthMeters('3.5');h.view.setSlabLengthM('5.25');h.view.setSlabThicknessCm('27');h.view.setContractionSpacingM('5');h.view.setExpansionSpacingM('50');h.view.setExpansionGapMm('20');h.flush()
 h.model.roadReference='road';h.model.versionReference='v1';h.model.geometry=null;h.flush();h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.flush();assert.ok(Number.isNaN(h.view.slabLengthM))
 const geometry={projectId:'p',roadSectionId:'road',routeVersionId:'v1',sourceDraftId:'a',metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:0,lengthMeters:5,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}],metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]}};h.model.geometry=geometry;h.flush()
 assert.equal(h.view.stripWidthMeters,'3.5');assert.equal(h.view.slabLengthM,'5.25');assert.equal(h.view.slabThicknessCm,'27');assert.equal(h.view.contractionSpacingM,'5');assert.equal(h.view.expansionSpacingM,'50');assert.equal(h.view.expansionGapMm,'20');assert.equal(h.view.alignmentStatus,'CONFIRMED');h.unmount()
})
test('pending order B URL→geometry→draft does not restore before confirmed and restores after',()=>{
 const h=harness(true),g={projectId:'p',roadSectionId:'road',routeVersionId:'v1',sourceDraftId:'a',metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:0,lengthMeters:5,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}],metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]}}
 h.model.draftId='a';h.model.draft=null;h.model.roadReference='';h.model.versionReference='';h.model.geometry=null;h.flush();h.view.setSlabLengthM('5.25');h.view.setSlabThicknessCm('27');h.view.setContractionSpacingM('5');h.view.setExpansionSpacingM('50');h.view.setExpansionGapMm('20');h.view.setStripWidthMeters('3.5');h.flush();h.model.roadReference='road';h.model.versionReference='v1';h.flush();assert.ok(Number.isNaN(h.view.slabLengthM));h.model.geometry=g;h.flush();assert.ok(Number.isNaN(h.view.slabLengthM));assert.equal(h.view.alignmentStatus,'CONFIRMED');h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.flush();assert.equal(h.view.slabLengthM,'5.25');assert.equal(h.view.alignmentStatus,'CONFIRMED');h.unmount()
})
test('pending order C/D and scope cancellation never restore a departed draft',()=>{
 const h=harness(true),g={projectId:'p',roadSectionId:'road',routeVersionId:'v1',sourceDraftId:'a',metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:0,lengthMeters:5,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}],metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]}}
 h.model.draftId='a';h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'DRAFT'}};h.model.roadReference='';h.model.versionReference='';h.model.geometry=null;h.flush();h.view.setSlabLengthM('5.25');h.flush();h.model.roadReference='road';h.model.versionReference='v1';h.flush();h.model.geometry=null;h.model.versionReference='v2';h.flush();h.model.versionReference='v1';h.model.geometry=g;h.flush();assert.ok(Number.isNaN(h.view.slabLengthM));h.unmount()
})
const pavementFields=['stripWidthMeters','slabLengthM','slabThicknessCm','contractionSpacingM','expansionSpacingM','expansionGapMm']
const pavementValues=['3.5','5.25','27','5','50','20']
function pendingSetup(){const h=harness(true);h.model.draftId='a';h.model.roadReference='';h.model.versionReference='';h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'DRAFT'}};h.flush();for(let i=0;i<pavementFields.length;i++)h.view['set'+pavementFields[i][0].toUpperCase()+pavementFields[i].slice(1)](pavementValues[i]);h.flush();return h}
function confirmedFor(id='a',project='p',road='road',version='v1'){return{projectId:project,roadSectionId:road,routeVersionId:version,sourceDraftId:id,metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:0,lengthMeters:5,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}],metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]}}}
function assertEmptyPavement(h){for(const field of pavementFields)assert.ok(Number.isNaN(h.view[field]),field+' must not inherit source config')}
test('source scope A to confirmed B never captures six A pavement values under B key',()=>{
 const h=pendingSetup();h.model.draftId='b';h.model.roadReference='road-b';h.model.versionReference='version-b';h.model.draft={data:{id:'b',projectId:'p',roadSectionId:'road-b',status:'CONFIRMED'}};h.model.geometry=confirmedFor('b','p','road-b','version-b');h.flush();assertEmptyPavement(h);h.unmount()
})
test('source scope project epoch or actor switch cannot capture old pavement even with same draft ID',()=>{
 for(const change of ['project','epoch','actor']){const h=pendingSetup();if(change==='project')h.project('q');else h.actor(change==='actor'?'other':'pm',change==='epoch'?2:1);const p=change==='project'?'q':'p';h.model.draft={data:{id:'a',projectId:p,roadSectionId:'road',status:'CONFIRMED'}};h.model.roadReference='road';h.model.versionReference='v1';h.model.geometry=confirmedFor('a',p);h.flush();assertEmptyPavement(h);h.unmount()}
})
test('same draft response permutations preserve six config values entered before URL and consume pending',()=>{
 for(const order of [['url','draft','geometry'],['url','geometry','draft'],['draft','url','geometry'],['draft','geometry','url']]){const h=pendingSetup();for(const event of order){if(event==='url'){h.model.roadReference='road';h.model.versionReference='v1'}if(event==='draft')h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};if(event==='geometry')h.model.geometry=confirmedFor();h.flush()}
 for(let i=0;i<pavementFields.length;i++)assert.equal(h.view[pavementFields[i]],pavementValues[i],order.join('/')+': '+pavementFields[i]);assert.equal(h.view.alignmentStatus,'CONFIRMED');h.view.setSlabLengthM('6.75');h.flush();h.model.geometry={...confirmedFor()};h.flush();assert.equal(h.view.slabLengthM,'6.75');h.unmount()}
})
test('PM new edit and server layout hydration cancel same draft pending before geometry arrives',()=>{
 for(const source of ['pm','layout']){const h=pendingSetup();h.model.roadReference='road';h.model.versionReference='v1';h.flush();if(source==='pm')h.view.setSlabLengthM('6.75');else h.restoreLayout({stripWidthMeters:4,slabLengthMeters:8.25,slabThicknessCentimeters:30,contractionJointSpacingMeters:6,expansionJointSpacingMeters:40,expansionJointGapMillimeters:0});h.flush();h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.model.geometry=confirmedFor();h.flush();assert.equal(h.view.slabLengthM,source==='pm'?'6.75':8.25);if(source==='layout'){for(const [field,value]of Object.entries({stripWidthMeters:4,slabThicknessCm:30,contractionSpacingM:6,expansionSpacingM:40,expansionGapMm:0}))assert.equal(h.view[field],value)}else for(const field of pavementFields.filter(f=>f!=='slabLengthM'))assert.ok(Number.isNaN(h.view[field]));h.unmount()}
})
test('unbound source without receipt identity must not transfer config into a newly opened draft',()=>{
 const h=pendingSetup();h.model.draftId='';h.model.draft=null;h.model.roadReference='road';h.model.versionReference='v1';h.flush();h.view.setSlabLengthM('5.25');h.flush();h.model.draftId='b';h.model.draft={data:{id:'b',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.model.geometry=confirmedFor('b');h.flush();assertEmptyPavement(h);h.unmount()
})
test('pending source identity is cancelled on actor epoch project or draft departure and never resurrected',()=>{
 for(const change of ['actor','epoch','project','draft']){const h=pendingSetup();h.model.roadReference='road';h.model.versionReference='v1';h.flush();assertEmptyPavement(h);if(change==='actor'||change==='epoch')h.actor(change==='actor'?'other':'pm',change==='epoch'?2:1);if(change==='project')h.project('q');if(change==='draft'){h.model.draftId='b';h.flush()}
 if(change==='actor'||change==='epoch')h.actor('pm',1);if(change==='project')h.project('p');if(change==='draft')h.model.draftId='a';h.model.geometry=confirmedFor();h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.flush();assertEmptyPavement(h);h.unmount()}
})
test('confirmed geometry F5 hydrates metric-only map/chainage without dirtying editor or replacing pavement config',()=>{
 const h=harness(true),sampleDto=JSON.parse(sample);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',currentVersionId:'v1'}]}
 h.model.draftId='a';h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}}
 const g={projectId:'p',roadSectionId:'road',routeVersionId:'v1',sourceDraftId:'a',metadataStatus:'COMPLETE',sourceCrs:32648,engineeringSrid:32648,stationOriginMeters:1234.123456789,lengthMeters:5,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}],metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500003,1000004]]}}
 h.model.geometry=g;h.model.versionReference='v1';h.model.roadReference='road';h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'DRAFT'}};h.flush();h.view.setSlabLengthM('5.25');h.view.setSlabThicknessCm('27');h.view.setContractionSpacingM('5');h.view.setExpansionSpacingM('50');h.view.setExpansionGapMm('20');h.view.setStripWidthMeters('3.5');h.flush();h.model.geometry=null;h.model.draft={data:{id:'a',projectId:'p',roadSectionId:'road',status:'CONFIRMED'}};h.flush();h.model.geometry=g;h.flush()
 assert.equal(h.view.currentCoords.length,2);assert.deepEqual(plain(h.view.currentKmPoints),[1234.123456789/1000,1239.123456789/1000]);assert.equal(h.view.segmentsState.segments.length,1);assert.equal(h.view.segmentsState.segments[0].startKm,1.234123456789);assert.ok(Math.abs(h.view.segmentsState.segments[0].endKm-1.239123456789)<1e-12);assert.equal(h.view.segmentsState.segments[0].roadWidthM,7);assert.equal(h.view.segmentsState.segments[0].statusText,'HÌNH HỌC ĐÃ XÁC NHẬN');assert.equal(h.view.localDraftDirty,false);assert.equal(h.view.stripWidthMeters,'3.5');assert.equal(h.view.slabLengthM,'5.25');assert.equal(h.view.slabThicknessCm,'27');assert.equal(h.view.contractionSpacingM,'5');assert.equal(h.view.expansionSpacingM,'50');assert.equal(h.view.expansionGapMm,'20');assert.equal(h.view.alignmentStatus,'CONFIRMED')
 h.model.geometry=null;h.model.versionReference='v2';h.flush();assert.equal(h.view.segmentsState.segments.length,0);h.model.geometry={...g,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:7}]};h.model.versionReference='v1';h.flush();assert.equal(h.view.segmentsState.segments.length,1);assert.equal(h.view.segmentsState.segments[0].roadWidthM,7);h.model.geometry={...g,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:2,widthMeters:6},{fromOffsetMeters:2,toOffsetMeters:5,widthMeters:9}]};h.model.versionReference='v1';h.flush();assert.equal(h.view.segmentsState.segments.length,2);assert.equal(h.view.segmentsState.segments[1].startKm,1.236123456789);h.view.markWidthDraft();h.flush();const local=plain(h.view.segmentsState.segments);h.model.geometry={...g,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:20}]};h.flush();assert.deepEqual(plain(h.view.segmentsState.segments),local);h.model.geometry={...g,routeVersionId:'v2',widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5,widthMeters:12}]};h.model.versionReference='v2';h.flush();assert.equal(h.view.currentCoords.length,2);assert.equal(h.view.segmentsState.segments.length,1);assert.equal(h.view.segmentsState.segments[0].roadWidthM,12);assert.equal(h.view.localDraftDirty,false);assert.ok(Number.isNaN(h.view.slabLengthM))
 h.model.geometry={...g,routeVersionId:'v2'};h.flush();assert.equal(h.view.currentCoords.length,2)
 h.project('q');assert.equal(h.view.currentCoords.length,0);h.model.geometry=g;h.flush();assert.equal(h.view.currentCoords.length,0);h.unmount()
})
test('file preview input applies independently of context and preserves full source DTO',()=>{
 const h=harness();h.context(false,null);h.read(sample);assert.equal(h.applied.length,1);assert.match(h.view.readMessage,/chưa tải được context/i)
 h.context(true,null);h.context(true,32649);h.context(true,32648);assert.equal(h.applied.length,1)
 assert.deepEqual(plain(h.applied[0]),JSON.parse(sample));assert.equal(h.view.hasUnverifiedFile,true);assert.match(h.view.readMessage,/chưa lưu/);assert.match(h.view.manualCoordsText,/^798577.937027, 1269894.645247/);h.unmount()
})
test('malformed JSON, invalid DTO and read failure retain valid file input',()=>{
 const h=harness();h.read(sample);const before=h.view.manualCoordsText
 for(const text of ['{',JSON.stringify({...JSON.parse(sample),sourceCrs:4326})]){h.read(text);assert.equal(h.applied.length,1);assert.equal(h.view.manualCoordsText,before);assert.equal(h.view.hasUnverifiedFile,true)}
 h.read().onerror();h.flush();assert.equal(h.view.manualCoordsText,before);assert.equal(h.applied.length,1);h.unmount()
})
test('ABC1 work-package 200 with null CRS and empty sections reports both missing setup facts without changing them',()=>{
 const h=harness(true),id='9b51bb39-8c5f-43f1-84a2-520a1d8b5eba';h.project(id)
 h.model.context={projectId:id,engineeringUtmSrid:null,roadSections:[],accessRole:'PM'};h.flush();h.read(sample)
 assert.match(h.view.importState.readMessage,/chưa thiết lập engineeringUtmSrid/);assert.match(h.view.importState.readMessage,/chưa có road section\/version/);assert.ok(!h.view.importState.readMessage.includes('chưa tải được'))
 assert.ok(h.view.fileDraft);assert.equal(h.view.currentCoords.length,JSON.parse(sample).coordinates.length);assert.equal(h.model.context.engineeringUtmSrid,null);assert.equal(h.model.context.roadSections.length,0);assert.equal(h.calls.length,0)
 h.model.context={...h.model.context,engineeringUtmSrid:32648};h.flush();h.read(sample);assert.match(h.view.importState.readMessage,/chưa có road section\/version/);assert.ok(!h.view.importState.readMessage.includes('chưa thiết lập engineeringUtmSrid'));assert.equal(h.calls.length,0);h.unmount()
})
test('new file, scope changes and unmount reject old reads and cancel pending files',()=>{
 for(const scope of ['p:b','other:a','2:p:a']){const h=harness(),r=h.read();h.scope(scope);r.onload({target:{result:sample}});h.flush();assert.equal(h.applied.length,0);h.unmount()}
 const h=harness(),old=h.read(),next=h.read();next.onload({target:{result:sample}});h.flush();old.onload({target:{result:JSON.stringify({...JSON.parse(sample),stationOriginMeters:99})}});h.flush();assert.equal(h.applied.length,1)
 h.context(false,null);h.read(sample);h.read('{');h.context(true,32648);assert.equal(h.applied.length,2)
 h.context(false,null);h.read(sample);h.scope('p:b');h.context(true,32648);assert.equal(h.applied.length,3)
 const late=h.read();h.unmount();late.onload({target:{result:sample}});assert.equal(h.applied.length,3)
})
test('GeoJSON uses original inspection and stays unverified',()=>{
 const h=harness();h.read(sample);h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}));assert.equal(h.applied.at(-1),null);assert.equal(h.view.manualCoordsText,'108, 16\n108.1, 16.1');assert.equal(h.view.hasUnverifiedFile,true);h.unmount()
})
test('real import/state/segments populate sidebar, isolate UTM from map and survive late hydrate',()=>{
 const h=harness(true);h.read(sample);assert.ok(h.view.fileDraft)
 h.model.context={projectId:'other',engineeringUtmSrid:32648,roadSections:[]};h.flush();assert.ok(h.view.fileDraft)
 h.model.context={projectId:'p',engineeringUtmSrid:32649,roadSections:[]};h.flush();assert.ok(h.view.fileDraft)
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
 h.read(JSON.stringify({...b,sourceCrs:4326}));assert.equal(h.view.segmentsState.editingSegment,a);assert.equal(h.view.activeSegments[0].roadWidthM,7)
 h.read(JSON.stringify(b));assert.equal(h.view.activeSegments[0].roadWidthM,9);assert.equal(h.view.activeSegments[0].startKm,.1);assert.equal(h.workflow.form.reason,'Draft B');assert.equal(h.workflow.form.origin,'100')
 assert.equal(h.view.segmentsState.editingSegment,null);assert.equal(h.view.segmentsState.splitModalSegment,null);assert.equal(h.view.segmentsState.selectedSegmentId,null);assert.equal(h.view.segmentsState.isAddSegmentModalOpen,false);assert.equal(h.view.segmentsState.newSegForm.code,'');assert.ok(Number.isNaN(h.view.segmentsState.newSegForm.roadWidthM));assert.ok(Number.isNaN(h.view.segmentsState.customSplitKm));assert.ok(Number.isNaN(h.view.segmentsState.splitDistance));assert.equal(h.view.localDraftDirty,true);h.unmount()
})
test('Draft to GeoJSON removes old width length chainage and technical form without inventing new values',()=>{
 const h=harness(true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 const s=h.view.segmentsState,a=h.view.activeSegments[0];s.setEditingSegment(a);s.setSplitModalSegment(a);s.setSelectedSegmentId(a.id);h.flush()
 h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}))
 assert.equal(h.view.fileDraft,null);assert.equal(h.view.importState.manualCoordsText,'108, 16\n108.1, 16.1');assert.equal(h.view.activeSegments.length,0);assert.ok(!Number.isFinite(h.view.importedLengthKm));assert.deepEqual(plain(h.view.currentCoords),[[108,16],[108.1,16.1]]);assert.equal(h.view.currentKmPoints.length,0)
 for(const key of ['origin','reason','surveyWidth','widths','profileId'])assert.equal(h.workflow.form[key],'')
 assert.equal(h.view.segmentsState.editingSegment,null);assert.equal(h.view.segmentsState.splitModalSegment,null);assert.equal(h.view.segmentsState.selectedSegmentId,null);assert.equal(h.view.localDraftDirty,true);assert.equal(h.view.importState.hasUnverifiedFile,true)
 h.model.geometry={projectId:'p',lengthMeters:701.290518512277};h.flush();assert.ok(!Number.isFinite(h.view.importedLengthKm));assert.equal(h.view.activeSegments.length,0);h.unmount()
})
test('UI layout files remain unchanged except status-only caller wiring',()=>{
 const cp=require('child_process');for(const name of ['ImportPanel','AlignmentImportModal','SidebarWidthProfileTab']){const file=base+name+'.tsx';assert.equal(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'),cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}).replaceAll('\r\n','\n'))}
 const sidebar=fs.readFileSync(base+'AlignmentSidebar.tsx','utf8');assert.ok(sidebar.includes('alignmentStatus={alignmentStatus}'));assert.ok(!sidebar.includes('className="grid'))
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
 const h=harness(true,true),sections=[{roadSectionId:'r1',code:'R1'},{roadSectionId:'r2',code:'R2'}];h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:sections};h.flush();h.read(sample);assert.equal(h.view.draftWorkflow.saveReason,'');h.view.draftWorkflow.setForm(old=>({...old,sectionId:'outside-project'}));h.flush();assert.match(h.view.draftWorkflow.saveReason,/một tuyến/);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0)
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
 for(const field of ['badReceipt','badReadback','badVersion','badSection','badCoordinates','badCode','badName']){const h=harness(true,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R'}]};h.flush();h.read(sample);h.control[field]=true;await h.view.handleSubmitAlignment();h.flush();assert.equal(h.model.draftId,'');assert.ok(h.view.draftWorkflow.pending.receipt);await h.view.handleSubmitAlignment();assert.equal(h.calls.filter(c=>c.method==='POST').length,1);if(field!=='badReceipt'){h.control[field]=false;await h.view.draftWorkflow.retryCommand();h.flush();assert.equal(h.calls.filter(c=>c.method==='POST').length,1);h.hydrate();assert.equal(h.view.draftWorkflow.busy,false)}h.unmount()}
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
 h.read(JSON.stringify({type:'LineString',coordinates:[[108,16],[108.1,16.1]]}));assert.deepEqual(plain(h.maps[0].centerline.features[0].geometry.coordinates),[[108,16],[108.1,16.1]])
 h.read(sample);h.model.draftId='b';h.flush();assert.equal(h.maps[0].centerline.features.length,0);h.unmount()
 const waiting=harness(true,false,true);waiting.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};waiting.flush();waiting.read(sample);waiting.model.draftId='b';waiting.flush();waiting.loadMap();assert.equal(waiting.maps[0].centerline.features.length,0);assert.equal(waiting.fits.length,0);waiting.unmount()
})
test('raster tile failure never blocks style-ready overlay setup, latest preview updates or fitBounds',()=>{
 const h=harness(true,false,true);h.read(sample);const map=h.maps[0]
 assert.equal(map.isStyleLoaded(),false);assert.equal(map.getSource('segments-source'),undefined)
 h.loadMap() // style.load only: no map load event, no successful raster requests.
 assert.equal(map.isStyleLoaded(),false);assert.equal(map.events.load,undefined)
 assert.equal(map.getSource('segments-source').data.features[0].geometry.coordinates.length,119)
 assert.ok(map.getLayer('segments-line-layer')||Object.values(map.layers).some(l=>l.type==='line'))
 const geo={type:'LineString',coordinates:[[106,20],[106.01,20.02]]};h.read(JSON.stringify(geo))
 assert.deepEqual(plain(map.getSource('segments-source').data.features[0].geometry.coordinates),geo.coordinates)
 assert.deepEqual(plain(h.fits.at(-1)),geo.coordinates)
 h.model.draftId='next';h.flush();assert.equal(map.getSource('segments-source').data.features.length,0)
 assert.equal(h.calls.length,0);h.unmount()
})
test('zone49 and CRS mismatch keep engineering input but never render a zone48 preview or stale queued line',()=>{
 const h=harness(true,false,true);h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[]};h.flush();h.read(sample)
 h.model.context={projectId:'p',engineeringUtmSrid:32649,roadSections:[]};h.flush();assert.equal(h.view.currentCoords.length,JSON.parse(sample).coordinates.length)
 const zone49={...JSON.parse(sample),sourceCrs:32649};h.read(JSON.stringify(zone49));assert.deepEqual(plain(h.view.fileDraft),zone49);assert.match(h.view.importState.readMessage,/Chưa hỗ trợ preview.*32649/);assert.equal(h.view.currentCoords.length,0)
 h.loadMap();assert.ok(h.maps[0].centerline.features.every(f=>f.geometry.coordinates.length===0));assert.equal(h.fits.length,0);assert.ok(h.view.importedLengthKm>0);assert.equal(h.calls.length,0);h.unmount()
})
test('two independent Draft locations and third RFC7946 file preview without project setup or business writes',async()=>{
 const h=harness(true,true,true)
 const draft=(x,y,count)=>({sourceKind:'COORDINATES',sourceCrs:32648,stationOriginMeters:25,roadCode:'TEST-SOURCE',roadName:'Tuyến nguồn kiểm thử',changeReason:'Dữ liệu kiểm thử cục bộ',coordinates:Array.from({length:count},(_,i)=>({x:x+3*i,y:y+4*i})),surveyWidthMeters:12,widthProfile:[{fromOffsetMeters:0,toOffsetMeters:5*(count-1),widthMeters:7}]})
 const a=draft(500000,1000000,3),b=draft(700000,1800000,4)
 h.read(JSON.stringify(a));const first=plain(h.view.currentCoords);assert.deepEqual(plain(h.view.fileDraft),a);assert.equal(first.length,a.coordinates.length);h.loadMap()
 const old=h.read();h.read(JSON.stringify(b));old.onload({target:{result:JSON.stringify(a)}});h.flush()
 assert.deepEqual(plain(h.view.fileDraft),b);assert.deepEqual(plain(h.view.currentCoords[0]),plain(h.convert(b.coordinates[0].x,b.coordinates[0].y)));assert.notDeepEqual(plain(h.view.currentCoords[0]),first[0]);assert.equal(h.view.currentCoords.length,b.coordinates.length);assert.deepEqual(plain(h.fits.at(-1)),plain(h.view.currentCoords));assert.equal(h.view.importedLengthKm,.015)
 h.model.context={projectId:'p',engineeringUtmSrid:null,roadSections:[]};h.flush();assert.deepEqual(plain(h.view.fileDraft),b);await h.view.handleSubmitAlignment();assert.equal(h.calls.length,0)
 const geo={type:'LineString',coordinates:[[121,10],[121.01,10.02],[121.03,10.04]]};h.read(JSON.stringify(geo));assert.deepEqual(plain(h.view.currentCoords),geo.coordinates);assert.deepEqual(plain(h.maps[0].centerline.features[0].geometry.coordinates),geo.coordinates);assert.deepEqual(plain(h.fits.at(-1)),geo.coordinates);assert.equal(h.view.fileDraft,null);assert.equal(h.view.activeSegments.length,0);assert.ok(!Number.isFinite(h.view.importedLengthKm));assert.equal(h.view.currentKmPoints.length,0);assert.match(h.view.draftWorkflow.saveReason,/chưa có mapping/);assert.equal(h.calls.length,0);h.unmount()
})
test('GeoJSON declared CRS handling rejects ambiguity and unsupported CRS without replacing valid preview',()=>{
 const h=harness(true,false,true),crs=srid=>({type:'name',properties:{name:`EPSG:${srid}`}}),geo={type:'LineString',coordinates:[[106,20],[106.01,20.02]]};h.read(JSON.stringify(geo));h.loadMap();const before=plain(h.view.currentCoords)
 for(const [input,pattern]of [[{...geo,crs:crs(3857)},/3857.*chưa hỗ trợ/],[{...geo,crs:crs(32649)},/32649.*không chuyển/],[{...geo,crs:null},/crs rỗng/],[{...geo,coordinates:[[500000,1000000],[500003,1000004]]},/RFC7946.*không đoán/],[{type:'Feature',crs:crs(4326),geometry:{...geo,crs:crs(32648)}},/mâu thuẫn/]]){h.read(JSON.stringify(input));assert.match(h.view.importState.readMessage,pattern);assert.deepEqual(plain(h.view.currentCoords),before)}
 const projected={type:'Feature',crs:crs(32648),properties:{},geometry:{type:'LineString',coordinates:[[600000,1200000],[600003,1200004]]}};h.read(JSON.stringify(projected));assert.deepEqual(plain(h.view.currentCoords[0]),plain(h.convert(600000,1200000)));assert.equal(h.view.importState.manualCoordsText,'600000, 1200000\n600003, 1200004');assert.equal(h.view.fileDraft,null)
 h.read(JSON.stringify({...geo,crs:{type:'name',properties:{name:'urn:ogc:def:crs:OGC:1.3:CRS84'}}}));assert.deepEqual(plain(h.view.currentCoords),geo.coordinates);assert.equal(h.calls.length,0);h.unmount()
})
test('mainline auto split uses newest preset/input even through stale callback and keeps exact 701m tail at width7',()=>{
 const h=harness(true,false,true);h.read(sample);h.loadMap();h.view.handleSetSplitDistance(.25);h.flush();const delayed=h.view.handleApplyAutoSplit
 h.view.handleSetSplitDistance(.2);h.flush();delayed();h.view.markWidthDraft();h.flush()
 const segments=h.view.activeSegments,end=JSON.parse(sample).widthProfile[0].toOffsetMeters
 assert.equal(segments.length,4);[200,200,200,end-600].forEach((length,i)=>assert.ok(Math.abs(segments[i].lengthKm*1000-length)<1e-9));assert.ok(segments.every(s=>s.roadWidthM===7));assert.equal(segments[0].startKm,0);assert.equal(segments.at(-1).endKm,end/1000)
 for(let i=1;i<segments.length;i++)assert.equal(segments[i-1].endKm,segments[i].startKm)
 assert.equal(h.maps[0].centerline.features.filter(f=>f.geometry.type==='LineString').length,4);assert.equal(h.view.localDraftDirty,true);assert.deepEqual(plain(h.view.fileDraft),JSON.parse(sample));assert.equal(h.calls.length,0)
 h.view.handleSetSplitDistance(.15);delayed();h.view.markWidthDraft();h.flush();assert.equal(h.view.activeSegments[0].endKm,.15);assert.equal(h.view.activeSegments.at(-1).endKm,end/1000);assert.ok(h.view.activeSegments.every(s=>s.lengthKm<=.15+1e-12&&s.roadWidthM===7));h.unmount()
})
test('mainline auto split preserves edited width regions, their exact boundaries and nonzero chainage',()=>{
 const h=harness(true,false,true),draft=JSON.parse(sample);draft.stationOriginMeters=1000.123456;const end=draft.widthProfile[0].toOffsetMeters
 draft.widthProfile=[{fromOffsetMeters:0,toOffsetMeters:250,widthMeters:7},{fromOffsetMeters:250,toOffsetMeters:450,widthMeters:9},{fromOffsetMeters:450,toOffsetMeters:end,widthMeters:6}]
 h.read(JSON.stringify(draft));h.loadMap();const original=h.view.activeSegments.map(s=>({start:s.startKm,end:s.endKm}));h.view.handleUpdateSegmentWidth(h.view.activeSegments[1].id,11);h.view.markWidthDraft();h.flush()
 h.view.handleSetSplitDistance(.2);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush();const segments=h.view.activeSegments
 assert.equal(segments.length,6);assert.deepEqual(plain(segments.map(s=>s.roadWidthM)),[7,7,11,11,6,6]);assert.equal(segments[0].startKm,original[0].start);assert.equal(segments.at(-1).endKm,original.at(-1).end);assert.equal(segments[1].endKm,original[0].end);assert.equal(segments[3].endKm,original[1].end)
 for(let i=1;i<segments.length;i++)assert.equal(segments[i-1].endKm,segments[i].startKm)
 assert.ok(Math.abs(segments.reduce((sum,s)=>sum+s.lengthKm*1000,0)-end)<1e-9);assert.equal(h.maps[0].centerline.features.filter(f=>f.geometry.type==='LineString').length,segments.length);assert.equal(h.calls.length,0);h.unmount()
})
test('mainline redivide 200 then250 discards old cuts; descending is display only and payload remains valid',()=>{
 const h=harness(true,false,true);h.model.profiles=[];h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R'}]};h.flush();h.read(sample);h.loadMap()
 for(const distance of [.2,.25]){h.view.handleSetSplitDistance(distance);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush()}
 const segments=h.view.segmentsState.segments,end=JSON.parse(sample).widthProfile[0].toOffsetMeters;assert.equal(segments.length,3);assert.deepEqual(plain(segments.map(s=>s.startKm)),[0,.25,.5]);[250,250,end-500].forEach((len,i)=>assert.ok(Math.abs(segments[i].lengthKm*1000-len)<1e-9))
 h.view.segmentsState.setSplitSortOrder('desc');h.flush();assert.deepEqual(plain(h.view.activeSegments.map(s=>s.startKm)),[.5,.25,0]);assert.deepEqual(plain(h.view.segmentsState.segments.map(s=>s.startKm)),[0,.25,.5])
 const input=h.buildInput(h.workflow.form,h.view.importState.manualCoordsText,h.model,h.workflow.fileInput);assert.equal(input.widthProfile[0].fromOffsetMeters,0);assert.equal(input.widthProfile.at(-1).toOffsetMeters,end);assert.ok(input.widthProfile.every((w,i)=>w.widthMeters===7&&(!i||w.fromOffsetMeters===input.widthProfile[i-1].toOffsetMeters)));assert.equal(h.maps[0].centerline.features.filter(f=>f.geometry.type==='LineString').length,3);assert.equal(h.calls.length,0);h.unmount()
})
test('mainline manual split precision survives redivide and only a real width change keeps its boundary',()=>{
 const h=harness(true,false,true);h.read(sample);h.loadMap();const split=.123456789,event={preventDefault(){}}
 h.view.segmentsState.setSplitModalSegment(h.view.activeSegments[0]);h.view.segmentsState.setCustomSplitKm(split);h.flush();h.view.handleSplitSegmentSubmit(event);h.view.markWidthDraft();h.flush()
 assert.equal(h.view.activeSegments[0].endKm,split);assert.equal(h.view.activeSegments[1].startKm,split);assert.equal(h.view.activeSegments[1].lengthKm,h.view.activeSegments[1].endKm-split)
 h.view.handleSetSplitDistance(.25);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush();assert.equal(h.view.activeSegments.length,3);assert.ok(!h.view.activeSegments.some(s=>s.endKm===split))
 const target=h.view.activeSegments[1],realBoundary=.333333333;h.view.segmentsState.setSplitModalSegment(target);h.view.segmentsState.setCustomSplitKm(realBoundary);h.flush();h.view.handleSplitSegmentSubmit(event);h.view.markWidthDraft();h.flush()
 const changed=h.view.activeSegments.find(s=>s.startKm===realBoundary);h.view.handleUpdateSegmentWidth(changed.id,9);h.view.markWidthDraft();h.flush();h.view.handleSetSplitDistance(.2);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush()
 assert.ok(h.view.activeSegments.some(s=>s.startKm===realBoundary&&s.roadWidthM===9));assert.ok(h.view.activeSegments.some(s=>s.endKm===realBoundary&&s.roadWidthM===7));assert.equal(h.calls.length,0);h.unmount()
})
test('mainline redivide retains lane and material boundaries even when widths match',()=>{
 const h=harness(true);h.read(sample);const base=h.view.activeSegments[0],end=base.endKm
 h.view.segmentsState.setSegments([{...base,id:'one',endKm:.25,lengthKm:.25,laneCount:2,surfaceMaterial:'A'},{...base,id:'two',startKm:.25,endKm:.45,lengthKm:.2,laneCount:3,surfaceMaterial:'A'},{...base,id:'three',startKm:.45,lengthKm:end-.45,laneCount:3,surfaceMaterial:'B'}]);h.view.markWidthDraft();h.flush();h.view.handleSetSplitDistance(.3);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush()
 assert.ok(h.view.activeSegments.some(s=>s.endKm===.25&&s.laneCount===2));assert.ok(h.view.activeSegments.some(s=>s.startKm===.25&&s.laneCount===3));assert.ok(h.view.activeSegments.some(s=>s.endKm===.45&&s.surfaceMaterial==='A'));assert.ok(h.view.activeSegments.some(s=>s.startKm===.45&&s.surfaceMaterial==='B'));assert.ok(h.view.activeSegments.every(s=>s.roadWidthM===7));h.unmount()
})
test('mainline nonzero origin edits and explicit snap preserve precision; gaps and invalid distance are never silently repaired',()=>{
 const h=harness(true);h.model.profiles=[];h.model.context={projectId:'p',engineeringUtmSrid:32648,roadSections:[{roadSectionId:'road',code:'R'}]};h.flush();const draft=JSON.parse(sample);draft.stationOriginMeters=1000.123456;h.read(JSON.stringify(draft));const first=h.view.activeSegments[0],split=first.startKm+.123456789,event={preventDefault(){}}
 h.view.segmentsState.setSplitModalSegment(first);h.view.segmentsState.setCustomSplitKm(split);h.flush();h.view.handleSplitSegmentSubmit(event);h.view.markWidthDraft();h.flush();const last=h.view.activeSegments[1],gapStart=split+.000000123
 h.view.segmentsState.setEditingSegment({...last,startKm:gapStart,lengthKm:0});h.flush();assert.equal(h.view.segmentsState.editingSegment.lengthKm,last.endKm-gapStart);h.view.handleSaveEditedSegment(event);h.flush();assert.equal(h.view.activeSegments[1].startKm,gapStart);assert.equal(h.view.activeSegments[1].endKm,last.endKm);assert.equal(h.view.activeSegments[1].hasGap,true)
 assert.throws(()=>h.buildInput(h.workflow.form,h.view.importState.manualCoordsText,h.model,h.workflow.fileInput));const snapshot=plain(h.view.activeSegments)
 for(const distance of [0,-1,NaN,Infinity,.2]){h.view.handleSetSplitDistance(distance);h.flush();h.view.handleApplyAutoSplit();h.flush();assert.deepEqual(plain(h.view.activeSegments),snapshot)}
 h.view.handleSnapSegment(last.id);h.view.markWidthDraft();h.flush();assert.equal(h.view.activeSegments[1].startKm,split);assert.equal(h.view.activeSegments[1].endKm,last.endKm);assert.equal(h.view.activeSegments[1].lengthKm,last.endKm-split)
 const input=h.buildInput(h.workflow.form,h.view.importState.manualCoordsText,h.model,h.workflow.fileInput);assert.equal(input.stationOriginMeters,draft.stationOriginMeters);assert.equal(input.widthProfile.at(-1).toOffsetMeters,draft.widthProfile[0].toOffsetMeters);assert.equal(h.calls.length,0);h.unmount()
})
test('mainline pavement state and actual map sources share configuration, late style load and width/split updates',()=>{
 const h=harness(true,false,true);h.read(sample);h.view.setRightTab('SLABS');h.flush();assert.equal(h.view.segmentsState.slabs.length,0);assert.ok(h.view.mapState.pavementPreview.issues.some(issue=>/bề rộng tấm/.test(issue.message)));assert.ok(!h.view.mapState.pavementPreview.issues.some(issue=>/số làn/.test(issue.message)))
 h.view.setStripWidthMeters(7/3);h.view.setSlabLengthM(5);h.view.setSlabThicknessCm(28);h.view.setContractionSpacingM(7);h.view.setExpansionSpacingM(11);h.view.setExpansionGapMm(20);h.flush();h.loadMap()
 const compare=()=>{const rows=h.view.segmentsState.slabs,features=h.maps[0].getSource('slabs-source').data.features,labels=h.maps[0].getSource('slabs-labels-source').data.features;assert.equal(rows.length,features.length);assert.equal(rows.length,labels.length);assert.deepEqual(plain(h.view.mapState.pavementPreview.slabsGeoJSON),plain(h.maps[0].getSource('slabs-source').data));assert.deepEqual(plain(h.view.mapState.pavementPreview.jointsGeoJSON),plain(h.maps[0].getSource('joints-source').data));for(let i=0;i<rows.length;i++){for(const key of ['id','lengthM','widthM','thicknessCm'])assert.equal(rows[i][key],features[i].properties[key]);assert.equal(labels[i].properties.id,rows[i].id);assert.equal(labels[i].properties.sequence,i+1)}}
 compare();assert.equal(h.view.segmentsState.slabs.length,423)
 h.view.handleUpdateAllWidths(12);h.view.setStripWidthMeters(4);h.view.markWidthDraft();h.flush();compare();assert.ok(h.view.segmentsState.slabs.every(s=>s.widthM===4))
 h.view.setSlabLengthM(4);h.view.setContractionSpacingM(4);h.view.setSlabThicknessCm(33);h.view.setExpansionGapMm(30);h.flush();compare();assert.equal(h.view.segmentsState.slabs.length,528);assert.ok(h.view.segmentsState.slabs.every(s=>s.thicknessCm===33))
 h.view.setStripWidthMeters(6);h.view.markWidthDraft();h.flush();compare();assert.equal(h.view.segmentsState.slabs.length,352)
 h.view.handleSetSplitDistance(.2);h.flush();h.view.handleApplyAutoSplit();h.view.markWidthDraft();h.flush();compare();const before=plain(h.maps[0].getSource('edges-source').data),labelsBefore=plain(h.maps[0].getSource('slabs-labels-source').data);h.view.segmentsState.setSplitSortOrder('desc');h.flush();compare();assert.deepEqual(plain(h.maps[0].getSource('edges-source').data),before);assert.deepEqual(plain(h.maps[0].getSource('slabs-labels-source').data),labelsBefore)
 h.view.mapState.setShowSlabsAndJoints(false);h.flush();assert.equal(h.maps[0].layers['slabs-label-layer'].layout.visibility,'none');assert.notEqual(h.maps[0].layers['edges-dimension-line-layer'].layout?.visibility,'none')
 h.view.handleUpdateAllWidths(NaN);h.view.markWidthDraft();h.flush();assert.equal(h.view.segmentsState.slabs.length,0);assert.equal(h.maps[0].getSource('slabs-source').data.features.length,0);assert.ok(h.view.mapState.pavementPreview.issues.some(issue=>/bề rộng/.test(issue.message)));assert.equal(h.calls.length,0);h.unmount()
})
test('branch A/B editing is isolated, redivide uses newest distance and source geometry/mainline pavement stay intact',()=>{
 const h=harness(true,false,true);h.read(sample);h.view.segmentsState.setSegments(h.view.segmentsState.segments.map(s=>({...s,laneCount:3})));h.view.setSlabLengthM(5);h.view.setSlabThicknessCm(28);h.view.setContractionSpacingM(7);h.view.setExpansionSpacingM(50);h.view.setExpansionGapMm(20);h.flush();h.loadMap()
 h.view.handleSetSplitDistance(.3);h.flush();const delayedMain=h.view.handleApplyAutoSplit
 const main=plain(h.view.segmentsState.segments),slabs=plain(h.maps[0].getSource('slabs-source').data),point=h.view.currentCoords[0],a={id:'branch-a',name:'A',roadWidthM:7,laneCount:2,surfaceMaterial:'A',coords:[point,[point[0]+.002,point[1]+.001],[point[0]+.004,point[1]+.0025]]},b={id:'branch-b',name:'B',roadWidthM:9,laneCount:3,surfaceMaterial:'B',coords:[point,[point[0]-.003,point[1]+.002],[point[0]-.005,point[1]+.004]]}
 h.view.handleAddBranch(a);h.flush();assert.equal(h.view.selectedTargetType,a.id);assert.deepEqual(plain(h.view.currentBranch.coords),plain(a.coords))
 h.view.handleAddBranch(b);h.flush();delayedMain();h.flush();const bBefore=plain(h.view.currentBranch);h.view.setSelectedTargetType(a.id);h.flush();h.view.handleSetSplitDistance(.3);h.flush();const delayed=h.view.handleApplyAutoSplit;h.view.handleSetSplitDistance(.2);h.flush();delayed();h.view.markWidthDraft();h.flush()
 let branch=h.view.currentBranch;assert.equal(branch.segments.length,Math.ceil(branch.lengthKm/.2));assert.equal(branch.segments[0].endKm,.2);assert.equal(branch.segments.at(-1).endKm,branch.lengthKm);assert.ok(branch.segments.every(s=>s.roadWidthM===7&&s.laneCount===2&&s.surfaceMaterial==='A'));assert.deepEqual(plain(h.view.branches.find(item=>item.id===b.id)),bBefore)
 h.view.handleSetSplitDistance(.25);h.flush();h.view.handleApplyAutoSplit();h.flush();branch=h.view.currentBranch;assert.equal(branch.segments.length,Math.ceil(branch.lengthKm/.25));assert.deepEqual(plain(branch.coords),plain(a.coords))
 const geometryBefore=plain(h.maps[0].getSource('branches-source').data);h.view.segmentsState.setSplitSortOrder('desc');h.flush();assert.ok(h.view.activeSegments[0].startKm>=h.view.activeSegments.at(-1).startKm);assert.equal(h.view.currentBranch.segments[0].startKm,0);assert.deepEqual(plain(h.maps[0].getSource('branches-source').data),geometryBefore)
 const aBefore=plain(h.view.currentBranch);h.view.setSelectedTargetType(b.id);h.flush();delayed();h.flush();assert.deepEqual(plain(h.view.currentBranch),bBefore)
 h.view.handleUpdateAllWidths(11);h.view.markWidthDraft();h.flush();const event={preventDefault(){}},split=.123456789;h.view.segmentsState.setSplitModalSegment(h.view.currentBranch.segments[0]);h.view.segmentsState.setCustomSplitKm(split);h.flush();h.view.handleSplitSegmentSubmit(event);h.flush();assert.equal(h.view.currentBranch.segments[0].endKm,split)
 const target=h.view.currentBranch.segments[1];h.view.segmentsState.setEditingSegment({...target,roadWidthM:10});h.flush();h.view.handleSaveEditedSegment(event);h.flush();assert.equal(h.view.currentBranch.segments[1].roadWidthM,10);assert.deepEqual(plain(h.view.branches.find(item=>item.id===a.id)),aBefore)
 const surfaces=h.maps[0].getSource('branches-surface-source').data.features.filter(f=>f.properties.branchId===b.id);assert.deepEqual(plain(surfaces.map(f=>f.properties.roadWidthM)),[11,10]);assert.deepEqual(plain(h.view.currentBranch.coords),plain(b.coords))
 h.view.setSlabLengthM(12);h.view.setSlabThicknessCm(44);h.flush();assert.equal(h.view.slabLengthM,5);assert.equal(h.view.slabThicknessCm,28);assert.deepEqual(plain(h.maps[0].getSource('slabs-source').data),slabs)
 h.view.handleDeleteBranch(b.id);h.flush();assert.equal(h.view.selectedTargetType,'MAINLINE');assert.deepEqual(plain(h.view.segmentsState.segments),main);assert.equal(h.view.activeSplitDistance,.3);assert.equal(h.view.segmentsState.splitSortOrder,'asc');assert.ok(!h.maps[0].getSource('branches-source').data.features.some(f=>f.properties.branchId===b.id));assert.equal(h.calls.length,0);h.unmount()
})
test('branch invalid input and stale file/scope handlers cannot create or overwrite a branch/mainline',()=>{
 const h=harness(true,false,true);h.read(sample);h.loadMap();const p=h.view.currentCoords[0],source={id:'branch-a',name:'A',roadWidthM:7,laneCount:2,surfaceMaterial:'A',coords:[p,[p[0]+.002,p[1]+.003]]};const main=plain(h.view.segmentsState.segments)
 h.view.handleAddBranch({...source,roadWidthM:NaN});h.flush();assert.equal(h.view.branches.length,0);h.view.handleAddBranch(source);h.flush();const before=plain(h.view.branches);h.read('{');assert.deepEqual(plain(h.view.branches),before)
 h.view.handleSetSplitDistance(0);h.flush();h.view.handleApplyAutoSplit();h.flush();assert.deepEqual(plain(h.view.currentBranch.segments),before[0].segments)
 h.view.segmentsState.handleClearAllSegments();h.flush();assert.equal(h.view.currentBranch.segments.length,0);h.view.segmentsState.setNewSegForm(old=>({...old,code:'User segment',startKm:0,endKm:h.view.currentBranch.lengthKm,roadWidthM:6,laneCount:1,surfaceMaterial:'C'}));h.flush();h.view.segmentsState.handleCreateNewSegment({preventDefault(){}});h.flush();assert.equal(h.view.currentBranch.segments[0].roadWidthM,6);assert.equal(h.view.currentBranch.segments[0].endKm,h.view.currentBranch.lengthKm)
 const oldAdd=h.view.handleAddBranch;h.read(sample);oldAdd({...source,id:'late-branch'});h.flush();assert.equal(h.view.branches.length,0);assert.deepEqual(plain(h.view.segmentsState.segments),main)
 h.view.handleAddBranch(source);h.flush();const old=h.view.handleAddBranch;h.model.draftId='new-draft';h.flush();old({...source,id:'late-scope'});h.flush();assert.equal(h.view.branches.length,0);assert.equal(h.maps[0].getSource('branches-source').data.features.length,0)
 h.read(sample);h.view.handleAddBranch(source);h.flush();const previousProject=h.view.handleAddBranch;h.project('other-project');previousProject({...source,id:'late-project'});h.flush();assert.equal(h.view.branches.length,0);assert.equal(h.calls.length,0);h.unmount()
})
;(async()=>{let count=0;for(const {name,run}of tests){if(process.env.RG_DRAFT_FILTER&&!new RegExp(process.env.RG_DRAFT_FILTER,'i').test(name))continue;await run();console.log('PASS '+name);count++}console.log(`${count} Draft import/state/save/map scenarios PASS (mock HTTP/MapLibre; no runtime writes).`)})().catch(error=>{console.error(error);process.exitCode=1})
