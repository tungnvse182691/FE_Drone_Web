// Development-only verification. Credentials stay in memory; writes use official APIs only.
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const base = process.env.RG_TEST_BASE || 'http://localhost:18081'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Only local development endpoints allowed')
const apiContainer = process.env.RG_TEST_API_CONTAINER || 'roadguard-fe-starter01-api-1'
const sqlContainer = process.env.RG_TEST_SQL_CONTAINER || 'roadguard-fe-starter01-sql-1'
const marker = 'RG-INTAKE-20261103-01'
const ledgerPath = process.env.RG_TEST_LEDGER || require('node:path').join(require('node:os').tmpdir(), marker + '.json')
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {}
const saveLedger = () => fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2))
const accounts = () => JSON.parse(execFileSync('docker', ['exec', apiContainer, 'cat', '/handoff/demo-accounts.json'], { encoding: 'utf8', timeout: 15000 }))
async function login(key) {
  const account = accounts().find(item => item.key === key)
  assert.ok(account, `Missing test account ${key}`)
  const response = await fetch(base + '/api/v1/auth/android/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: account.email, password: account.password }) })
  assert.equal(response.status, 200, `Test login ${key}`)
  return (await response.json()).accessToken
}
async function request(token, route, method = 'GET', body, key, version) {
  const response = await fetch(base + route, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(key ? { 'Idempotency-Key': key } : {}), ...(version ? { 'If-Match': version.startsWith('"') ? version : `"${version}"` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = { unparsedResponse: true } }
  if (!response.ok) throw Object.assign(new Error(`${method} ${route}: ${response.status} ${data?.code || ''}`), { status: response.status, data })
  return { data, etag: response.headers.get('etag'), status: response.status }
}
function readSql(query) {
  assert.ok(/^SELECT\s/i.test(query) && !/\b(INSERT|UPDATE|DELETE|MERGE|DROP|ALTER|EXEC|INTO|TRUNCATE)\b/i.test(query), 'Read-only SELECT required')
  const config = JSON.parse(execFileSync('docker', ['exec', apiContainer, 'cat', '/handoff/config.json'], { encoding: 'utf8', timeout: 15000 }))
  const database = config.RoadGuardDatabase.ConnectionString.match(/(?:Database|Initial Catalog)=([^;]+)/i)[1]
  assert.match(database, /^RoadGuard_FE_[A-Za-z0-9_]+$/)
  // Password is read inside the container, never printed or passed from the host.
  const args = ['exec', sqlContainer, 'bash', '-c', 'export SQLCMDPASSWORD="$(cat /handoff/sql-password)"; exec /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -d "$1" -w 65535 -y 0 -Q "$2"', 'read-only', database, 'SET NOCOUNT ON; ' + query + ' FOR JSON PATH']
  const output = execFileSync('docker', args, { encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024 }).trim()
  return JSON.parse(output.slice(output.indexOf('['), output.lastIndexOf(']') + 1).replace(/[\r\n]/g, '') || '[]')
}
module.exports = { marker, login, request, readSql }

async function prepareUnassignedThree() {
  const batch = 'RG-UNASSIGNED-20261104-01'
  const reporter = await login('reporter-a')
  const supervisor = await login('supervisor')
  const pm = await login('pm-a')
  const journalKey = batch + '-journal'
  ledger[journalKey] ||= {}
  const journal = ledger[journalKey]
  const step = async (name, route, body, version) => {
    if (!journal[name]) { journal[name] = { route, body, version, key: `${batch}-${name}` }; saveLedger() }
    const saved = journal[name]
    if (!saved.result) {
      saved.result = await request(reporter, saved.route, 'POST', saved.body, saved.key, saved.version)
      saveLedger()
    }
    return saved.result
  }
  const results = []
  const descriptions = ['vị trí nghi có ổ gà', 'vị trí nghi có vết nứt mặt đường', 'vị trí nghi có bong tróc mặt đường']
  for (let index = 0; index < 3; index++) {
    const tag = `${batch}-${index + 1}`
    // Synthetic pixel fixture already used by this dev harness; no private/real incident photo.
    const content = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
    const digest = crypto.createHash('sha256').update(content).digest('hex')
    const existing = readSql(`SELECT Id FROM Reports WHERE Description LIKE '${tag}:%'`)
    assert.ok(existing.length <= 1, 'Duplicate batch marker; stop without new writes')
    let reportId = existing[0]?.Id
    if (!reportId) {
      const upload = (await step(`${index + 1}-upload`, '/api/v1/reporter-evidence/uploads', { fileName: `${tag}-synthetic-pixel.png`, mediaType: 'image/png', sizeBytes: content.length, checksumSha256: digest })).data
      const root = '/api/v1/reporter-evidence/uploads/' + upload.id
      const current = (await request(reporter, root)).data
      if (current.status === 'PENDING' || current.status === 'UPLOADING') {
        const urls = await request(reporter, root + '/part-urls', 'POST', { partNumbers: [1] }, `${tag}-part-${crypto.randomUUID()}`)
        const put = await fetch(urls.data.parts[0].url, { method: 'PUT', body: content })
        assert.ok(put.ok, 'Upload bytes failed')
        const version = (await request(reporter, root)).data.version
        await step(`${index + 1}-complete`, root + '/complete', { parts: [{ partNumber: 1, eTag: put.headers.get('etag') }], checksumSha256: digest }, version)
      }
      let file
      for (let attempt = 0; attempt < 50; attempt++) {
        file = (await request(reporter, '/api/v1/reporter-evidence/files/' + upload.fileId)).data
        if (file.status === 'VERIFIED') break
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      assert.equal(file.status, 'VERIFIED', 'No Report until evidence VERIFIED')
      reportId = (await step(`${index + 1}-report`, '/api/v1/reports', {
        description: `${tag}: Người dân mô tả ${descriptions[index]}. TÌNH HUỐNG KIỂM THỬ, chưa phải kết luận kỹ thuật. Ảnh PNG pixel tổng hợp dùng kiểm tra upload, không phải ảnh tổn hại/sự kiện thực. Không có vị trí hoặc thời điểm chụp đáng tin. Dành cho Supervisor tự điều phối.`,
        evidence: [{ fileId: upload.fileId, fileVersion: file.version, locationSource: 'UNKNOWN' }]
      })).data.id
    }
    const own = (await request(reporter, '/api/v1/reports/' + reportId)).data
    const link = readSql(`SELECT CaseId FROM CaseReportLinks WHERE ReportId='${reportId}' AND EndedAt IS NULL`)
    assert.equal(link.length, 1)
    const caseId = link[0].CaseId
    const incident = (await request(supervisor, '/api/v1/cases/' + caseId)).data
    assert.equal(incident.status, 'UNASSIGNED'); assert.ok(!incident.projectId)
    assert.equal(incident.defectIds.length, 0); assert.ok(!incident.conclusion)
    assert.equal(own.evidence.length, 1); assert.equal(own.publicUpdates.length, 0)
    await assert.rejects(request(pm, '/api/v1/cases/' + caseId), error => error.status === 403)
    results.push({ tag, description: descriptions[index], reportId, caseId, displayCode: '#CAS-' + caseId.slice(0, 8).toUpperCase(), evidenceId: own.evidence[0].id, fileId: own.evidence[0].fileId, reporter: 'reporter-a', status: incident.status, projectId: incident.projectId || null })
  }
  const count = readSql(`SELECT COUNT(*) AS Count FROM Reports WHERE Description LIKE '${batch}-%'`)
  assert.equal(count[0].Count, 3)
  let inbox
  try {
    const ids = new Set(); let cursor
    do {
      const page = (await request(supervisor, '/api/v1/cases?status=UNASSIGNED&pageSize=100' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''))).data
      page.items.forEach(item => ids.add(item.id.toLowerCase())); cursor = page.nextCursor
    } while (cursor)
    assert.ok(results.every(row => ids.has(row.caseId.toLowerCase())))
    inbox = { status: 200, allThreePresent: true }
  } catch (error) { inbox = { status: error.status, code: error.data?.code, correlationId: error.data?.correlationId, message: error.message } }
  let webInbox
  try {
    const page = await request(supervisor, '/api/v1/cases?pageSize=100')
    webInbox = { status: page.status }
  } catch (error) {
    webInbox = { status: error.status, code: error.data?.code, correlationId: error.data?.correlationId }
  }
  // A filtered API check alone cannot certify the actual Web inbox or project form.
  console.log(JSON.stringify({ batch, results, filteredUnassignedInbox: inbox, webInboxRequest: webInbox, persistedCount: results.length, browserVerified: false, handoffComplete: false }, null, 2))
}

async function prepareFieldHandoff() {
  const pm = await login('pm-b')
  const crew = await login('crew-b')
  const projectId = '72f84201-c001-4000-8000-000000000002'
  const root = `/api/v1/projects/${projectId}/field-inspection-tasks`
  const defects = (await request(pm, `/api/v1/projects/${projectId}/defects`)).data.items
  const defect = defects.find(item => item.id === 'aaab5a46-08ad-45ea-8805-d7446d5f8c89')
  assert.ok(defect, 'Existing authorized source Defect required')
  const handoff = []
  for (let index = 1; index <= 2; index++) {
    const tag = `${marker}-FIELD-${index}`
    let tasks = readSql(`SELECT Id FROM FieldInspectionTasks WHERE Instructions LIKE '${tag}%'`)
    if (!tasks.length) {
      const created = await request(pm, root, 'POST', {
        defectId: defect.id, defectVersion: defect.version, sourceKind: 'REPORTER', surveyId: null,
        routeVersionId: defect.roadSectionVersionId, purpose: 'PRE_MEASUREMENT', requiredMeasurementType: 2,
        measurementScope: JSON.stringify({ method: 'Kiểm thử dữ liệu, không phải đo thực', standard: 'TEST_ONLY', unknownReason: 'Chưa đo hiện trường' }),
        instructions: `${tag}: Hồ sơ FIELD kiểm thử trên nguồn Defect hợp lệ; không phải phản ánh tuần tra độc lập, không xác nhận đã ra hiện trường. Dành cho Hoàng kiểm tra bước tiếp theo.`,
        assignedToUserId: '72f84201-a001-4000-8000-000000000009', dueAt: '2026-11-10T12:00:00Z'
      }, `${tag}-create`)
      tasks = [{ Id: created.data.id }]
    }
    const task = (await request(pm, root + '/' + tasks[0].Id)).data
    const crewRead = await request(crew, root + '/' + task.id)
    assert.equal(crewRead.data.id, task.id)
    if (process.argv.includes('--submit-incomplete')) {
      const command = async (name, path, body, version) => {
        const key = `${tag}-${name}`
        if (!ledger[key]) { ledger[key] = { path, body, version, key }; saveLedger() }
        const saved = ledger[key]
        if (!saved.result) { saved.result = (await request(crew, saved.path, 'POST', saved.body, saved.key, saved.version)).data; saveLedger() }
        return saved.result
      }
      let current = (await request(crew, root + '/' + task.id)).data
      if (current.status === 'NewAssigned') {
        await command('accept', root + '/' + task.id + '/accept', { reason: `${tag}: nhận nhiệm vụ test, chưa đo thực` }, current.version)
        current = (await request(crew, root + '/' + task.id)).data
      }
      if (current.status === 'Accepted') {
        await command('start', root + '/' + task.id + '/start', { originId: crypto.randomUUID(), claimedAt: new Date().toISOString() }, current.version)
        current = (await request(crew, root + '/' + task.id)).data
      }
      if (!current.latestSubmissionId) {
        const content = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
        const checksumSha256 = crypto.createHash('sha256').update(content).digest('hex')
        const upload = await command('measurement-upload', '/api/v1/uploads', { purpose: 'MEASUREMENT', projectId, targetId: task.id, fileName: `${tag}-synthetic.png`, mediaType: 'image/png', sizeBytes: content.length, checksumSha256 })
        const uploadRoot = '/api/v1/uploads/' + upload.id
        let state = (await request(crew, uploadRoot)).data
        if (state.status === 'PENDING' || state.status === 'OPEN' || state.status === 'CREATED' || state.status === 'UPLOADING') {
          const parts = (await request(crew, uploadRoot + '/part-urls', 'POST', { partNumbers: [1] }, `${tag}-urls-${crypto.randomUUID()}`)).data
          const put = await fetch(parts.parts[0].url, { method: 'PUT', body: content })
          assert.ok(put.ok)
          state = (await request(crew, uploadRoot)).data
          await command('measurement-complete', uploadRoot + '/complete', { parts: [{ partNumber: 1, eTag: put.headers.get('etag') }], checksumSha256 }, state.version)
        }
        for (let retry = 0; retry < 45; retry++) {
          state = (await request(crew, uploadRoot)).data
          if (state.status === 'VERIFIED') break
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        assert.equal(state.status, 'VERIFIED')
        await command('submit', root + '/' + task.id + '/submissions', {
          originId: crypto.randomUUID(), startOriginId: current.firstStartOriginId, captureType: 'MEASUREMENT',
          measurements: [{ sampleId: tag, type: 'Area', value: null, state: 'UNKNOWN', unknownReason: 'Kiểm thử, chưa đo hiện trường', dimension: 'AREA', unit: 'm²', locationReason: 'Không thu GPS thật', instrument: 'NONE_TEST_ONLY', method: 'SIMULATED_TEST_NO_PHYSICAL_MEASUREMENT', notes: tag + ': không phải số đo thực' }],
          locationProof: { kind: 'UNKNOWN', checklist: tag + ': không xác nhận vị trí thực địa' },
          evidence: [{ captureOriginId: crypto.randomUUID(), fileId: upload.fileId, purpose: 'MEASUREMENT', checksumSha256, mediaType: 'image/png', attemptChecklist: tag + ': ảnh PNG tổng hợp, không chụp hiện trường' }]
        }, current.version)
      }
    }
    handoff.push({ tag, projectId, task: (await request(pm, root + '/' + task.id)).data, createKey: `${tag}-create` })
  }
  console.log(JSON.stringify({ marker, handoffField: handoff }, null, 2))
}

async function prepareReporterHandoff() {
  const reporter = await login('reporter-a')
  const supervisor = await login('supervisor')
  const pm = await login('pm-a')
  const projectId = '72f84201-c001-4000-8000-000000000001'
  const result = []
  for (let index = 1; index <= 2; index++) {
    const tag = `${marker}${process.argv.includes('--automation') ? '-AUTO' : ''}-REPORT-${index}`
    // Reuse persisted test identity if interrupted; do not submit another report.
    let reports = readSql(`SELECT Id FROM Reports WHERE Description LIKE '${tag}%'`)
    if (!reports.length) {
      const content = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
      const checksumSha256 = crypto.createHash('sha256').update(content).digest('hex')
      const uploadKey = `${tag}-upload`
      if (!ledger[uploadKey]) { ledger[uploadKey] = await request(reporter, '/api/v1/reporter-evidence/uploads', 'POST', { fileName: `${tag}-synthetic.png`, mediaType: 'image/png', sizeBytes: content.length, checksumSha256 }, uploadKey); saveLedger() }
      const upload = ledger[uploadKey]
      const root = '/api/v1/reporter-evidence/uploads/' + upload.data.id
      const current = await request(reporter, root)
      if (current.data.status !== 'VERIFIED') {
        const parts = await request(reporter, root + '/part-urls', 'POST', { partNumbers: [1] }, `${tag}-part-${crypto.randomUUID()}`)
        const put = await fetch(parts.data.parts[0].url, { method: 'PUT', body: content })
        assert.ok(put.ok, 'Object upload failed')
        const eTag = put.headers.get('etag')
        assert.ok(eTag)
        await request(reporter, root + '/complete', 'POST', { parts: [{ partNumber: 1, eTag }], checksumSha256 }, `${tag}-complete`, (await request(reporter, root)).data.version)
      }
      let file
      for (let attempt = 0; attempt < 45; attempt++) {
        file = (await request(reporter, '/api/v1/reporter-evidence/files/' + upload.data.fileId)).data
        if (file.status === 'VERIFIED') break
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      assert.equal(file.status, 'VERIFIED')
      const report = await request(reporter, '/api/v1/reports', 'POST', {
        description: `${tag}: Dữ liệu kiểm thử giao diện ${index === 1 ? 'phản ánh mặt đường' : 'phản ánh lề đường'}; ảnh PNG tổng hợp, không phải sự kiện/ảnh hiện trường thật. Vị trí UNKNOWN, không xác nhận kích thước hoặc mức độ. Dành cho Hoàng tự xử lý.`,
        evidence: [{ fileId: upload.data.fileId, fileVersion: file.version, locationSource: 'UNKNOWN' }]
      }, `${tag}-report`)
      reports = [{ Id: report.data.id }]
    }
    const reportId = reports[0].Id
    const links = readSql(`SELECT CaseId FROM CaseReportLinks WHERE ReportId='${reportId}' AND EndedAt IS NULL`)
    assert.equal(links.length, 1)
    const caseId = links[0].CaseId
    let incident = await request(supervisor, '/api/v1/cases/' + caseId)
    if (!incident.data.projectId) {
      await assert.rejects(request(pm, '/api/v1/cases/' + caseId + '/triage', 'POST', { projectId, verificationMethod: 'EXISTING_EVIDENCE', reason: `${tag}: kiểm tra quyền PM không triage unassigned` }, `${tag}-pm-denied`, incident.etag), error => error.status === 403)
      await request(supervisor, '/api/v1/cases/' + caseId + '/triage', 'POST', { projectId, verificationMethod: 'EXISTING_EVIDENCE', reason: `${tag}: gán dự án test cho PM; chưa kết luận hoặc tạo FIELD` }, `${tag}-triage`, incident.etag)
    }
    incident = await request(pm, '/api/v1/cases/' + caseId)
    const own = (await request(reporter, '/api/v1/reports/' + reportId)).data
    const evidence = readSql(`SELECT Id,FileId,FileVersion,VerificationState FROM ReportOriginalEvidence WHERE ReportId='${reportId}'`)
    assert.equal(incident.data.status, 'OPEN'); assert.equal(evidence.length, 1)
    assert.ok(own.evidence.length)
    result.push({ tag, reportId, caseId, projectId, status: incident.data.status, version: incident.data.version, evidence, identity: { report: `${tag}-report`, triage: `${tag}-triage` } })
  }
  console.log(JSON.stringify({ marker, handoffReports: result }, null, 2))
}
if (require.main === module) {
  const run = process.argv[2] === '--prepare-unassigned-three' ? prepareUnassignedThree : process.argv[2] === '--prepare-reporter-handoff' ? prepareReporterHandoff : process.argv[2] === '--prepare-field-handoff' ? prepareFieldHandoff : null
  if (!run) throw new Error('Explicit --prepare-unassigned-three, --prepare-reporter-handoff or --prepare-field-handoff required; writes development test data through official APIs.')
  run().catch(error => { console.error(error.message, error.status || '', error.data?.code || ''); process.exitCode = 1 })
}
