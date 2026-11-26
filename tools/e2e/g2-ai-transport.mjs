// G2: AI review — transport cookie cho ảnh, mã DET ổn định, ID sai báo rõ, lỗi 422 tại form, KEEP_NEW đọc lại sau F5 / phiên mới.
// pm-a, nhiệm vụ khảo sát SUBMITTED ở SBX-A. Tạo 1 lần chạy AI hợp lệ (synthetic-road-v1) + 1 lần chạy fixture sai; Chấp nhận 1 phát hiện của lần chạy mới.
import { open, login, go, apiGet, report, bodyText, clickByText, setNative, sleep, PROJECT_A } from './lib.mjs'

const results = []
const check = (title, ok, detail) => { results.push(ok); report(title, ok, detail) }
const GUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const MODEL = '72f84201-d033-4000-8000-000000000001'
const code6 = (id) => 'DET-' + id.replace(/-/g, '').slice(-6).toUpperCase()

const { browser, page, log } = await open({ height: 4600 })
await login(page, 'pm-a')
const fileReqs = []
page.on('request', (r) => { if (/\/api\/v1\/files\/[0-9a-f-]{36}\/content/i.test(r.url())) fileReqs.push({ url: r.url(), auth: r.headers()['authorization'] || '' }) })
const postDecisions = []
page.on('request', (r) => { if (r.method() === 'POST' && /\/candidate-decisions$/.test(r.url())) postDecisions.push(r.url()) })

async function openDatasetPanel() {
  await go(page, '/pm/surveys', 10000)
  const n = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent)).length)
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /Xem chi tiết/.test(b.textContent))[i].click(), i)
    await sleep(8000)
    if (await page.evaluate(() => !!document.querySelector('[aria-label="Bản nộp bộ dữ liệu"]'))) return true
    await clickByText(page, /Đóng lại/); await sleep(1000)
  }
  return false
}
const trackerRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="ai-run-row"]')].map((r) => ({ id: r.getAttribute('data-run-id'), status: r.getAttribute('data-status'), text: r.innerText.replace(/\s+/g, ' ') })))
async function fillAndRun(fixture) {
  await clickByText(page, /Đọc phiên bản hình học/); await sleep(6000)
  await setNative(page, '[aria-label="Mã phiên bản mô hình"]', MODEL)
  await setNative(page, '[aria-label="Phiên bản tiền xử lý"]', 'fixture-preprocess.v1')
  await setNative(page, '[aria-label="Phiên bản cấu hình"]', 'fixture-config.v1')
  await setNative(page, '[aria-label="Phiên bản fixture"]', fixture)
  await sleep(600)
  const w0 = log.writes.length, f0 = log.failures.length
  await clickByText(page, /Chạy AI mock/)
  await sleep(4500)
  return { writes: log.writes.slice(w0), failures: log.failures.slice(f0) }
}

// ---------- 1. Lỗi 422 hiện ngay tại form (fixture sai) ----------
const opened = await openDatasetPanel()
check('Mở được panel bộ dữ liệu của nhiệm vụ SUBMITTED', opened, '')
const bad = await fillAndRun('no-such-fixture-v9')
const formErr = await page.evaluate(() => document.querySelector('[data-testid="ai-run-create-error"]')?.innerText.replace(/\s+/g, ' ') || '')
const posted = bad.writes.find((x) => /ai-mock-runs/.test(x)) || ''
console.log('  POST sai fixture:', posted, '| form:', formErr.slice(0, 400))
if (/ 422$/.test(posted)) {
  check('422: thông báo thấy ngay tại form, có code', /HTTP 422/.test(formErr) && /ai_contract_invalid|mock_|_invalid|_mismatch/.test(formErr), formErr.slice(0, 160))
  check('422: có reasonCode, bước, hướng xử lý và correlationId', /reasonCode \S+/.test(formErr) && /bước \S+/.test(formErr) && /Hướng xử lý/.test(formErr) && GUID.test(formErr.split('correlationId')[1] || ''), formErr.slice(0, 400))
} else check('POST fixture sai bị BE từ chối bằng 4xx', /4\d\d$/.test(posted) ? !!formErr : false, `${posted} | ${formErr.slice(0, 200)}`)
const gt = (await page.evaluate(() => document.querySelector('[data-testid="ai-run-create-error"]') ? 'visible' : 'none'))
check('Lỗi nằm trong khối form tạo lần chạy (data-testid ai-run-create-error)', gt === 'visible', gt)

