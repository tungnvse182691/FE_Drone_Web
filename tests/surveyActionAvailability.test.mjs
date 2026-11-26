import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'
const source = await readFile(new URL('../src/pages/(pm)/surveys/surveyActionAvailability.ts', import.meta.url), 'utf8')
const {code} = await transform(source, {loader:'ts', format:'esm'})
const {taskActions, canPostpone} = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
test('only active plans expose postpone', () => {
  for (const s of ['PLANNED','IN_PROGRESS']) assert.equal(canPostpone(s),true)
  for (const s of ['COMPLETED','CANCELLED','POSTPONED','UNKNOWN']) assert.equal(canPostpone(s),false)
})
test('task transitions use server states, not merely not-cancelled', () => {
  for (const s of ['NEW_ASSIGNED','ACCEPTED','IN_PROGRESS','REASSIGNED','REJECTED']) assert.deepEqual(taskActions(s), ['reassign','cancel'])
  for (const s of ['SUBMITTED','SUPPLEMENT_REQUIRED']) assert.deepEqual(taskActions(s), ['supplement'])
  for (const s of ['COMPLETED','CANCELLED','UNKNOWN']) assert.deepEqual(taskActions(s), [])
})
