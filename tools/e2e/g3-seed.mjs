// G3 — TẠO TRẠNG THÁI TEST cho nghiệm thu bằng API được phép (KHÔNG ghi DB). Mọi trạng thái do script này tạo là "API-created" (Crew giả lập app Mobile).
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g3-seed.mjs <step> [itemId]
//  steps: status | approve | assign | crew-submit | crew-supplement
// Dùng Bearer (POST /auth/login) trực tiếp vào BE https://localhost:18443, không qua trình duyệt.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import { deflateSync } from 'node:zlib'
import { createHash, randomUUID } from 'node:crypto'
const API = process.env.RG_API || 'https://localhost:18443/api/v1'
const A = '72f84201-c001-4000-8000-000000000001', B = '72f84201-c001-4000-8000-000000000002'
const accounts = JSON.parse(process.env.RG_ACCOUNTS || '[]')
const acc = (k) => { const a = accounts.find((x) => x.key === k); if (!a) throw new Error('no account ' + k); return a }
const tokens = {}
async function bearer(key) {
  if (tokens[key]) return tokens[key]
  const a = acc(key)
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: a.email, password: a.password }) })
  const j = await r.json()
  if (!j.accessToken) throw new Error(`login ${key} ${r.status} ${JSON.stringify(j).slice(0, 200)}`)
  return (tokens[key] = { token: j.accessToken, id: j.user?.id })
}
async function send(key, method, path, body, headers = {}) {
  const t = await bearer(key)
  const h = { Authorization: `Bearer ${t.token}`, ...headers }
  if (method !== 'GET') { h['Idempotency-Key'] = h['Idempotency-Key'] || randomUUID() }
  if (body !== undefined) h['Content-Type'] = 'application/json'
  const r = await fetch(`${API}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  let json = null; const txt = await r.text(); try { json = JSON.parse(txt) } catch { json = txt }
  return { status: r.status, json, etag: r.headers.get('etag') }
}
const q = (v) => (String(v).startsWith('"') ? String(v) : `"${v}"`)
const log = (...a) => console.log(...a)
function png(seed) { // PNG hợp lệ 48x48 màu phẳng khác nhau
  const w = 48, h = 48, rows = []
  for (let y = 0; y < h; y++) { const row = [0]; for (let x = 0; x < w; x++) row.push((seed * 53 + x * 3) & 255, (seed * 97 + y * 3) & 255, (seed * 31) & 255); rows.push(Buffer.from(row)) }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))])
}
async function upload(key, projectId, taskId, purpose, seed) {
  const bytes = png(seed), sha = createHash('sha256').update(bytes).digest('hex')
  const c = await send(key, 'POST', '/uploads', { purpose, projectId, targetId: taskId, fileName: `g3-${purpose.toLowerCase()}-${seed}.png`, mediaType: 'image/png', sizeBytes: bytes.length, checksumSha256: sha })
  if (c.status >= 300) throw new Error('upload create ' + c.status + ' ' + JSON.stringify(c.json).slice(0, 300))
  const { id, fileId } = c.json
  const s = await send(key, 'GET', `/uploads/${id}`)
  const pu = await send(key, 'POST', `/uploads/${id}/part-urls`, { partNumbers: [1] })
  if (pu.status >= 300) throw new Error('part-urls ' + pu.status + JSON.stringify(pu.json).slice(0, 200))
  const put = await fetch(pu.json.parts[0].url, { method: 'PUT', body: bytes })
  const eTag = put.headers.get('etag'); if (!put.ok || !eTag) throw new Error('PUT part ' + put.status)
  const s2 = await send(key, 'GET', `/uploads/${id}`)
  const done = await send(key, 'POST', `/uploads/${id}/complete`, { parts: [{ partNumber: 1, eTag }], checksumSha256: sha }, { 'If-Match': q(s2.etag || s2.json.version) })
  if (done.status >= 300) throw new Error('complete ' + done.status + JSON.stringify(done.json).slice(0, 300))
  for (let i = 0; i < 40; i++) { const g = await send(key, 'GET', `/uploads/${id}`); if (g.json.status === 'VERIFIED') return { fileId, sha, size: bytes.length }; if (['FAILED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(g.json.status)) throw new Error('upload ' + g.json.status + JSON.stringify(g.json)); await new Promise((r) => setTimeout(r, 1500)) }
  throw new Error('upload timeout')
}
async function items(P, pm = 'supervisor') {
  const out = []
  for (const k of (await send(pm, 'GET', `/projects/${P}/repair-packages`)).json.items || []) for (const i of (await send(pm, 'GET', `/projects/${P}/repair-packages/${k.id}/items`)).json.items || []) out.push({ ...i, packageId: k.id })
  return out
}
const step = process.argv[2] || 'status'
const P = process.env.G3_PROJECT || A, PMK = P === A ? 'pm-a' : 'pm-b', CREWK = P === A ? 'crew-a' : 'crew-b'
const MODE = process.env.G3_MODE || 'Normal'
const list = await items(P)
if (step === 'status') { for (const i of list) log(i.packageId.slice(0, 8), i.id, i.mode, i.state, i.version); process.exit(0) }
const it = process.argv[3] ? list.find((x) => x.id.startsWith(process.argv[3])) : list.find((x) => x.mode === MODE)
if (!it) throw new Error('không có hạng mục')
const base = `/projects/${P}/repair-packages/${it.packageId}/items/${it.id}`
log('item', it.id, it.mode, it.state)
const itemEtag = async (k) => { const g = await send(k, 'GET', base); return q(g.etag || g.json.version) }

if (step === 'approve') {
  const r = await send('supervisor', 'POST', `${base}/approve`, { reason: '[TEST-FE G3] Giám sát duyệt để thử nghiệm thu' }, { 'If-Match': await itemEtag('supervisor') })
  log('approve', r.status, JSON.stringify(r.json).slice(0, 300))
}
if (step === 'assign') {
  const crew = await bearer(CREWK)
  const defect = await send(PMK, 'GET', `/projects/${P}/defects/${it.defectId}`)
  const wp = await send(PMK, 'GET', `/projects/${P}/work-package`)
  const section = (wp.json.roadSections || []).find((s) => s.currentVersionId === defect.json.roadSectionVersionId)
  const sets = await send(PMK, 'GET', `/projects/${P}/road-sections/${section.roadSectionId}/versions/${section.currentVersionId}/segment-sets`)
  const set = (sets.json.items || []).find((s) => s.status === 'PUBLISHED')
  const body = { task: { defectId: defect.json.id, defectVersion: defect.json.version, sourceKind: process.env.G3_SOURCE || 'REPORTER', routeVersionId: defect.json.roadSectionVersionId, segmentSetId: set.id, purpose: 'POST_REPAIR', requiredMeasurementType: 1, measurementScope: '{}', instructions: '[TEST-FE G3] Nhiệm vụ thử nghiệm thu', assignedToUserId: crew.id, dueAt: new Date(Date.now() + 86400000 * 3).toISOString() }, reason: '[TEST-FE G3] giao việc để thử nghiệm thu' }
  const r = await send(PMK, 'POST', `${base}/assign`, body, { 'If-Match': await itemEtag(PMK) })
  log('assign', r.status, JSON.stringify(r.json).slice(0, 400))
}
if (step === 'crew-exec' || step === 'crew-submit') {
  const hist = await send(PMK, 'GET', `${base}/history`)
  const taskId = process.env.G3_TASK || hist.json.item?.currentBinding?.taskId
  if (!taskId) throw new Error('chưa có task')
  const tp = `/projects/${P}/field-inspection-tasks/${taskId}`, ep = `${base}/tasks/${taskId}`
  const ver = async (k, p) => { const g = await send(k, 'GET', p); return q(g.etag || g.json.version) }
  const t0 = await send(CREWK, 'GET', tp); log('task', t0.status, t0.json.status)
  if (t0.json.status === 'NewAssigned' || t0.json.status === 'NEW_ASSIGNED') log('accept', (await send(CREWK, 'POST', `${tp}/accept`, { reason: 'Crew nhận việc (API-created)' }, { 'If-Match': await ver(CREWK, tp) })).status)
  const t1 = await send(CREWK, 'GET', tp)
  if (!t1.json.firstStartOriginId) log('start', (await send(CREWK, 'POST', `${tp}/start`, { originId: randomUUID(), claimedAt: new Date().toISOString() }, { 'If-Match': await ver(CREWK, tp) })).status)
  const task = (await send(CREWK, 'GET', tp)).json, firstStart = task.firstStartOriginId
  const STATE = new URL('./.g3-state.json', import.meta.url), fs = await import('node:fs')
  const saved = step === 'crew-submit' ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {}
  if (step === 'crew-exec') {
  const as = await send(CREWK, 'POST', `${ep}/assessment`, { originId: randomUUID(), fieldFirstStartId: firstStart }, { 'If-Match': await ver(PMK, base) })
  log('assessment', as.status, JSON.stringify(as.json).slice(0, 300))
  const ex = await send(CREWK, 'POST', `${ep}/execution-start`, { originId: randomUUID(), fieldFirstStartId: firstStart, claimedAt: new Date().toISOString(), assessmentId: as.json.id }, { 'If-Match': await ver(PMK, base) })
  log('execution-start', ex.status, JSON.stringify(ex.json).slice(0, 300))
  const fin = await send(CREWK, 'POST', `${ep}/execution-finish`, { originId: randomUUID(), executionStartId: ex.json.id, claimedAt: new Date().toISOString() }, { 'If-Match': await ver(PMK, base) })
  log('execution-finish', fin.status, JSON.stringify(fin.json).slice(0, 300))
  fs.writeFileSync(STATE, JSON.stringify({ finishId: fin.json.id, taskId, firstStart }))
  process.exit(0)
  }
  const fin = { json: { id: saved.finishId } }
  const before = await upload(CREWK, P, taskId, 'BEFORE', 11), after = await upload(CREWK, P, taskId, 'AFTER', 77)
  log('uploads', JSON.stringify({ before: before.fileId, after: after.fileId }))
  const sub = await send(CREWK, 'POST', `${tp}/submissions`, {
    originId: randomUUID(), startOriginId: firstStart, captureType: 'REPAIR_CLAIM', repaired: true,
    measurements: [{ sampleId: 'depth', type: 'DepressionDepth', value: 0, state: 'KNOWN', dimension: 'LENGTH', unit: 'mm', locationReason: 'on road', instrument: 'depth gauge', method: 'depth measurement' }],
    evidence: [
      { captureOriginId: randomUUID(), fileId: before.fileId, purpose: 'BEFORE', checksumSha256: before.sha, mediaType: 'image/png', capturedAt: new Date(Date.now() - 3600000).toISOString(), attemptChecklist: 'PRE_REPAIR_CAPTURE' },
      { captureOriginId: randomUUID(), fileId: after.fileId, purpose: 'AFTER', checksumSha256: after.sha, mediaType: 'image/png', capturedAt: new Date().toISOString(), attemptChecklist: 'POST_REPAIR_CAPTURE' }],
    locationProof: { kind: 'POSITION_CHECKLIST', checklist: 'ROUTE_CHAINAGE_MARKINGS_CONFIRMED', observedRouteVersionId: task.routeVersionId, observedChainageMeters: 1 }
  }, { 'If-Match': await ver(CREWK, tp) })
  log('submission', sub.status, JSON.stringify(sub.json).slice(0, 500))
  if (sub.status < 300) {
    const at = await send(CREWK, 'POST', `${ep}/attempts`, { fieldSubmissionId: sub.json.id, expectedContentHash: sub.json.contentHash, executionFinishId: fin.json.id }, { 'If-Match': await ver(PMK, base) })
    log('attempts', at.status, JSON.stringify(at.json).slice(0, 400))
  }
}
if (step === 'crew-supplement') {
  const hist = await send(PMK, 'GET', `${base}/history`)
  const taskId = hist.json.item?.currentBinding?.taskId
  const tp = `/projects/${P}/field-inspection-tasks/${taskId}`, ep = `${base}/tasks/${taskId}`
  const ver = async (k, p) => { const g = await send(k, 'GET', p); return q(g.etag || g.json.version) }
  const task = (await send(CREWK, 'GET', tp)).json
  const after = await upload(CREWK, P, taskId, 'AFTER', 131)
  const sub = await send(CREWK, 'POST', `${tp}/submissions`, {
    originId: randomUUID(), startOriginId: task.firstStartOriginId, parentSubmissionId: task.latestSubmissionId, captureType: 'REPAIR_CLAIM', repaired: true,
    measurements: [{ sampleId: 'depth', type: 'DepressionDepth', value: 0, state: 'KNOWN', dimension: 'LENGTH', unit: 'mm', locationReason: 'on road', instrument: 'depth gauge', method: 'depth measurement' }],
    evidence: [{ captureOriginId: randomUUID(), fileId: after.fileId, purpose: 'AFTER', checksumSha256: after.sha, mediaType: 'image/png', capturedAt: new Date().toISOString(), attemptChecklist: 'POST_REPAIR_CAPTURE' }],
    locationProof: { kind: 'POSITION_CHECKLIST', checklist: 'ROUTE_CHAINAGE_MARKINGS_CONFIRMED', observedRouteVersionId: task.routeVersionId, observedChainageMeters: 1 }
  }, { 'If-Match': await ver(CREWK, tp) })
  log('supplement-submission', sub.status, JSON.stringify(sub.json).slice(0, 500))
  if (sub.status < 300) {
    const at = await send(CREWK, 'POST', `${ep}/attempts/supplements`, { fieldSubmissionId: sub.json.id, expectedContentHash: sub.json.contentHash }, { 'If-Match': await ver(PMK, base) })
    log('attempts/supplements', at.status, JSON.stringify(at.json).slice(0, 400))
  }
}
if (step === 'dump') {
  const hist = await send(PMK, 'GET', `${base}/history`)
  log('HISTORY', JSON.stringify(hist.json, null, 1).slice(0, 3500))
  const taskId = hist.json.item?.currentBinding?.taskId
  const t = await send(PMK, 'GET', `/projects/${P}/field-inspection-tasks/${taskId}`)
  log('TASK(PM)', t.status, JSON.stringify(t.json, null, 1).slice(0, 3000))
  const sid = t.json.latestSubmissionId
  const s = await send(PMK, 'GET', `/projects/${P}/field-inspection-tasks/${taskId}/submissions/${sid}`)
  log('SUBMISSION', s.status, JSON.stringify(s.json, null, 1).slice(0, 2500))
  for (const e of s.json.evidence || []) { const f = await send(PMK, 'GET', `/projects/${P}/field-inspection-tasks/${taskId}/evidence/${e.fileId}`); log('EVIDENCE', e.purpose, f.status, JSON.stringify(f.json).slice(0, 500)) }
  const it2 = await send(PMK, 'GET', base); log('ITEM', JSON.stringify(it2.json).slice(0, 800))
  const sd = await send(PMK, 'GET', `${base}/source-defect`); log('SOURCE-DEFECT', sd.status, JSON.stringify(sd.json).slice(0, 1200))
  const el = await send(PMK, 'GET', `${base}/eligibility`); log('ELIGIBILITY', el.status, JSON.stringify(el.json).slice(0, 800))
}
if (step === 'pm-review') { // PM review qua API (chỉ để tạo trạng thái; ghi rõ API-created)
  const decision = process.env.G3_DECISION || 'SUPPLEMENT', reason = process.env.G3_REASON
  const hist = await send(PMK, 'GET', `${base}/history`)
  const taskId = hist.json.item.currentBinding.taskId
  const t = await send(PMK, 'GET', `/projects/${P}/field-inspection-tasks/${taskId}`)
  const body = { fieldSubmissionId: t.json.latestSubmissionId, decision, ...(reason ? { reason } : {}) }
  const r = await send(PMK, 'POST', `${base}/tasks/${taskId}/attempts/reviews`, body, { 'If-Match': q(hist.json.item.version) })
  log('review', r.status, JSON.stringify(r.json).slice(0, 400))
}
if (step === 'taskhist') {
  const hist = await send(PMK, 'GET', `${base}/history`)
  const taskId = hist.json.item.currentBinding.taskId
  const h = await send(PMK, 'GET', `/projects/${P}/field-inspection-tasks/${taskId}/history`)
  log(JSON.stringify(h.json, null, 1).slice(0, 4000))
}
