const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
function load(file,mocks){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,{module:m,exports:m.exports,require:n=>{if(n in mocks)return mocks[n];throw Error('Unmocked '+n)},AbortController,URL:objectUrls,console});return m.exports}
const objectUrls={createObjectURL:()=> 'blob:server-evidence',revokeObjectURL(){}}
let media={caseId:'case-a',reports:[],reportsLoading:false,reportsError:'',url:'blob:server-evidence',imageLoading:false,imageError:'',selected:{reportId:'report-a',evidence:{evidenceId:'evidence-a'}},retryImage(){},decodeError(){}}
const react={__esModule:true,default:React,...React},icon={'../../../components/ui/Icon':{Icon:()=>null}}
let shared
function components(){shared=load('src/pages/(pm)/ai-review/useCaseReportMedia.tsx',{react:{...react,useContext:()=>media},...icon,'../../../store/authStore':{useAuthStore:Object.assign(sel=>sel({authEpoch:1}),{getState:()=>({authEpoch:1})})},'../../../api/services/caseReportService':{caseReportService:{}}});return Object.fromEntries(['DrawerMediaViewer','PhotoZoomModal'].map(n=>[n,load('src/pages/(pm)/ai-review/'+n+'.tsx',{react,...icon,'./useCaseReportMedia':shared})[n]]))}
// First assertion runs against the old viewport before introducing the shared model.
const old=load('src/pages/(pm)/ai-review/DrawerMediaViewer.tsx',{react,...icon,'./useCaseReportMedia':{CaseReportImage:()=>React.createElement('img',{src:media.url})}}).DrawerMediaViewer
const selectedCase={id:'case-a',image_url:'',defect_title:'Hồ sơ',gps:{lat:null,lng:null},source:'UNKNOWN',severity:'UNKNOWN',urgency:'UNKNOWN'}
const viewportProps={selectedCase,detailViewMode:'PHOTO',setDetailViewMode(){},drawerMapContainerRef:{current:null},onOpenPhotoZoomModal(){},onOpenGISModal(){}}
const html=renderToStaticMarkup(React.createElement(old,viewportProps));assert.ok(html.includes('blob:server-evidence'),'Viewport must display the Report evidence, even when Case.image_url is empty');assert.ok(!html.includes('Không có ảnh đính kèm'))
console.log('PASS evidence binding viewport')
let passed=1
function test(name,fn){return Promise.resolve().then(fn).then(()=>{passed++;console.log('PASS '+name)})}
function harness(){let slot=0;const values=[],effects=[];return{react:{...react,useState(v){const i=slot++;if(!(i in values))values[i]=typeof v==='function'?v():v;return[values[i],n=>values[i]=typeof n==='function'?n(values[i]):n]},useEffect(fn,deps){const i=slot++,old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))effects[i]={fn,deps,pending:true,cleanup:old?.cleanup}}},render(fn){slot=0;const v=fn();for(const e of effects)if(e?.pending){e.pending=false;e.cleanup?.();e.cleanup=e.fn()}return v},close(){effects.forEach(e=>e?.cleanup?.())}}}
const evidence=(id,version='v1')=>({evidenceId:id,fileVersion:version,contentPath:'/server/'+id}),reports=[{reportId:'report-a',originalEvidence:[evidence('image-a')],supplements:[{id:'sup-a',evidence:[evidence('image-b')]}]}]
;(async()=>{
 await test('real old viewport and zoom share the same image, loading, empty and permission error; no Case URL hides private errors',()=>{
  const {DrawerMediaViewer,PhotoZoomModal}=components(),render=()=>[renderToStaticMarkup(React.createElement(DrawerMediaViewer,viewportProps)),renderToStaticMarkup(React.createElement(PhotoZoomModal,{isOpen:true,onClose(){},selectedCase}))]
  for(const h of render()){assert.ok(h.includes('blob:server-evidence'));assert.ok(!h.includes('Không có ảnh đính kèm'))}
  media={...media,url:'',imageLoading:true};for(const h of render()){assert.ok(h.includes('Đang tải ảnh bằng chứng'));assert.ok(!h.includes('Không có ảnh đính kèm'))}
  selectedCase.image_url='https://must-not-fallback.example/image';media={...media,imageLoading:false,imageError:'Không có quyền đọc ảnh'};for(const h of render()){assert.ok(h.includes('Không có quyền đọc ảnh'));assert.ok(h.includes('Thử lại'));assert.ok(!h.includes('must-not-fallback'));assert.ok(!h.includes('Không có ảnh đính kèm'))}
  media={...media,imageError:'',selected:null};for(const h of render())assert.ok(h.includes('Không có ảnh đính kèm'))
  media={...media,reportsError:'Report GET failed'};for(const h of render()){assert.ok(h.includes('Report GET failed'));assert.ok(!h.includes('Không có ảnh đính kèm'))}
  selectedCase.image_url=''
 })
 await test('one report/image owner handles originals and supplements, selected private bytes and shared decode failure; blob revoked on switch/unmount',async()=>{
  const h=harness(),calls=[],revoked=[];let epoch=1,caseId='case-a',view,serial=0
  const service={read:async id=>{calls.push(['reports',id]);return reports},image:async(id,r,e)=>{calls.push(['image',id,r,e.evidenceId,e.fileVersion]);return {serverEvidence:e.evidenceId}}}
  const hook=load('src/pages/(pm)/ai-review/useCaseReportMedia.tsx',{react:h.react,...icon,'../../../api/services/caseReportService':{caseReportService:service},'../../../store/authStore':{useAuthStore:sel=>sel({authEpoch:epoch})}}).useReportMediaState
  objectUrls.createObjectURL=blob=>'blob:'+blob.serverEvidence+':'+(++serial);objectUrls.revokeObjectURL=url=>revoked.push(url)
  const render=()=>view=h.render(()=>hook(caseId)),flush=async()=>{for(let i=0;i<12;i++){await Promise.resolve();render()}}
  render();assert.equal(view.reportsLoading,true);await flush();assert.equal(view.selected.evidence.evidenceId,'image-a');assert.match(view.url,/blob:image-a/);assert.equal(calls.filter(c=>c[0]==='reports').length,1);assert.equal(calls.filter(c=>c[0]==='image').length,1)
  // Renders/zoom consumers do not initiate another private download.
  render();render();assert.equal(calls.filter(c=>c[0]==='image').length,1)
  const firstUrl=view.url;view.select('report-a',reports[0].supplements[0].evidence[0]);render();assert.equal(view.url,'');await flush();assert.match(view.url,/blob:image-b/);assert.ok(revoked.includes(firstUrl));view.decodeError();render();assert.equal(view.url,'');assert.match(view.imageError,/Không thể hiển thị/);view.retryImage();render();await flush();assert.match(view.url,/blob:image-b/)
  const lastUrl=view.url;h.close();assert.ok(revoked.includes(lastUrl))
 })
 await test('late Report/image cannot cross Case or actor epoch; old private URL hidden immediately, even when transport ignores abort',async()=>{
  const h=harness();let epoch=1,caseId='case-a',view;const reads=[],images=[],revoked=[]
  objectUrls.createObjectURL=b=>'blob:'+b.id;objectUrls.revokeObjectURL=u=>revoked.push(u)
  const hook=load('src/pages/(pm)/ai-review/useCaseReportMedia.tsx',{react:h.react,...icon,'../../../api/services/caseReportService':{caseReportService:{read:id=>new Promise(resolve=>reads.push({id,resolve})),image:(id,r,e)=>new Promise(resolve=>images.push({id,resolve}))}},'../../../store/authStore':{useAuthStore:sel=>sel({authEpoch:epoch})}}).useReportMediaState
  const render=()=>view=h.render(()=>hook(caseId)),flush=async()=>{for(let i=0;i<12;i++){await Promise.resolve();render()}}
  render();caseId='case-b';render();reads[0].resolve(reports);await flush();assert.equal(view.reports.length,0);assert.equal(images.length,0);reads[1].resolve(reports);await flush();assert.equal(images[0].id,'case-b');epoch=2;render();assert.equal(view.url,'');images[0].resolve({id:'stale'});await flush();assert.equal(view.url,'');reads[2].resolve(reports);await flush();images[1].resolve({id:'current'});await flush();assert.equal(view.url,'blob:current');caseId='case-c';render();assert.equal(view.url,'');assert.ok(revoked.includes('blob:current'));h.close()
 })
 await test('original drawer uses shared Report metadata and image frame; no independent ReportEvidence fetch/image state; provider encloses old modal hub',()=>{
  const reactMock={...react,useContext:()=>media},ctx=components()
  const reportModule=load('src/pages/(pm)/ai-review/DrawerReportDetails.tsx',{react:reactMock,'../../../api/services/caseReportService':{},'../../../store/authStore':{useAuthStore:Object.assign(sel=>sel({authEpoch:1,user:{role:'SUPERVISOR'}}),{getState:()=>({authEpoch:1})})},'./useCaseReportMedia':{useCaseReportMedia:()=>media,reportError:()=>''}})
  media={...media,reports,caseId:'case-a',reportsError:'',selected:{reportId:'report-a',evidence:reports[0].originalEvidence[0]},url:'blob:current',select:(r,e)=>{media.selected={reportId:r,evidence:e}}}
  const html=renderToStaticMarkup(React.createElement(reportModule.ReportEvidence,{caseId:'case-a',reportId:'report-a',evidence:reports[0].originalEvidence[0]}));assert.ok(html.includes('Đang xem ảnh'));assert.ok(!html.includes('<img'))
  const source=fs.readFileSync('src/pages/(pm)/ai-review/DrawerReportDetails.tsx','utf8');assert.ok(!source.includes('caseReportService.image'));assert.ok(!source.includes('caseReportService.read'));assert.ok(source.includes('useCaseReportMedia()'))
  const inbox=fs.readFileSync('src/pages/(pm)/AIReviewInbox.tsx','utf8');assert.ok(inbox.indexOf('<CaseReportMediaProvider')<inbox.indexOf('<ReviewDetailModal'));assert.ok(inbox.indexOf('</CaseReportMediaProvider>')>inbox.indexOf('<ReviewModals'))
 })
 await test('Report read errors and image403 are never empty success; retry keeps the server evidence reference',async()=>{
  const h=harness();let view,reportFail=true,imageFail=true;const readCalls=[]
  const service={read:async()=>{if(reportFail)throw Error('read503');return reports},image:async(c,r,e)=>{readCalls.push([c,r,e.evidenceId,e.fileVersion]);if(imageFail)throw{response:{status:403,data:{code:'forbidden'}}};return{serverEvidence:e.evidenceId}}}
  const hook=load('src/pages/(pm)/ai-review/useCaseReportMedia.tsx',{react:h.react,...icon,'../../../api/services/caseReportService':{caseReportService:service},'../../../store/authStore':{useAuthStore:sel=>sel({authEpoch:1})}}).useReportMediaState
  const render=()=>view=h.render(()=>hook('case-a')),flush=async()=>{for(let i=0;i<12;i++){await Promise.resolve();render()}}
  render();await flush();assert.ok(view.reportsError);assert.equal(view.reportsLoading,false);assert.equal(readCalls.length,0)
  reportFail=false;view.retry();render();await flush();assert.equal(view.reportsError,'');assert.ok(view.imageError.includes('không có quyền'));assert.equal(view.url,'');assert.equal(view.selected.evidence.evidenceId,'image-a')
  imageFail=false;view.retryImage();render();await flush();assert.equal(view.imageError,'');assert.equal(readCalls.length,2);assert.deepEqual(readCalls[0],readCalls[1]);assert.ok(view.url);h.close()
 })
 console.log(`${passed} Report image binding scenarios PASS (isolated mocks/hooks/SSR; no API writes).`)
})().catch(e=>{console.error(e);process.exitCode=1})