// Retry hợp lệ sau lỗi: không còn trạng thái chặn cũ
const before = await trackerRows()
const good = await fillAndRun('synthetic-road-v1')
check('Retry sau lỗi: POST ai-mock-runs 202 và lỗi cũ biến mất', good.writes.some((x) => /ai-mock-runs 202/.test(x)) && !(await page.evaluate(() => !!document.querySelector('[data-testid="ai-run-create-error"]'))), good.writes.join('; ') + ' ' + good.failures.join('; '))
const msg = await page.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((e) => e.innerText).join(' | '))
const runId = (msg.match(GUID) || [])[0]
check('Hiển thị runId của lần chạy mới', !!runId, msg.slice(0, 160))
let status = ''
for (let i = 0; i < 40 && status !== 'SUCCEEDED' && status !== 'FAILED'; i++) { await sleep(3000); status = (await trackerRows()).find((r) => r.id === runId)?.status }
check('Lần chạy mới SUCCEEDED', status === 'SUCCEEDED', status)
const rowText = (await trackerRows()).find((r) => r.id === runId)?.text || ''
check('Tracker hiển thị originCorrelationId của run (từ GET run)', GUID.test((rowText.split('originCorrelationId):')[1] || '')), rowText.slice(0, 220))
const run = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${runId}`)).body
const result = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${runId}/result`)).body
const dets = result?.detections || []
check('Run mới có phát hiện', dets.length > 0, `${dets.length} phát hiện`)
const detId = dets[0]?.detectionId
const taskId = run?.surveyTaskId, datasetId = run?.datasetId
const cand0 = (await apiGet(page, `/projects/${PROJECT_A}/ai-candidates/${detId}`))
check('GET ai-candidates bằng cookie: 200, chưa có disposition', cand0.status === 200 && !cand0.body?.disposition, `status=${cand0.status}`)

// ---------- 2. Danh sách: mã DET ổn định, URL giữ run/dataset/det, ảnh tải bằng cookie ----------
const base = `/pm/surveys/${taskId}?run=${runId}&dataset=${datasetId}`
await go(page, base, 1000) // pushState chỉ đổi path; dùng reload để áp query
await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}${base}`, { waitUntil: 'networkidle2' }); await sleep(9000)
const listText = await bodyText(page, 'main', 6000)
check('Danh sách hiển thị mã ổn định suy ra từ detectionId', listText.includes(code6(detId)), code6(detId))
check('Danh sách không dùng số thứ tự DET-01/DET-02', !/DET-0[0-9]\b/.test(listText), '')
await page.evaluate((c) => { const el = [...document.querySelectorAll('section span')].filter((e) => e.textContent.trim() === c).pop(); let n = el; while (n && getComputedStyle(n).cursor !== 'pointer') n = n.parentElement; (n || el).click() }, code6(detId))
await sleep(2500)
let u = new URL(page.url())
check('Chọn phát hiện ghi det=<detectionId> cùng run/dataset trên URL', u.searchParams.get('det') === detId && u.searchParams.get('run') === runId && u.searchParams.get('dataset') === datasetId, u.search)
const verifyHref = await page.evaluate(() => [...document.querySelectorAll('a')].map((x) => x.getAttribute('href') || '').find((h) => /\/defects\/[^/]+\/verify-a/.test(h)) || '')
check('Link sang chi tiết mang detectionId + run + dataset', verifyHref.includes(detId) && verifyHref.includes(`run=${runId}`) && verifyHref.includes(`dataset=${datasetId}`), verifyHref)

// F5 giữ đúng detection + run
await page.reload({ waitUntil: 'networkidle2' }); await sleep(9000)
u = new URL(page.url())
const banner = await page.evaluate(() => document.querySelector('[data-testid="ai-run-scope-banner"]')?.innerText || '')
check('F5: giữ run, dataset, det và banner đúng lần chạy', u.searchParams.get('det') === detId && banner.includes(runId.slice(0, 8)), u.search)
const selectedOpen = await page.evaluate((c) => [...document.querySelectorAll('main a')].some((a) => /verify-a/.test(a.getAttribute('href') || '')), 0)
check('F5: phát hiện đúng đang được mở rộng (có link chi tiết của nó)', selectedOpen, '')

// ID det sai trên URL: báo rõ, không chọn bản ghi đầu
const fakeDet = '00000000-0000-4000-8000-0000000000aa'
await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}${base}&det=${fakeDet}`, { waitUntil: 'networkidle2' }); await sleep(9000)
const nf = await page.evaluate(() => document.querySelector('[data-testid="ai-detection-not-found"]')?.innerText || '')
const openLinks = await page.evaluate(() => [...document.querySelectorAll('main a')].filter((a) => /verify-a/.test(a.getAttribute('href') || '')).length)
check('ID phát hiện sai trên URL: báo rõ, không chọn bản ghi nào', /Không tìm thấy phát hiện AI/.test(nf) && nf.includes(fakeDet) && openLinks === 0, nf.slice(0, 160) + ` | links=${openLinks}`)

