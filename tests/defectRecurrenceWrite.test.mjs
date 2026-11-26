import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
const src = await readFile(new URL('../src/api/services/defectRecurrenceService.ts', import.meta.url), 'utf8')
const {code} = await transform(src.replace(/^import .*$/gm, ''), {loader:'ts',format:'esm'})
const { confirmedRecurrenceSource, recurrenceAction } = await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const id = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`
const item = {id:id(1),projectId:id(2),defectId:id(3),obligationId:id(4),state:'Confirmed',result:'CONFIRMED',effectiveDecisionId:id(5),version:'v'}
const decision = { id:id(5),itemId:id(1),defectId:id(3),obligationId:id(4),result:'CONFIRMED' }
const h = {item,decisions:[decision]}
test('only the exact effective confirmed decision of the same repair item and obligation is offered',()=>{
 assert.deepEqual(confirmedRecurrenceSource(id(2),id(3),h),{itemId:id(1),previousDefectId:id(3),priorRepairDecisionId:id(5)})
 for(const wrong of [{...h,item:{...item,state:'Cancelled'}},{...h,decisions:[{...decision,id:id(6)}]},{...h,decisions:[{...decision,obligationId:id(7)}]},{...h,decisions:[{...decision,result:'PartiallyAccepted'}]}]) assert.equal(confirmedRecurrenceSource(id(2),id(3),wrong),null)
})
test('readback requires the exact predecessor, new defect and effective decision',()=>{
 const receipt={id:id(9),projectId:id(2),kind:'LinkRecurrence',defectId:id(3),linkedDefectId:id(8),priorRepairDecisionId:id(5)}
 const input={previousDefectId:id(3),priorRepairDecisionId:id(5)}
 assert.equal(recurrenceAction({projectId:id(2),actions:[receipt]},id(2),id(8),input),receipt)
 assert.equal(recurrenceAction({projectId:id(2),actions:[{...receipt,linkedDefectId:id(7)}]},id(2),id(8),input),undefined)
})
