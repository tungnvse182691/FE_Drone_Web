import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/api/services/surveyDatasetService.ts', import.meta.url), 'utf8')
const { code } = await transform(source.replace("import { apiClient } from '../client'", 'const apiClient = globalThis.surveyAiTestClient'), { loader: 'ts', format: 'esm' })
const scope = { routeVersionId: 'route', segmentSetId: 'set', segmentIds: ['segment'], targetBand: 'SURFACE' }
const version = 'ab'.repeat(32)
const geometry = { projectId: 'project', route: { routeVersionId: 'route', metadataStatus: 'COMPLETE' }, segmentSet: { id: 'set', routeVersionId: 'route', metadataStatus: 'COMPLETE' } }
const calls = []
let response = { data: geometry, headers: { etag: `"${version}"` } }
globalThis.surveyAiTestClient = {
  async get(path, config) { calls.push(['GET', path, config?.params]); if (path.endsWith('/ai-mock-runs')) return { data: { items: [{ fixtureVersion: 'fixture' }] } }; if (path.endsWith('/geometry-package')) return response; throw new Error(`Unexpected API: ${path}`) },
  async post(path, body) { calls.push(['POST', path, body]); return { data: { id: 'run' } } },
}
const { surveyDatasetService } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
const input = { scopeIndex: 0, stage: 'VIDEO_ANALYSIS', modelVersionId: '00000000-0000-0000-0000-000000000001', preprocessingVersion: 'pre', configVersion: 'config', fixtureVersion: 'fixture' }
const dataset = { id: 'dataset', projectId: 'project', scope: [scope] }

test('AI run uses the exact geometry-package ETag for selected dataset scope', async () => {
  assert.deepEqual(await surveyDatasetService.aiRunHints('project', scope), { fixtures: ['fixture'], geometryVersion: version })
  await surveyDatasetService.createAiRun('project', dataset, input)
  assert.deepEqual(calls.filter(x => x[1].endsWith('/geometry-package')).map(x => x[2]), [scope, scope].map(({ routeVersionId, segmentSetId }) => ({ routeVersionId, segmentSetId })))
  assert.equal(calls.find(x => x[0] === 'POST')?.[2].expectedGeometryVersion, version)
})

test('missing ETag or mismatched geometry scope prevents AI run submission', async () => {
  calls.length = 0
  response = { data: geometry, headers: {} }
  await assert.rejects(surveyDatasetService.createAiRun('project', dataset, input), /ETag/)
  response = { data: { ...geometry, projectId: 'other' }, headers: { etag: `"${version}"` } }
  await assert.rejects(surveyDatasetService.createAiRun('project', dataset, input), /phạm vi/)
  assert.equal(calls.some(x => x[0] === 'POST'), false)
})