// Chi tiết với ID sai
await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}/pm/defects/${fakeDet}/verify-a`, { waitUntil: 'networkidle2' }); await sleep(30000)
const dtxt = await bodyText(page, 'main', 800)
check('Chi tiết với ID sai: báo không tìm thấy, không hiện bản ghi đầu / nút Chấp nhận', /Không tìm thấy phát hiện AI hoặc Defect/.test(dtxt) && !/Chấp nhận/.test(dtxt), dtxt.slice(0, 200))

// ---------- 3. Chi tiết đúng: mã trùng danh sách, ảnh bằng cookie ----------
fileReqs.length = 0
await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}/pm/defects/${detId}/verify-a?run=${runId}&dataset=${datasetId}`, { waitUntil: 'networkidle2' }); await sleep(10000)
const detail = await bodyText(page, 'main', 3000)
check('Chi tiết hiển thị cùng mã với danh sách', detail.includes(code6(detId)), code6(detId))
check('Ảnh khung hình: GET files/{id}/content bằng cookie, không có Authorization Bearer', fileReqs.length > 0 && fileReqs.every((r) => !r.auth), JSON.stringify(fileReqs.map((r) => ({ u: r.url.split('/api/v1')[1], auth: !!r.auth }))))
const imgErr = await page.evaluate(() => document.querySelector('[data-testid="ai-frame-image-error"]')?.innerText || '')
check('Không có lỗi tải ảnh', !imgErr, imgErr.slice(0, 200))
const failFiles = log.failures.filter((f) => /\/files\//.test(f))
check('Không có phản hồi 4xx từ /files', failFiles.length === 0, failFiles.join('; '))

// ---------- 4. Chấp nhận (KEEP_NEW) qua UI ----------
postDecisions.length = 0
const w0 = log.writes.length
const acc = await clickByText(page, /Chấp nhận\s*$/)
await sleep(9000)
const dw = log.writes.slice(w0).filter((x) => /candidate-decisions/.test(x))
check('Chấp nhận: POST candidate-decisions thành công', acc === 'clicked' && dw.some((x) => / 20[01]$/.test(x)), `${acc} ${dw.join('; ')}`)
const cand1 = (await apiGet(page, `/projects/${PROJECT_A}/ai-candidates/${detId}`)).body
const decId = cand1?.disposition?.decisionId
const dec = decId ? (await apiGet(page, `/projects/${PROJECT_A}/candidate-decisions/${decId}`)).body : null
check('BE: candidate có disposition → decision KEEP_NEW + defectId', dec?.decision === 'KEEP_NEW' && !!dec?.defectId, JSON.stringify({ decId, decision: dec?.decision, defectId: dec?.defectId }))
const defectId = dec?.defectId
const defect = defectId ? (await apiGet(page, `/projects/${PROJECT_A}/defects/${defectId}`)).body : null
console.log('  Defect:', defectId, defect?.status, 'candidateETag(sourceVersion)=', cand1?.sourceVersion, 'decisionVersion=', dec?.version, 'defectVersion=', defect?.version)

// ---------- 5. F5 → vẫn KEEP_NEW + Defect, không POST thêm ----------
postDecisions.length = 0
await page.reload({ waitUntil: 'networkidle2' }); await sleep(11000)
const afterF5 = await bodyText(page, 'main', 3000)
check('F5 chi tiết: hiện đã có quyết định (không còn "Mới phát hiện"), khóa ghi trùng', !/Mới phát hiện/.test(afterF5) && !(await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => /Chấp nhận$/.test(b.textContent.trim()) && !b.disabled))), afterF5.slice(0, 260))
check('F5: không gọi lại POST candidate-decisions để khôi phục', postDecisions.length === 0, String(postDecisions.length))
await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}${base}&det=${detId}`, { waitUntil: 'networkidle2' }); await sleep(10000)
const listAfter = await page.evaluate((c) => { const card = [...document.querySelectorAll('section span')].filter((e) => e.textContent.trim() === c).pop(); let n = card; for (let i = 0; i < 8 && n; i++) { if (/Đã duyệt|Mới|Chờ/.test(n.innerText) && n.innerText.length < 600) return n.innerText.replace(/\s+/g, ' '); n = n.parentElement } return '' }, code6(detId))
check('F5 danh sách: thẻ hiện "Đã duyệt → #DEF-…" (không phải trạng thái chờ)', /Đã duyệt/.test(listAfter) && listAfter.includes(defectId.slice(0, 8).toUpperCase()), listAfter.slice(0, 200))
check('F5: đúng 0 POST thêm và BE vẫn đúng 1 quyết định cho phát hiện', postDecisions.length === 0 && (await apiGet(page, `/projects/${PROJECT_A}/ai-candidates/${detId}`)).body?.disposition?.decisionId === decId, '')

// ---------- 6. Một lỗi 403/401 trên một candidate không chặn candidate khác; thử lại hoạt động ----------
const others = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs`)).body.items.filter((r) => r.status === 'SUCCEEDED' && r.surveyTaskId === taskId)
let otherDet = null
for (const r of others) { const rr = (await apiGet(page, `/projects/${PROJECT_A}/ai-mock-runs/${r.id}/result`)).body; const d = (rr?.detections || []).find((x) => x.detectionId !== detId); if (d) { otherDet = { id: d.detectionId, run: r.id }; break } }
if (!otherDet) check('Có phát hiện thứ hai để kiểm lỗi cô lập', false, 'BLOCKED: không có phát hiện khác')
else {
  // Kỹ thuật kiểm thử trình duyệt: chặn riêng GET ai-candidates của MỘT phát hiện và trả 403 giả; không đổi dữ liệu BE.
  await page.setRequestInterception(true)
  let inject = true
  const hits = []
  const handler = (req) => {
    if (inject && req.method() === 'GET' && req.url().includes(`/ai-candidates/${otherDet.id}`)) { hits.push(req.url()); return req.respond({ status: 403, contentType: 'application/problem+json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ status: 403, code: 'access_forbidden', correlationId: '11111111-2222-4333-8444-555555555555' }) }) }
    return req.continue()
  }
  page.on('request', handler)
  await page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}/pm/surveys/${taskId}?run=${otherDet.run}&dataset=${datasetId}`, { waitUntil: 'networkidle2' }); await sleep(9000)
  const txt = await bodyText(page, 'main', 9000)
  const unknownNote = await page.evaluate(() => [...document.querySelectorAll('[data-testid="ai-detection-state-unknown"]')].map((e) => e.innerText.replace(/\s+/g, ' ')).join(' || '))
  check('403 một candidate: hiện "chưa xác định" kèm HTTP 403 + code + correlationId (không nói "chỉ nhận Bearer")', /Chưa xác định/.test(unknownNote) && /HTTP 403/.test(unknownNote) && /access_forbidden/.test(unknownNote) && /correlationId 11111111/.test(unknownNote) && !/chỉ nhận Bearer/.test(txt), unknownNote.slice(0, 260))
  check('Phát hiện có lỗi không hiện nút ghi: thẻ không bị coi là "chưa có quyết định"', /Chưa xác định/.test(unknownNote), '')
  inject = false
  const retry = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="ai-detection-state-unknown"] button')][0]; if (!b) return 'no-retry'; b.click(); return 'clicked' })
  await sleep(5000)
  const after = await page.evaluate(() => document.querySelectorAll('[data-testid="ai-detection-state-unknown"]').length)
  check('Thử lại sau khi hết lỗi hoạt động (không giữ trạng thái chặn cũ)', retry === 'clicked' && after === 0, `${retry} còn ${after} cảnh báo`)
  page.off('request', handler)
  await page.setRequestInterception(false)
}

check('PM: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
console.log(`\nIDs: run=${runId} det=${detId} task=${taskId} dataset=${datasetId} decision=${decId} defect=${defectId}`)

// ---------- 7. Phiên mới (đăng nhập lại) vẫn đọc đúng ----------
const second = await open({ height: 3000 })
await login(second.page, 'pm-a')
const c2 = (await apiGet(second.page, `/projects/${PROJECT_A}/ai-candidates/${detId}`)).body
check('Phiên đăng nhập mới: candidate vẫn trỏ đúng decision', c2?.disposition?.decisionId === decId, '')
const postsNew = []
second.page.on('request', (r) => { if (r.method() === 'POST' && /candidate-decisions/.test(r.url())) postsNew.push(r.url()) })
await second.page.goto(`${process.env.RG_BASE || 'http://localhost:5173'}${base}&det=${detId}`, { waitUntil: 'networkidle2' }); await sleep(11000)
const newList = await second.page.evaluate((c) => { const card = [...document.querySelectorAll('section span')].filter((e) => e.textContent.trim() === c).pop(); let n = card; for (let i = 0; i < 8 && n; i++) { if (/Đã duyệt|Mới|Chờ/.test(n.innerText) && n.innerText.length < 600) return n.innerText.replace(/\s+/g, ' '); n = n.parentElement } return '' }, code6(detId))
check('Phiên mới: danh sách hiện Đã duyệt + Defect, không POST', /Đã duyệt/.test(newList) && postsNew.length === 0, newList.slice(0, 160))
await second.browser.close()

await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
