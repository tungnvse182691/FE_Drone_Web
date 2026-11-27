import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/api/services/aiRunDetailService.ts', import.meta.url), 'utf8')
const { code } = await transform(source.replace("import { apiClient } from '../client'", 'const apiClient = globalThis.ft95TrackerClient'), { loader: 'ts', format: 'esm' })
const calls = []
let blocked = false
globalThis.ft95TrackerClient = { async get(path, options) {
  calls.push([path, options?.params])
  if (path === '/datasets/dataset') return { data: { id: 'dataset', projectId: 'project', surveyTaskId: 'task' } }
  if (path === '/projects/project/ai-videos') {
    if (blocked) throw Object.assign(new Error('cookie ineligible'), { response: { status: 401 } })
    const offset = options.params.offset
    return { data: { items: [{ workId: `work-${offset}`, jobId: `job-${offset}`, state: offset ? 'Running' : 'Ingested' }], hasMore: offset === 0 } }
  }
  if (path.startsWith('/processing-jobs/job-')) return { data: { id: path.split('/').at(-1), status: path.endsWith('-0') ? 'SUCCEEDED' : 'RUNNING', resultId: path.endsWith('-0') ? 'detection' : null } }
  throw new Error(`Unexpected request ${path}`)
} }
const { aiRunDetailService } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))

test('FT95 discovery preserves dataset/work/job/detection identities and follows offset pagination', async () => {
  const rows = await aiRunDetailService.listForDataset('project', 'task', 'dataset')
  assert.deepEqual(rows.map(r => [r.datasetId, r.workId, r.processingJobId, r.firstDetectionId, r.status]), [
    ['dataset', 'work-0', 'job-0', 'detection', 'SUCCEEDED'],
    ['dataset', 'work-50', 'job-50', null, 'RUNNING'],
  ])
  assert.deepEqual(calls.filter(c => c[0].endsWith('/ai-videos')).map(c => c[1]), [0, 50].map(offset => ({ datasetId: 'dataset', offset, limit: 50 })))
  assert.equal(calls.some(c => c[0].includes('mock')), false)
})

test('cookie 401 is propagated and a different dataset scope fails before work discovery', async () => {
  calls.length = 0; blocked = true
  await assert.rejects(aiRunDetailService.listForDataset('project', 'task', 'dataset'), e => e.response.status === 401)
  calls.length = 0
  await assert.rejects(aiRunDetailService.listForDataset('other-project', 'task', 'dataset'), /không thuộc/)
  assert.deepEqual(calls.map(c => c[0]), ['/datasets/dataset'])
})
