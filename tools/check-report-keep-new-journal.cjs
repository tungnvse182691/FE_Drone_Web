// Isolated production-service regression. No real HTTP, UI changes or database writes.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto')
const file='src/api/services/reportKeepNewCommands.ts'
const input={sourceKind:'REPORT',sourceId:'report',sourceVersion:'source-v1',geometryVersion:'geometry-v1',decision:'KEEP_NEW',classification:{defectTypeCode:'TYPE-A',severity:'HIGH',roadSectionVersionId:'route'},reason:'User-selected reason'}
const clone=x=>JSON.parse(JSON.stringify(x)),failure=status=>Object.assign(Error('HTTP'+status),{response:{status,data:{code:'source_not_ready'}}})
function setup(){const map=new Map(),writes=[],reads=[],storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>{writes.push(JSON.parse(v));map.set(k,v)},removeItem:k=>map.delete(k)};let catalog=[{code:'TYPE-A'},{code:'TYPE-B'}],catalogError=null,sourceError=null,sourceVersion='source-v1',geometryVersion='geometry-v1',postError=null,readError=null,bodyRead=null
 const posts=[],client={get:async path=>{reads.push(path);if(path.endsWith('/candidates')){if(sourceError)throw sourceError;return{data:{source:{kind:'REPORT',id:'report',version:sourceVersion},geometryVersion}}}if(readError)throw readError;const receipt={id:'decision',sourceKind:'REPORT',sourceId:'report',decision:'KEEP_NEW',defectId:'defect',version:'decision-v1'};return{data:path.includes('/candidate-decisions/')?receipt:{id:'defect',projectId:'project',roadSectionVersionId:'route',defectTypeCode:bodyRead.classification.defectTypeCode,severity:bodyRead.classification.severity,version:'defect-v1'}}},post:async(path,body,config)=>{posts.push({path,body:clone(body),key:config.headers['Idempotency-Key']});bodyRead=clone(body);if(postError)throw postError;return{data:{id:'decision',sourceKind:'REPORT',sourceId:'report',decision:'KEEP_NEW',defectId:'defect',version:'decision-v1'}}}}
 const reload=()=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:n=>{if(n==='../client')return{apiClient:client};if(n==='../../store/authStore')return{useAuthStore:{getState:()=>({user:{id:'pm',role:'PROJECT_MANAGER'},authEpoch:1})}};if(n==='../../types/enums')return{RoleCode:{PROJECT_MANAGER:'PROJECT_MANAGER'}};if(n==='./defectTypeCatalog')return{defectTypeCatalog:{read:async()=>{if(catalogError)throw catalogError;return catalog}}};throw Error('Missing mock '+n)},crypto:webcrypto,sessionStorage:storage});return m.exports.reportKeepNewCommands}
 return{map,writes,posts,reads,reload,set catalog(v){catalog=v},set catalogError(v){catalogError=v},set sourceError(v){sourceError=v},set sourceVersion(v){sourceVersion=v},set geometryVersion(v){geometryVersion=v},set postError(v){postError=v},set readError(v){readError=v}}
}
let count=0;async function test(name,fn){await fn();count++;console.log('PASS '+name)}
;(async()=>{
 await test('catalog HTTP/missing code and source HTTP/version/geometry failures keep0 POST and no pending; corrected input can proceed',async()=>{
  for(const mode of ['catalog-error','catalog-code','source-http','source-version','geometry-version']){
   const h=setup();if(mode==='catalog-error')h.catalogError=failure(503);if(mode==='catalog-code')h.catalog=[];if(mode==='source-http')h.sourceError=failure(409);if(mode==='source-version')h.sourceVersion='source-v2';if(mode==='geometry-version')h.geometryVersion='geometry-v2'
   const service=h.reload();await assert.rejects(service.run('project',input));assert.equal(h.posts.length,0);assert.equal(h.writes.length,0);assert.equal(h.map.size,0);assert.equal(service.pending('project','report'),null)
   h.catalogError=null;h.catalog=[{code:'TYPE-B'}];h.sourceError=null;h.sourceVersion='source-v2';h.geometryVersion='geometry-v2'
   const corrected={...input,sourceVersion:'source-v2',geometryVersion:'geometry-v2',classification:{...input.classification,defectTypeCode:'TYPE-B'},reason:'Corrected selection'}
   const result=await service.run('project',corrected);assert.equal(h.posts.length,1);assert.equal(h.posts[0].body.classification.defectTypeCode,'TYPE-B');assert.equal(result.defect.defectTypeCode,'TYPE-B');assert.equal(h.map.size,0)
  }
 })
 await test('POST starts only after journal persisted; timeout/F5 retains exact identity, never allows replacement input',async()=>{
  const h=setup();h.postError=Error('timeout');let service=h.reload();await assert.rejects(service.run('project',input));assert.equal(h.posts.length,1);assert.equal(h.writes[0].key,h.posts[0].key);assert.deepEqual(h.writes[0].body,h.posts[0].body);const held=service.pending('project','report');assert.ok(held);const saved=JSON.stringify(held)
  service=h.reload();await assert.rejects(service.run('project',{...input,reason:'replace unknown'}),/Giữ nguyên/);assert.equal(h.posts.length,1);assert.equal(JSON.stringify(service.pending('project','report')),saved)
  // Preflight may now fail, but an unresolved request must not be replaced or reclassified.
  h.catalogError=failure(403);h.sourceError=failure(409);h.postError=failure(403);await assert.rejects(service.run('project',input));assert.equal(h.posts[1].key,h.posts[0].key);assert.deepEqual(h.posts[1].body,h.posts[0].body);assert.equal(JSON.stringify(service.pending('project','report')),saved)
  h.postError=null;await service.run('project',input);assert.equal(h.posts[2].key,h.posts[0].key);assert.deepEqual(h.posts[2].body,h.posts[0].body);assert.equal(h.map.size,0)
 })
 await test('acknowledged receipt and failed GET retain identity across reload and recover using GET only',async()=>{
  const h=setup();h.readError=failure(503);await assert.rejects(h.reload().run('project',input));const held=h.reload().pending('project','report');assert.equal(held.received,true);assert.equal(held.receipt.id,'decision');assert.equal(h.posts.length,1)
  h.catalogError=failure(403);h.sourceError=failure(409);await assert.rejects(h.reload().run('project',input));assert.equal(h.posts.length,1);assert.equal(h.reload().pending('project','report').key,held.key)
  h.readError=null;const result=await h.reload().run('project',input);assert.equal(result.decision.id,'decision');assert.equal(h.posts.length,1);assert.equal(h.map.size,0)
 })
 console.log(`${count} KEEP_NEW journal groups PASS; mutations simulated only`)
})().catch(e=>{console.error(e);process.exitCode=1})
