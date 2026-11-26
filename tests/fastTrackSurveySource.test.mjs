import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
test('Fast Track does not submit the survey task ID as the FIELD survey reference', async()=>{
 const service=await readFile(new URL('../src/api/services/fastTrackFormSources.ts',import.meta.url),'utf8')
 assert.doesNotMatch(service,/surveyId\s*:\s*run\.surveyTaskId/)
})
const ts=await readFile(new URL('../src/api/services/fastTrackSurveyProof.ts',import.meta.url),'utf8')
const {code}=await transform(ts,{loader:'ts',format:'esm'})
const {verifiedRouteFrame,matchesSurveyDetection}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const route='7ba504f9-3c5e-4ef9-bc81-10c299d24893', frame='h4-frame-v1:bd59ff2c558b8b38218ac4113f0011b174ed2090bc475ceaeafa3b474994055e'
test('BE frame verifies explicit null pins, never an inferred segment',async()=>{
 assert.equal((await verifiedRouteFrame(route,frame))?.routeVersionId,route)
 for(const [id,hash] of [[route+'1',frame],[route,frame.slice(0,-1)],['',frame]])assert.equal(await verifiedRouteFrame(id,hash),null)
})
const run={id:'run',processingJobId:'job',surveyTaskId:'survey',status:'SUCCEEDED'}, result={runId:'run',jobId:'job',detections:[{detectionId:'det',frameFileId:'frame'}]}
test('require exact detection, evidence frame and processing job',()=>{
 assert.ok(matchesSurveyDetection(run,result,'det',['frame']))
 for(const [r,s,d,e] of [[run,result,'other',['frame']],[run,result,'det',['other']],[run,{...result,jobId:'other'},'det',['frame']],[{...run,surveyTaskId:null},result,'det',['frame']]])assert.equal(matchesSurveyDetection(r,s,d,e),false)
})
