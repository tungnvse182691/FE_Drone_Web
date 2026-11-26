// Tạo dữ liệu mẫu để test FE web trên BE MỚI (RoadGuardSystem-new) sau khi stack demo vừa dựng xong.
// Chạy:  node tools/seed-test-data.mjs            (cần Docker stack đang chạy, Node >= 20.15)
// Biến môi trường tùy chọn:
//   RG_API_CONTAINER  tên container API  (mặc định roadguard-new-api-1)
//   RG_SQL_CONTAINER  tên container SQL  (mặc định roadguard-new-sql-1; chỉ để in datasetId)
//   RG_BASE           mặc định https://localhost:18443/api/v1
// Mật khẩu tài khoản demo đọc từ container ngay lúc chạy, KHÔNG in ra và KHÔNG ghi file.
// Chạy lại an toàn: tiến độ lưu ở tools/.seed-state.json, bước nào xong rồi thì bỏ qua.
// Mọi lý do/ghi chú tạo ra đều có tiền tố "[TEST-FE]" để nhận biết và xóa (reset volume demo).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import zlib from 'node:zlib'
import crypto from 'node:crypto'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // chứng chỉ tự ký của stack demo
const BASE = process.env.RG_BASE || 'https://localhost:18443/api/v1'
const API_C = process.env.RG_API_CONTAINER || 'roadguard-new-api-1'
const SQL_C = process.env.RG_SQL_CONTAINER || 'roadguard-new-sql-1'
const STATE_FILE = new URL('./.seed-state.json', import.meta.url)
const S = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {}
const save = () => fs.writeFileSync(STATE_FILE, JSON.stringify(S, null, 1))

const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const accounts = JSON.parse(docker('exec', API_C, 'cat', '/handoff/demo-accounts.json'))
const tokens = {}
const idem = () => crypto.randomUUID()
const q = (v) => (v && !v.startsWith('"') ? `"${v}"` : v)
async function token(key) {
  if (tokens[key]) return tokens[key]
  const a = accounts.find((x) => x.key === key)
  if (!a) throw new Error('Không có tài khoản ' + key)
  const r = await fetch(BASE + '/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: a.email, password: a.password }) })
  const j = await r.json()
  if (r.status !== 200 || !j.accessToken) throw new Error(`Đăng nhập ${key} thất bại: HTTP ${r.status}`)
  return (tokens[key] = j.accessToken)
}
async function call(key, method, path, body, headers = {}) {
  const h = { authorization: 'Bearer ' + (await token(key)), ...headers }
  if (body !== undefined) h['content-type'] = 'application/json'
  const r = await fetch(BASE + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined })
  let j = null
  try { j = await r.json() } catch { /* không có body */ }
  return { status: r.status, body: j, etag: r.headers.get('etag') }
}
const must = (label, r, ok = [200, 201, 202]) => {
  if (!ok.includes(r.status)) throw new Error(`${label}: HTTP ${r.status} ${r.body?.code || r.body?.title || ''}`)
  console.log(`  ✔ ${label} (${r.status})`)
  return r
}
const step = async (name, fn) => {
  if (S.done?.[name]) { console.log(`- ${name}: đã có, bỏ qua`); return }
  console.log(`- ${name}`)
  await fn()
  ;(S.done ||= {})[name] = true
  save()
}

// ---- khám phá bối cảnh dự án A ----
const projects = (await call('pm-a', 'GET', '/projects')).body.items
const P = projects[0].projectId
console.log('Dự án:', projects[0].name, P)
const defect = (await call('pm-a', 'GET', `/projects/${P}/defects`)).body.items[0]
const getDefect = async () => { const d = await call('pm-a', 'GET', `/projects/${P}/defects/${defect.id}`); return { ...d.body, etag: d.etag } }
const d0 = await getDefect()
const route = d0.roadSectionVersionId
const wp = (await call('pm-a', 'GET', `/projects/${P}/work-package`)).body
const section = wp.roadSections.find((s) => s.currentVersionId === route)
const set = (await call('pm-a', 'GET', `/projects/${P}/road-sections/${section.roadSectionId}/versions/${route}/segment-sets`)).body.items.find((s) => s.status === 'PUBLISHED')
const crewId = (await call('crew-a', 'GET', '/me')).body.id
const scope = (from, to) => ({ physicalRoadId: section.roadSectionId, routeVersionId: route, segmentSetId: set.id, fromMeters: from, toMeters: to, offsetFromMeters: 0, offsetToMeters: 1 })

