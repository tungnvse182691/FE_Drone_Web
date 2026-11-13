// Reuse the existing C5 isolated HTTP/hook harness, without rerunning its suites.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
const shared={exports:{}},prefix=fs.readFileSync('tools/check-pavement-layout.cjs','utf8').split('let count=0;')[0]
vm.runInNewContext(prefix+'\nmodule.exports={environment,fixture,editor,widths,pins,project,plain}',{module:shared,require,console,URLSearchParams})
const {environment,fixture,editor,widths,pins,project}=shared.exports,plain=x=>JSON.parse(JSON.stringify(x))
function actual(key='ACTUAL-A'){return{key,source:'Sổ đo kiểm thử cô lập',footprint:[{x:12,y:20},{x:16,y:20},{x:16,y:23},{x:12,y:20}],lengthMeters:4,widthMeters:3}}
function env(){
 const e=environment(),source=fixture(e.commands.pavementInput(editor,widths,10,.1)),records=new Map([['layout',source]]),accepted=new Map();let getFail=false,timeout=false,tamper=null,delay=null
 e.mocks.react={}
 const get=e.client.get
 e.client.get=async(url,options)=>{
  if(url.includes('/pavement-layouts/')){const id=url.split('/').at(-1);e.calls.push({method:'GET',url});if(id!=='layout'&&getFail)throw Error('readback network');return{data:plain(tamper&&id!=='layout'?tamper:records.get(id))}}
  if(url.endsWith('/geometry'))return{data:{projectId:project,roadSectionId:'road',routeVersionId:'route',engineeringSrid:32648,stationOriginMeters:0,lengthMeters:10,metricCenterline:{type:'LineString',coordinates:[[500000,1000000],[500006,1000008]]}}}
  return get(url,options)
 }
 e.client.post=async(url,body,options)=>{
  const key=options.headers['Idempotency-Key'];e.calls.push({method:'POST',url,body:plain(body),headers:plain(options.headers)})
  if(delay)await delay
  let value=accepted.get(key)
  if(!value){value={...plain(source),id:'built-'+accepted.size,kind:'AS_BUILT',sourcePlanId:body.sourcePlanId,contentHash:'b'.repeat(64),layout:null,geometry:{plan:null,slabs:plain(body.slabs).map(s=>({...s,provenanceStatus:'CLAIMED_CUSTOM'})),displayToleranceMeters:.1}};accepted.set(key,value);records.set(value.id,value)}
  if(timeout)throw Error('POST timeout unknown')
  return{data:plain(value)}
 }
 const input={sourcePlanId:'layout',slabs:[actual()],reason:'Kiểm thử cô lập; không gửi runtime'},intent={pins,source,input}
 return{...e,source,input,intent,records,accepted,setGetFail:v=>getFail=v,setTimeout:v=>timeout=v,setTamper:v=>tamper=v,setPostDelay:v=>delay=v}
}
function hookView(e,role='PROJECT_MANAGER',initial='layout'){
 let slot=0,changed=false,view,revision=0,id=project,query=new URLSearchParams(`roadSectionId=road&routeVersionId=route&segmentSetId=set&layoutId=${initial}`),toasts=[];const values=[],effects=[]
 e.state.user.role=role
 e.mocks.react={useMemo(fn,deps){const i=slot++,old=values[i];if(!old||deps.some((d,j)=>!Object.is(d,old.deps[j])))values[i]={deps,value:fn()};return values[i].value},useState(v){const i=slot++;if(!(i in values))values[i]=v;return[values[i],next=>{const n=typeof next==='function'?next(values[i]):next;if(!Object.is(n,values[i])){values[i]=n;changed=true}}]},useRef(v){const i=slot++;if(!(i in values))values[i]={current:v};return values[i]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}}
 e.mocks['react-router-dom']={useSearchParams:()=>[query,next=>query=typeof next==='function'?next(query):next]}
 const hook=e.load('src/pages/(pm)/alignment/usePavementWorkflow.ts').usePavementWorkflow
 function render(){for(let i=0;i<25;i++){changed=false;slot=0;view=hook(id,'road',editor,widths,false,true,()=>{},t=>toasts.push(t),revision);for(const f of effects)if(f?.pending){f.pending=false;f.cleanup?.();f.cleanup=f.fn()}if(!changed)return}throw Error('settle')}
 async function flush(){for(let i=0;i<45;i++){await Promise.resolve();render()}}
 return{render,flush,get view(){return view},get query(){return query},toasts,remount(){effects.forEach(f=>f?.cleanup?.());values.length=0;effects.length=0;render()},switchProject(next){id=next;query=new URLSearchParams();render()}}
}
let count=0;async function test(name,run){await run();console.log('PASS '+name);count++}
;(async()=>{
await test('actual data validator requires source/reason/key/footprint; file and design sequence remain optional',()=>{
 const e=env(),before=JSON.stringify(e.source);assert.doesNotThrow(()=>e.commands.validateAsBuilt(e.input,e.source));assert.equal(JSON.stringify(e.source),before)
 for(const patch of [{key:''},{key:'with space'},{source:''},{lengthMeters:0},{widthMeters:Infinity},{footprint:[{x:0,y:0}]},{footprint:[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:2,y:2}]},{plannedSequence:999},{sourceFileId:'bad'}])assert.throws(()=>e.commands.validateAsBuilt({...e.input,slabs:[{...actual(),...patch}]},e.source),/Tấm 1/)
 assert.throws(()=>e.commands.validateAsBuilt({...e.input,reason:''},e.source),/Lý do/);assert.throws(()=>e.commands.validateAsBuilt({...e.input,slabs:[actual(),actual()]},e.source),/duy nhất/)
 assert.throws(()=>e.commands.validateAsBuilt({...e.input,slabs:[{...actual(),widthMeters:null}]},e.source),/chưa biết/)
 assert.doesNotThrow(()=>e.commands.validateAsBuilt({...e.input,slabs:[{...actual(),lengthMeters:null,widthMeters:null,dimensionUnknownReason:'Chưa đo đủ'}]},e.source))
 assert.throws(()=>e.commands.validateAsBuilt(e.input,{...e.source,kind:'AS_BUILT'}),/PLANNED/)
})
await test('form accepts native XY and preserves unknown dimensions without defaults or mandatory file',()=>{
 const e=env(),h=e.load('src/pages/(pm)/alignment/useAsBuiltWorkflow.ts'),form={...h.emptyAsBuiltForm(),key:'A',source:'Nguồn PM nhập',footprint:'0 0\n2 0\n2 2\n0 0',dimensionUnknownReason:'Chưa đo'}
 const slab=h.asBuiltSlabFromForm(form);assert.ok(!('sourceFileId'in slab));assert.ok(!('lengthMeters'in slab));assert.ok(!('plannedSequence'in slab));assert.equal(slab.footprint[0].x,0)
 assert.throws(()=>h.asBuiltSlabFromForm({...form,footprint:'1 2 3'}),/X Y/);assert.throws(()=>h.asBuiltSlabFromForm({...form,lengthMeters:'abc'}),/hữu hạn/)
})
await test('POST body, source hash If-Match and key are exact; readback uses actual footprints and retains receipt until render acknowledgement',async()=>{
 const e=env(),before=JSON.stringify(e.source),value=await e.commands.saveAsBuilt(project,e.intent),write=e.calls.find(c=>c.method==='POST')
 assert.equal(write.url,'/projects/p/pavement-layouts/as-built');assert.deepEqual(write.body,e.input);assert.equal(write.headers['If-Match'],'"'+'a'.repeat(64)+'"');assert.ok(write.headers['Idempotency-Key'])
 assert.equal(value.kind,'AS_BUILT');assert.equal(value.sourcePlanId,'layout');assert.deepEqual(plain(value.geometry.slabs[0].footprint),e.input.slabs[0].footprint);assert.equal(JSON.stringify(e.source),before)
 assert.equal(e.commands.pendingAsBuilt(project).receipt.id,value.id);assert.throws(()=>e.commands.completeAsBuilt(project,{...value,id:'wrong'}));e.commands.completeAsBuilt(project,value);assert.equal(e.commands.pendingAsBuilt(project),null)
})
await test('wrong source pins and changed source hash block before POST without repinning',async()=>{
 for(const field of ['projectId','routeVersionId','segmentSetId']){const e=env();await assert.rejects(e.commands.saveAsBuilt(project,{...e.intent,source:{...e.source,[field]:'other'}}),/phạm vi/);assert.equal(e.calls.filter(c=>c.method==='POST').length,0)}
 const e=env();e.records.set('layout',{...e.source,contentHash:'c'.repeat(64)});await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/không tự thay hash/);assert.equal(e.calls.filter(c=>c.method==='POST').length,0);assert.equal(e.commands.pendingAsBuilt(project).sourceHash,'a'.repeat(64))
 await assert.rejects(e.service.createAsBuilt(project,e.input,'bad','key'),/contentHash/)
})
await test('timeout keeps body/key/hash and replay creates one server resource; duplicate click and changed intent blocked',async()=>{
 const e=env();e.setTimeout(true);await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/timeout/);e.input.slabs[0].key='changed'
 await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/Giữ nguyên/);assert.throws(()=>e.commands.reviseAsBuilt(project),/Chưa có từ chối/)
 e.setTimeout(false);const value=await e.commands.saveAsBuilt(project),writes=e.calls.filter(c=>c.method==='POST');assert.equal(writes.length,2);assert.deepEqual(writes[0],writes[1]);assert.equal(e.accepted.size,1);e.commands.completeAsBuilt(project,value)
 const d=env();let release;d.setPostDelay(new Promise(r=>release=r));const first=d.commands.saveAsBuilt(project,d.intent);for(let i=0;i<20;i++)await Promise.resolve();await assert.rejects(d.commands.saveAsBuilt(project),/đang chờ/);release();await first;assert.equal(d.calls.filter(c=>c.method==='POST').length,1)
})
await test('receipt plus GET failure survives storage/F5 and recovery only GETs',async()=>{
 const e=env();e.setGetFail(true);await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/network/);const held=e.commands.pendingAsBuilt(project),serialized=JSON.stringify(held)
 assert.ok(held.receipt);assert.equal(JSON.stringify(e.commands.pendingAsBuilt(project)),serialized);e.setGetFail(false);const result=await e.commands.saveAsBuilt(project);assert.equal(e.calls.filter(c=>c.method==='POST').length,1);e.commands.completeAsBuilt(project,result)
})
await test('definitive 422 preserves input; review is explicit and only then permits a new key',async()=>{
 const e=env(),post=e.client.post;e.client.post=async()=>{throw Object.assign(Error('polygon invalid'),{response:{status:422,data:{code:'pavement_layout_invalid'}}})}
 await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/polygon invalid/);const held=e.commands.pendingAsBuilt(project);assert.equal(held.rejected,true)
 await assert.rejects(e.commands.saveAsBuilt(project),/đã bị từ chối/);assert.deepEqual(plain(held.input),e.input)
 e.commands.reviseAsBuilt(project);e.client.post=post;await e.commands.saveAsBuilt(project,e.intent);assert.notEqual(e.commands.pendingAsBuilt(project).key,held.key)
})
await test('real hook recovers receipt and actual input after F5; route/readback failure never creates twice',async()=>{
 const e=env(),h=hookView(e);h.render();await h.flush();h.view.asBuilt.start();h.render()
 for(const [k,v] of Object.entries({key:'A',source:'Nguồn đo',footprint:'12 20\n16 20\n16 23\n12 20',lengthMeters:'4',widthMeters:'3'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();h.view.asBuilt.setReason('Test retry');h.render();e.setGetFail(true);await h.view.asBuilt.save();h.render();await h.flush();assert.ok(h.view.asBuilt.pending.receipt)
 h.remount();await h.flush();assert.equal(h.view.asBuilt.slabs[0].key,'A');assert.equal(h.view.asBuilt.reason,'Test retry');e.setGetFail(false)
 const sourceReads=e.calls.filter(c=>c.url?.endsWith('/pavement-layouts/layout')).length;h.view.openAsBuiltSource();h.render();await h.flush();assert.ok(e.calls.filter(c=>c.url?.endsWith('/pavement-layouts/layout')).length>sourceReads);assert.equal(e.calls.filter(c=>c.method==='POST').length,1)
 const layoutRoute=e.service.layoutRoute;e.service.layoutRoute=async()=>{throw Error('route failed')};await h.view.asBuilt.save();h.render();await h.flush();assert.ok(h.view.asBuilt.pending.receipt);assert.equal(e.calls.filter(c=>c.method==='POST').length,1)
 e.service.layoutRoute=layoutRoute;await h.view.asBuilt.save();h.render();await h.flush();assert.equal(h.query.get('layoutId'),'built-0');assert.equal(e.calls.filter(c=>c.method==='POST').length,1)
})
await test('readback rejects wrong kind/project/route/set/source/hash/footprint without another POST',async()=>{
 for(const patch of [{kind:'PLANNED'},{projectId:'other'},{routeVersionId:'other'},{segmentSetId:'other'},{sourcePlanId:'other'},{contentHash:'c'.repeat(64)}]){
  const e=env();e.setGetFail(true);await assert.rejects(e.commands.saveAsBuilt(project,e.intent));const saved=e.records.get('built-0');e.setGetFail(false);e.setTamper({...saved,...patch});await assert.rejects(e.commands.saveAsBuilt(project));assert.equal(e.calls.filter(c=>c.method==='POST').length,1);assert.ok(e.commands.pendingAsBuilt(project).receipt)
 }
 const e=env();e.setGetFail(true);await assert.rejects(e.commands.saveAsBuilt(project,e.intent));e.setGetFail(false);const saved=plain(e.records.get('built-0'));saved.geometry.slabs[0].footprint[0].x=999;e.setTamper(saved);await assert.rejects(e.commands.saveAsBuilt(project),/không khớp/)
})
await test('PM/Sup rights, actor epoch and competing PLANNED commands are fenced',async()=>{
 const e=env();e.state.user.role='SUPERVISOR';await assert.rejects(e.commands.saveAsBuilt(project,e.intent),/Chỉ PM/);assert.equal(e.calls.filter(c=>c.method==='POST').length,0)
 const d=env();d.setTimeout(true);await assert.rejects(d.commands.saveAsBuilt(project,d.intent));await assert.rejects(d.commands.savePavement(project,{pins,input:d.commands.pavementInput(editor,widths,10,.1)}),/hoàn công/)
 const a=env();let release;a.setPostDelay(new Promise(r=>release=r));const call=a.commands.saveAsBuilt(project,a.intent);for(let i=0;i<20;i++)await Promise.resolve();a.state.authEpoch++;release();await assert.rejects(call,/Phiên/)
})
await test('real PM hook starts empty, map selection supplies sequence only, actual editor/preview and server F5 use same data',async()=>{
 const e=env(),h=hookView(e);h.render();await h.flush();assert.equal(h.view.asBuilt.canStart,true);h.view.asBuilt.start();h.render();assert.equal(h.view.asBuilt.slabs.length,0);assert.equal(h.view.asBuilt.form.footprint,'')
 const design=h.view.display.preview.slabsGeoJSON.features[0],handlers={};let popup=''
 class Marker{setLngLat(){return this}addTo(){return this}remove(){}}
 class Popup{setLngLat(){return this}setHTML(s){popup=s;return this}addTo(){return this}remove(){}}
 e.mocks['maplibre-gl']={Marker,Popup}
 const map={on(event,layer,fn){if(typeof layer==='string')handlers[event+layer]=fn},getZoom:()=>19,flyTo(){}}
 e.load('src/pages/(pm)/alignment/alignmentMapInteractions.ts').setupAlignmentMapInteractions(map,{current:null},()=>{},undefined,{current:(id,branch,feature)=>h.view.asBuilt.selectFeature(feature)})
 handlers['clickslabs-fill-layer']({features:[design],originalEvent:{},lngLat:{lng:1,lat:1}});h.render();assert.equal(h.view.asBuilt.form.plannedSequence,'1');assert.equal(h.view.asBuilt.form.footprint,'');assert.equal(h.view.asBuilt.form.key,'')
 for(const [k,v] of Object.entries({key:'REAL',source:'Nguồn PM',footprint:'12 20\n16 20\n16 23\n12 20',dimensionUnknownReason:'Chưa đo kích thước'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();assert.equal(h.view.asBuilt.slabs.length,1);assert.equal(h.view.display.preview.slabsGeoJSON.features.length,1);assert.equal(h.view.display.preview.slabsGeoJSON.features[0].properties.source,'AS_BUILT_DRAFT');assert.ok(Number.isNaN(h.view.display.slabs[0].lengthM))
 handlers['clickslabs-fill-layer']({features:[h.view.display.preview.slabsGeoJSON.features[0]],originalEvent:{},lngLat:{lng:1,lat:1}});h.render();assert.equal(h.view.asBuilt.form.key,'REAL');assert.match(popup,/bản nhập hoàn công chưa lưu/);assert.ok(!popup.includes('Đã lưu trên máy chủ'))
 h.view.asBuilt.newSlab();h.render();for(const [k,v] of Object.entries({key:'REAL-2',source:'Nguồn PM',footprint:'22 20\n26 20\n26 23\n22 20',lengthMeters:'4',widthMeters:'3'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();assert.equal(h.view.display.slabs.length,2);assert.equal(h.view.display.preview.slabsGeoJSON.features.length,2);assert.equal(e.source.geometry.slabs.length,1);assert.match(h.view.message,/2 tấm thực tế chưa lưu/)
 h.view.asBuilt.setReason('Kiểm thử cô lập');h.render();await h.view.save();assert.equal(e.calls.filter(c=>c.method==='POST').length,0)
 await h.view.asBuilt.save();h.render();await h.flush();assert.equal(h.query.get('layoutId'),'built-0');assert.equal(h.view.snapshot.kind,'AS_BUILT');assert.equal(h.toasts.filter(t=>t==='Đã lưu và đọc lại bản hoàn công').length,1)
 h.remount();await h.flush();assert.equal(h.view.snapshot.sourcePlanId,'layout');assert.equal(h.view.display.slabs.length,2);assert.ok(Number.isNaN(h.view.display.slabs[0].lengthM));assert.equal(h.view.display.preview.slabsGeoJSON.features[0].geometry.coordinates[0][0][0],.00012);assert.equal(e.calls.filter(c=>c.method==='POST').length,1);assert.ok(!h.view.message.includes('0 cell'))
 e.state.user.role='SUPERVISOR';e.state.authEpoch++;h.render();await h.flush();assert.equal(h.view.asBuilt.canStart,false);h.view.asBuilt.start();h.render();assert.equal(h.view.asBuilt.active,false);await h.view.asBuilt.save();assert.equal(e.calls.filter(c=>c.method==='POST').length,1)
})
await test('applied preview keeps references through cursor/reason/unapplied form renders; apply/remove/source/scope invalidate it',async()=>{
 const e=env(),h=hookView(e);h.render();await h.flush();h.view.asBuilt.start();h.render()
 for(const [k,v] of Object.entries({key:'A',source:'Sổ đo',footprint:'12 20\n16 20\n16 23\n12 20',lengthMeters:'4',widthMeters:'3'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();const initial=h.view.asBuilt.preview
 const unchanged=()=>{assert.strictEqual(h.view.asBuilt.preview,initial);assert.strictEqual(h.view.display.segments,initial.segments);assert.strictEqual(h.view.display.preview.slabsGeoJSON,initial.preview.slabsGeoJSON);assert.strictEqual(h.view.display.preview.slabLabelsGeoJSON,initial.preview.slabLabelsGeoJSON);assert.strictEqual(h.view.previewBase,initial)}
 for(let i=0;i<10;i++){h.render();unchanged()}
 h.view.asBuilt.setReason('Lý do thay đổi');h.render();unchanged();h.view.asBuilt.select(0);h.render();unchanged()
 h.view.asBuilt.setField('footprint','12 20\n18 20\n18 23\n12 20');h.render();unchanged()
 h.view.asBuilt.apply();h.render();const edited=h.view.asBuilt.preview;assert.notStrictEqual(edited,initial);assert.notStrictEqual(edited.preview.slabsGeoJSON,initial.preview.slabsGeoJSON);assert.equal(edited.preview.slabsGeoJSON.features[0].geometry.coordinates[0][1][0],.00018)
 h.view.asBuilt.newSlab();h.render();for(const [k,v] of Object.entries({key:'B',source:'Sổ đo',footprint:'22 20\n26 20\n26 23\n22 20',lengthMeters:'4',widthMeters:'3'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();const added=h.view.asBuilt.preview;assert.notStrictEqual(added,edited);assert.equal(added.slabs.length,2)
 h.view.asBuilt.remove(1);h.render();const removed=h.view.asBuilt.preview;assert.notStrictEqual(removed,added);assert.equal(removed.slabs.length,1)
 e.records.set('layout',{...e.source,contentHash:'c'.repeat(64)});h.view.retry();h.render();await h.flush();assert.notStrictEqual(h.view.asBuilt.preview,removed);assert.equal(h.view.asBuilt.preview.slabs.length,1)
 h.view.asBuilt.setShowActual(false);h.render();assert.equal(h.view.asBuilt.preview,null);h.view.asBuilt.setShowActual(true);h.render();assert.ok(h.view.asBuilt.preview)
 h.switchProject('other');await h.flush();assert.equal(h.view.asBuilt.preview,null);assert.equal(h.view.display,null);assert.equal(e.calls.filter(c=>c.method==='POST').length,0)
})
await test('scope change discards late hook success and toast; old command stays with original project',async()=>{
 const e=env(),h=hookView(e);h.render();await h.flush();h.view.asBuilt.start();h.render()
 for(const [k,v] of Object.entries({key:'A',source:'Sổ đo',footprint:'12 20\n16 20\n16 23\n12 20',lengthMeters:'4',widthMeters:'3'}))h.view.asBuilt.setField(k,v)
 h.render();h.view.asBuilt.apply();h.render();h.view.asBuilt.setReason('Test');h.render();let release;e.setPostDelay(new Promise(r=>release=r));const request=h.view.asBuilt.save();for(let i=0;i<20;i++)await Promise.resolve();h.switchProject('other');release();await request;await h.flush();assert.equal(h.view.snapshot,null);assert.equal(h.toasts.includes('Đã lưu và đọc lại bản hoàn công'),false);assert.ok(e.commands.pendingAsBuilt(project))
})
await test('actual caller form has no mandatory file, Sup read-only and common Web client supplies cookie/CSRF without mutation replay',()=>{
 const m={exports:{}},code=ts.transpileModule(fs.readFileSync('src/pages/(pm)/alignment/AsBuiltPanel.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(code,{module:m,exports:m.exports,require})
 const noop=()=>{},w={active:true,showActual:false,slabs:[],form:{key:'',source:'',footprint:'',plannedSequence:'',lengthMeters:'',widthMeters:'',dimensionUnknownReason:'',sourceFileId:''},reason:'',pending:null,error:'',busy:false,canStart:true,setField:noop,setShowActual:noop,setReason:noop,apply:noop,newSlab:noop,save:noop,cancel:noop},workflow={asBuilt:w,snapshot:{kind:'AS_BUILT'},previewBase:{engineeringSrid:32648}}
 const pm=renderToStaticMarkup(React.createElement(m.exports.AsBuiltPanel,{workflow,readOnly:false}));assert.match(pm,/Footprint thực tế X Y/);assert.match(pm,/ID tệp nguồn đã VERIFIED \(tùy chọn\)/);assert.ok(!pm.includes('type="file"'))
 const sup=renderToStaticMarkup(React.createElement(m.exports.AsBuiltPanel,{workflow,readOnly:true}));assert.match(sup,/chỉ đọc/);assert.ok(!sup.includes('<button'));assert.ok(!sup.includes('<input'))
 const client=fs.readFileSync('src/api/client.ts','utf8');assert.match(client,/withCredentials: true/);assert.match(client,/X-CSRF-TOKEN.*await state.ensureCsrfToken/);assert.match(client,/Only reads replay once/)
})
console.log(`${count} AS_BUILT groups PASS (isolated HTTP/hooks/UI; runtime writes NOT_RUN).`)
})().catch(e=>{console.error(e);process.exitCode=1})
