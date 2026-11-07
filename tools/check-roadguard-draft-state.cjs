const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript')
const base='src/pages/(pm)/alignment/',sample=fs.readFileSync('tools/fixtures/Roadguard1_RoadGuard_GeometryDraft.json','utf8'),plain=v=>JSON.parse(JSON.stringify(v))
function harness(root=false){
 let slot=0,changed=false,pending=[],view,project='p',inputScope='p:a',ready=true,crs=32648
 const values=[],effects=[],readers=[],applied=[],messages=[],mapInputs=[]
 const model={draftId:'a',projects:[],context:null,geometry:null,draft:null,invalidate(){}}
 const react={useState(initial){const i=slot++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>{const v=typeof next==='function'?next(values[i]):next;if(!Object.is(v,values[i])){values[i]=v;changed=true}}]},useRef(initial){const i=slot++;if(!(i in values))values[i]={current:initial};return values[i]},useMemo:fn=>fn(),useEffect(setup,deps){const i=slot++,old=effects[i];if(!old||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j])))pending.push({i,setup,deps})}}
 const workflow={form:{origin:'',widths:'',reason:'',surveyWidth:''},busy:false,conflict:false,setForm(next){workflow.form=typeof next==='function'?next(workflow.form):next}}
 const mocks={react,'maplibre-gl':{},'react-router-dom':{useNavigate:()=>()=>{},useParams:()=>({id:project})},'../../../store/authStore':{useAuthStore:()=>({user:{role:'PROJECT_MANAGER'},authEpoch:1})},'../../../types/enums':{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER',SUPERVISOR:'SUPERVISOR'}},'./data':{SEGMENT_COLORS:['#C9A227']},'./useGeometryReadModel':{useGeometryReadModel:()=>model},'./useGeometryDraftWorkflow':{useGeometryDraftWorkflow(_p,model,_text,setText){react.useEffect(()=>{if(model.draft){workflow.form={origin:'-99',widths:'server'};setText('server')}},[model.draft]);return workflow}},'./useAlignmentMapState':{useAlignmentMapState(params){mapInputs.push(params.currentCoords);return{syncMap(){},handleFitBounds(){},mapRef:{current:null}}}}}
 class FileReader{constructor(){readers.push(this)}readAsText(){}}
 function load(file){const module={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name in mocks)return mocks[name];if(name.startsWith('.'))return load(path.join(path.dirname(file),name+'.ts'));throw Error('Unexpected '+name)},Error,FileReader,console,setTimeout(){}});return module.exports}
 const hook=load(base+(root?'useAlignmentState.ts':'useAlignmentImportState.ts'))[root?'useAlignmentState':'useAlignmentImportState']
 function flush(){for(let i=0;i<25;i++){changed=false;slot=0;pending=[];view=root?hook():hook({inputScope,contextReady:ready,engineeringCrs:crs,onRoadGuardDraft:draft=>applied.push(draft),onDraftInput(){},defaultManualText:'',showToast:m=>messages.push(m),currentCoords:[],currentKmPoints:[],importedLengthKm:0});if(changed)continue;for(const e of pending){effects[e.i]?.cleanup?.();effects[e.i]={deps:e.deps,cleanup:e.setup()}}if(!changed)return view}throw Error('Hook did not settle')}
 flush()
 return{model,workflow,readers,applied,messages,mapInputs,flush,get view(){return view},scope(v){inputScope=v;flush()},context(v,c){ready=v;crs=c;flush()},project(v){project=v;flush()},read(text){(root?view.importState:view).processGeoJSONFile({name:'input.json'});const r=readers.at(-1);if(text!==undefined){r.onload({target:{result:text}});flush()}return r},unmount(){effects.forEach(e=>e?.cleanup?.())}}
}
let count=0;function test(name,run){run();console.log('PASS '+name);count++}
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
 assert.equal(h.view.activeSegments[0].roadWidthM,7);assert.equal(h.view.activeSegments[0].statusText,'BẢN CHỈNH CHƯA LƯU');assert.equal(h.view.rightTab,'WIDTH_PROFILE');assert.equal(h.view.alignmentStatus,'DRAFT');assert.equal(h.view.currentCoords.length,0);assert.equal(h.view.currentKmPoints.length,0);assert.ok(h.mapInputs.every(c=>c.length===0));assert.equal(h.view.segmentsState.slabs.length,0)
 h.read('{');assert.equal(h.view.activeSegments[0].roadWidthM,7)
 h.model.draft={data:{id:'a',projectId:'p',stationOriginMeters:-99,status:'CONFIRMED'}};h.flush();assert.equal(h.workflow.form.origin,'0');assert.match(h.view.importState.manualCoordsText,/^798577/);assert.equal(h.view.alignmentStatus,'DRAFT')
 const delayed=h.read();h.model.draftId='b';h.flush();assert.equal(h.view.fileDraft,null);assert.equal(h.view.activeSegments.length,0)
 delayed.onload({target:{result:sample}});h.flush();assert.equal(h.view.fileDraft,null);assert.equal(h.view.activeSegments.length,0);h.unmount()
})
test('JSX/UI files are unchanged, including existing json accept',()=>{
 const cp=require('child_process');for(const name of ['ImportPanel','AlignmentImportModal','AlignmentSidebar','SidebarWidthProfileTab']){const file=base+name+'.tsx';assert.equal(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'),cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}).replaceAll('\r\n','\n'))}
})
console.log(`${count} Draft import/state scenarios PASS (mock read model/workflow/map; no API save).`)