// ---- gói sửa chữa + hạng mục ----
async function newPackage(name, from, to, withSafety) {
  const d = await getDefect()
  const obligations = [{ kind: 'FORMAL_REPAIR', mandatory: true, scope: scope(from, to), reason: `[TEST-FE] ${name}: nghĩa vụ sửa chính thức` }]
  if (withSafety) obligations.push({ kind: 'TEMPORARY_SAFETY', mandatory: false, scope: scope(from, from + 1), reason: `[TEST-FE] ${name}: an toàn tạm thời` })
  const pkg = must(`${name}: tạo gói`, await call('pm-a', 'POST', `/projects/${P}/repair-packages`, { defectId: d.id, defectVersion: d.etag.replace(/"/g, ''), obligations, reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': d.etag })).body
  const list = (await call('pm-a', 'GET', `/projects/${P}/repair-packages`)).body.items.find((x) => x.id === pkg.id)
  const item = must(`${name}: đề xuất hạng mục`, await call('pm-a', 'POST', `/projects/${P}/repair-packages/${pkg.id}/items`, { obligationId: pkg.unresolvedMandatoryObligationIds[0], mode: 'NORMAL', repairPlan: `[TEST-FE] ${name}`, checklistVersion: 'v1', reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': q(list.version) })).body
  return { pkg: pkg.id, item: item.id, from }
}
const itemPath = (x) => `/projects/${P}/repair-packages/${x.pkg}/items/${x.item}`
const itemVer = async (x, who = 'pm-a') => (await call(who, 'GET', itemPath(x))).etag
async function approve(x, name) {
  must(`${name}: Giám sát duyệt`, await call('supervisor', 'POST', itemPath(x) + '/approve', { reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': await itemVer(x) }))
}
async function assign(x, name) {
  const d = await getDefect()
  const r = must(`${name}: giao đội thi công`, await call('pm-a', 'POST', itemPath(x) + '/assign', { task: { defectId: d.id, defectVersion: d.version, sourceKind: 'REPORTER', routeVersionId: route, segmentSetId: set.id, purpose: 'POST_REPAIR', requiredMeasurementType: 1, measurementScope: '{}', instructions: `[TEST-FE] ${name}`, assignedToUserId: crewId, dueAt: new Date(Date.now() + 3 * 864e5).toISOString() }, reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': await itemVer(x) }))
  x.task = r.body.taskId
}
async function crewStart(x, name) {
  const tb = `/projects/${P}/field-inspection-tasks/${x.task}`
  let t = await call('crew-a', 'GET', tb)
  if (t.body.status === 'NewAssigned') { must(`${name}: Crew nhận việc`, await call('crew-a', 'POST', tb + '/accept', { reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': q(t.etag) })); t = await call('crew-a', 'GET', tb) }
  if (!t.body.firstStartOriginId) { must(`${name}: Crew bắt đầu`, await call('crew-a', 'POST', tb + '/start', { originId: crypto.randomUUID(), claimedAt: new Date().toISOString(), deviceId: null, monotonicMilliseconds: 1000, bootId: crypto.randomUUID() }, { 'Idempotency-Key': idem(), 'If-Match': q(t.etag) })); t = await call('crew-a', 'GET', tb) }
  x.firstStart = t.body.firstStartOriginId
}
function png() {
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([len, td, crc]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(8, 0); ihdr.writeUInt32BE(8, 4); ihdr[8] = 8; ihdr[9] = 2
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array(8).fill([60, 160, 90]).flat())])
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(Array(8).fill(row)))), chunk('IEND', Buffer.alloc(0))])
}
async function uploadAfterPhoto(x) {
  const bytes = png(), sha = crypto.createHash('sha256').update(bytes).digest('hex')
  const c = must('  tải ảnh sau sửa: tạo phiên', await call('crew-a', 'POST', '/uploads', { purpose: 'AFTER', projectId: P, targetId: x.task, fileName: 'test-fe-after.png', mediaType: 'image/png', sizeBytes: bytes.length, checksumSha256: sha }, { 'Idempotency-Key': idem() })).body
  const pu = await call('crew-a', 'POST', `/uploads/${c.id}/part-urls`, { partNumbers: [1] }, { 'Idempotency-Key': idem() })
  const put = await fetch(pu.body.parts[0].url, { method: 'PUT', body: bytes })
  if (put.status !== 200) throw new Error('PUT đối tượng thất bại: ' + put.status)
  const cur = await call('crew-a', 'GET', `/uploads/${c.id}`)
  must('  tải ảnh sau sửa: hoàn tất', await call('crew-a', 'POST', `/uploads/${c.id}/complete`, { parts: [{ partNumber: 1, eTag: put.headers.get('etag') }], checksumSha256: sha }, { 'Idempotency-Key': idem(), 'If-Match': q(cur.etag) }), [200, 202])
  for (let i = 0; i < 40; i++) {
    const g = await call('crew-a', 'GET', `/uploads/${c.id}`)
    if (/verified/i.test(g.body?.status || '')) return { fileId: c.fileId, sha }
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error('Ảnh chưa được xác minh sau 80 giây')
}
// Crew làm hết quy trình tới khi nộp kết quả; decision: 'ACCEPT' hoặc 'SUPPLEMENT'
async function crewSubmitAndReview(x, name, decision) {
  const exec = `${itemPath(x)}/tasks/${x.task}`, tb = `/projects/${P}/field-inspection-tasks/${x.task}`
  const as = must(`${name}: đánh giá trước thi công`, await call('crew-a', 'POST', exec + '/assessment', { originId: crypto.randomUUID(), fieldFirstStartId: x.firstStart }, { 'Idempotency-Key': idem(), 'If-Match': q(await itemVer(x)) }))
  const es = must(`${name}: bắt đầu thi công`, await call('crew-a', 'POST', exec + '/execution-start', { originId: crypto.randomUUID(), fieldFirstStartId: x.firstStart, claimedAt: new Date().toISOString(), assessmentId: as.body.id }, { 'Idempotency-Key': idem(), 'If-Match': q(await itemVer(x)) }))
  const ef = must(`${name}: kết thúc thi công`, await call('crew-a', 'POST', exec + '/execution-finish', { originId: crypto.randomUUID(), executionStartId: es.body.id, claimedAt: new Date().toISOString() }, { 'Idempotency-Key': idem(), 'If-Match': q(await itemVer(x)) }))
  const photo = await uploadAfterPhoto(x)
  const t = await call('crew-a', 'GET', tb)
  const sub = must(`${name}: nộp kết quả`, await call('crew-a', 'POST', tb + '/submissions', {
    originId: crypto.randomUUID(), startOriginId: x.firstStart, captureType: 'REPAIR_CLAIM', repaired: true,
    measurements: [{ sampleId: 'depth', type: 'DepressionDepth', value: 0, state: 'KNOWN', dimension: 'LENGTH', unit: 'mm', locationReason: 'on road', instrument: 'depth gauge', method: 'depth measurement' }],
    evidence: [{ captureOriginId: crypto.randomUUID(), fileId: photo.fileId, purpose: 'AFTER', checksumSha256: photo.sha, mediaType: 'image/png', capturedAt: new Date().toISOString(), attemptChecklist: 'POST_REPAIR_CAPTURE' }],
    locationProof: { kind: 'POSITION_CHECKLIST', checklist: 'ROUTE_CHAINAGE_MARKINGS_CONFIRMED', observedRouteVersionId: route, observedChainageMeters: x.from },
  }, { 'Idempotency-Key': idem(), 'If-Match': q(t.etag) }))
  must(`${name}: liên kết lượt thi công`, await call('crew-a', 'POST', exec + '/attempts', { fieldSubmissionId: sub.body.id, expectedContentHash: sub.body.contentHash, executionFinishId: ef.body.id }, { 'Idempotency-Key': idem(), 'If-Match': q(await itemVer(x)) }))
  must(`${name}: PM review ${decision}`, await call('pm-a', 'POST', exec + '/attempts/reviews', { fieldSubmissionId: sub.body.id, decision, reason: `[TEST-FE] ${name}` }, { 'Idempotency-Key': idem(), 'If-Match': q(await itemVer(x)) }))
}

console.log('\n== 1. Hạng mục chờ Giám sát duyệt: dữ liệu seed sẵn của BE (không đụng tới) ==')

await step('B. Hạng mục ReadyToAssign (thử form Giao đội thi công)', async () => {
  const x = await newPackage('B ready-to-assign', 6, 7, false); await approve(x, 'B'); S.B = x
})
await step('C. Hạng mục đang thi công + nghĩa vụ an toàn (thử Biện pháp an toàn)', async () => {
  const x = await newPackage('C safety', 8, 10, true); await approve(x, 'C'); await assign(x, 'C'); await crewStart(x, 'C'); S.C = x
})
await step('D. Hạng mục đã nộp, PM yêu cầu bổ sung (thử Yêu cầu tiếp nhận)', async () => {
  const x = await newPackage('D supplement', 11, 12, false); await approve(x, 'D'); await assign(x, 'D'); await crewStart(x, 'D'); await crewSubmitAndReview(x, 'D', 'SUPPLEMENT'); S.D = x
})
await step('E. Hạng mục Confirmed (thử Hiệu chỉnh / Yêu cầu xem xét lại / Hạng mục kế tiếp)', async () => {
  const x = await newPackage('E confirmed', 13, 14, false); await approve(x, 'E'); await assign(x, 'E'); await crewStart(x, 'E'); await crewSubmitAndReview(x, 'E', 'ACCEPT')
  must('E: Giám sát xác nhận cuối', await call('supervisor', 'POST', itemPath(x) + '/final-confirmation', { reason: '[TEST-FE] xác nhận cuối' }, { 'Idempotency-Key': idem(), 'If-Match': await itemVer(x) })); S.E = x
})
await step('F. Hai nhiệm vụ đo hiện trường (thử giao lại / hủy)', async () => {
  const d = await getDefect(); S.F = []
  for (const n of [1, 2]) {
    const r = must(`F${n}: tạo nhiệm vụ đo`, await call('pm-a', 'POST', `/projects/${P}/field-inspection-tasks`, { defectId: d.id, defectVersion: d.version, sourceKind: 'REPORTER', routeVersionId: route, segmentSetId: set.id, purpose: 'PRE_MEASUREMENT', requiredMeasurementType: 1, measurementScope: '{}', instructions: `[TEST-FE] Nhiệm vụ đo thử số ${n}`, assignedToUserId: crewId, dueAt: new Date(Date.now() + 5 * 864e5).toISOString() }, { 'Idempotency-Key': idem() }))
    S.F.push(r.body.id)
  }
})
await step('G. Kế hoạch + nhiệm vụ khảo sát mới (thử hoãn / hủy / giao lại / bổ sung)', async () => {
  const existing = (await call('pm-a', 'GET', `/projects/${P}/survey-tasks`)).body.items[0]
  const sc = (await call('pm-a', 'GET', `/survey-tasks/${existing.id}`)).body.scope
  const operatorId = existing.operatorId
  const plan = must('G: tạo kế hoạch khảo sát', await call('pm-a', 'POST', `/projects/${P}/survey-plans`, { scope: sc, plannedAt: new Date(Date.now() + 7 * 864e5).toISOString(), surveyType: 'AD_HOC' }, { 'Idempotency-Key': idem() }))
  const task = must('G: tạo nhiệm vụ khảo sát (gắn planId)', await call('pm-a', 'POST', `/projects/${P}/survey-tasks`, { planId: plan.body.id, scope: sc, surveyType: 'AD_HOC', operatorId, dueAt: new Date(Date.now() + 8 * 864e5).toISOString() }, { 'Idempotency-Key': idem() }))
  S.G = { plan: plan.body.id, task: task.body.id, seedTask: existing.id }
})

// ---- (tùy chọn) nhiều bản nộp cho một nhiệm vụ: node tools/seed-test-data.mjs --multi-version [đường-dẫn-mp4] ----
// API không cho nộp lần 2 (nhiệm vụ đã SUBMITTED không giao lại/nhận lại được), nên các bản 2..29 được chèn thẳng vào bảng
// SurveyDataVersions (sao chép bản 1) CHỈ để thử giao diện chọn bản / đổi bản / phân trang. Dữ liệu giả, xóa bằng reset volume.
if (process.argv.includes("--multi-version")) {
  await step("H. Nhiệm vụ có 29 bản nộp (thử chọn bản, đổi bản, Tải thêm)", async () => {
    const mp4Path = process.argv.slice(2).find((a) => a.endsWith(".mp4")) || process.env.RG_FIXTURE_MP4
    if (!mp4Path) throw new Error("Cần đường dẫn video mẫu: contracts/ai/fixtures/anh02/synthetic-road-v1.mp4 của BE (đối số .mp4 hoặc RG_FIXTURE_MP4)")
    const bytes = fs.readFileSync(mp4Path), sha = crypto.createHash("sha256").update(bytes).digest("hex")
    const seed = (await call("pm-a", "GET", `/projects/${P}/survey-tasks`)).body.items[0]
    const sc = (await call("pm-a", "GET", "/survey-tasks/" + seed.id)).body.scope
    const opId = (await call("operator-a", "GET", "/me")).body.id
    const task = must("H: tạo nhiệm vụ khảo sát", await call("pm-a", "POST", `/projects/${P}/survey-tasks`, { scope: sc, surveyType: "AD_HOC", operatorId: opId, dueAt: new Date(Date.now() + 8 * 864e5).toISOString() }, { "Idempotency-Key": idem() })).body
    let t = await call("operator-a", "GET", "/survey-tasks/" + task.id)
    must("H: Operator nhận việc", await call("operator-a", "POST", `/survey-tasks/${task.id}/accept`, undefined, { "Idempotency-Key": idem(), "If-Match": q(t.etag) })); t = await call("operator-a", "GET", "/survey-tasks/" + task.id)
    const c = must("H: tạo phiên tải video", await call("operator-a", "POST", "/uploads", { purpose: "SURVEY_VIDEO", projectId: P, targetId: task.id, fileName: "TEST-FE-multi.mp4", mediaType: "video/mp4", sizeBytes: bytes.length, checksumSha256: sha }, { "Idempotency-Key": idem() })).body
    const pu = await call("operator-a", "POST", `/uploads/${c.id}/part-urls`, { partNumbers: [1] }, { "Idempotency-Key": idem() })
    const put = await fetch(pu.body.parts[0].url, { method: "PUT", body: bytes }); const cur = await call("operator-a", "GET", `/uploads/${c.id}`)
    must("H: hoàn tất tải video", await call("operator-a", "POST", `/uploads/${c.id}/complete`, { parts: [{ partNumber: 1, eTag: put.headers.get("etag") }], checksumSha256: sha }, { "Idempotency-Key": idem(), "If-Match": q(cur.etag) }), [200, 202])
    for (let i = 0; i < 40; i++) { const f = await call("operator-a", "GET", "/files/" + c.fileId); if (f.body?.status === "VERIFIED" || f.body?.state === "VERIFIED") break; await new Promise((r) => setTimeout(r, 2000)) }
    const device = (await call("pm-a", "GET", "/datasets/" + (S.datasetId || ""))).body?.deviceId
    must("H: Operator nộp bản 1", await call("operator-a", "POST", `/survey-tasks/${task.id}/datasets`, { videoFileIds: [c.fileId], telemetryFileIds: [], recordedAt: "2026-10-02T08:00:00Z", deviceId: device, scope: sc, pairs: [{ videoFileId: c.fileId, telemetryFileId: null, timeOffsetMilliseconds: 0 }] }, { "Idempotency-Key": idem(), "If-Match": q(t.etag) }))
    const pw = docker("exec", API_C, "cat", "/handoff/sql-password").trim()
    const sqlcmd = (db, query) => docker("exec", SQL_C, "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", pw, "-d", db, "-h", "-1", "-W", "-Q", query)
    const dbName = sqlcmd("master", "SET NOCOUNT ON; select top 1 name from sys.databases where name like 'RoadGuard%'").trim().split("\n")[0].trim()
    const sid = sqlcmd(dbName, `SET NOCOUNT ON; select cast(Id as varchar(36)) from Surveys where SurveyRequestId='${task.id}'`).trim().split("\n")[0].trim()
    sqlcmd(dbName, `SET NOCOUNT ON; DECLARE @n int=2; WHILE @n<=29 BEGIN INSERT INTO SurveyDataVersions (Id,SurveyId,VersionNo,Status,IntegrityStatus,ConfirmedAt,ConfirmedBy,SourceManifest,RecordedAt,DeviceId,ScopeManifest,SubmittedBy,PairsManifest) SELECT NEWID(),SurveyId,@n,Status,IntegrityStatus,DATEADD(minute,@n,ConfirmedAt),ConfirmedBy,SourceManifest,RecordedAt,DeviceId,ScopeManifest,SubmittedBy,PairsManifest FROM SurveyDataVersions WHERE SurveyId='${sid}' AND VersionNo=1; SET @n=@n+1 END`)
    S.H = { task: task.id }
    console.log("  ✔ H: đã chèn bản 2..29 vào SurveyDataVersions (dữ liệu giả, chỉ để thử giao diện)")
  })
}

// ---- datasetId của bản nộp seed (BE chưa có API liệt kê nên lấy bằng SQL, chỉ để in cho người test) ----
let datasetId = S.datasetId
if (!datasetId) {
  try {
    const seedTask = S.G?.seedTask || (await call('pm-a', 'GET', `/projects/${P}/survey-tasks`)).body.items[0].id
    const pw = docker('exec', API_C, 'cat', '/handoff/sql-password').trim()
    const sqlcmd = (db, query) => docker('exec', SQL_C, '/opt/mssql-tools/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', pw, '-d', db, '-h', '-1', '-W', '-Q', query)
    const dbName = sqlcmd('master', "SET NOCOUNT ON; select top 1 name from sys.databases where name like 'RoadGuard%'").trim().split(/\r?\n/)[0].trim()
    const rows = sqlcmd(dbName, `SET NOCOUNT ON; select lower(cast(Id as varchar(36))) from SurveyDataVersions where SurveyId in (select Id from Surveys where SurveyRequestId='${seedTask}')`).trim().split(/\r?\n/).map((s) => s.trim()).filter((s) => /^[0-9a-f-]{36}$/.test(s))
    datasetId = rows[0]
    if (datasetId) { S.datasetId = datasetId; save() }
  } catch (e) { console.log('(không lấy được datasetId bằng SQL:', String(e.message).split('\n')[0], ')') }
}

const itemOf = (x) => x ? `gói ${x.pkg.slice(0, 8)} / hạng mục ${x.item.slice(0, 8)}` : '—'
console.log(`
==================== DỮ LIỆU ĐÃ SẴN SÀNG ====================
Dự án: ${projects[0].name} (${P})
Hạng mục sửa chữa (Normal):
  seed của BE : AwaitingApproval        → Giám sát thử "Duyệt hạng mục" ở /sup/proposals
  B           : ReadyToAssign           → /pm/repair-batches/assign (${itemOf(S.B)})
  C           : Assigned/đang thi công  → /pm/proposals → "Biện pháp an toàn thi công" (${itemOf(S.C)})
  D           : Submitted + CrewSupplement → /pm/notifications, /sup/notifications (${itemOf(S.D)})
  E           : Confirmed               → Hiệu chỉnh (Giám sát) / Xem xét lại / Hạng mục kế tiếp (${itemOf(S.E)})
Nhiệm vụ đo hiện trường: ${(S.F || []).join(', ')}   → /pm/field-tasks
Khảo sát: kế hoạch ${S.G?.plan}, nhiệm vụ ${S.G?.task}
  → /pm/surveys?surveyRecordId=<id>&surveyRecordKind=PLAN|TASK
Nhiệm vụ khảo sát seed của BE (có bản nộp): ${S.G?.seedTask}; id bản nộp để đối chiếu: ${datasetId || '(không tra được)'}
  → khung "Bộ dữ liệu" tự lấy danh sách bản nộp theo nhiệm vụ (GET /survey-tasks/{id}/datasets), không cần nhập mã
Nhãn huấn luyện, thống kê khiếm khuyết, chạy AI, phong tỏa lưu trữ: tạo ngay trên giao diện (BE đã seed phát hiện AI và tệp).
${S.H ? `Nhiều bản nộp (29 bản, chèn SQL): nhiệm vụ ${S.H.task}` : 'Nhiều bản nộp: chạy lại với --multi-version <đường-dẫn-mp4> (tùy chọn)'}
Chưa có dữ liệu cho: Fast Track (Giám sát nhận thông báo), khiếm khuyết VERIFIED (xuất bản), đổi phiên bản tuyến (ảnh hưởng hình học), đóng vận hành (gia hạn phạm vi).
Xóa toàn bộ: trong deploy/fe-handoff của BE chạy  docker compose -p <tên-project> -f compose.yaml -f compose.https.yaml down -v  rồi dựng lại (và xóa tools/.seed-state.json).
=============================================================`)
