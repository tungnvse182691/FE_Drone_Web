// E2 — Case: (L) nhãn "Đã ghi nhận" tách khỏi Case OPEN; (M) Case OPEN sau bổ sung hiện "Đã mở lại do có bổ sung".
// Bước chuẩn bị dựng dữ liệu bằng API thật (chỉ dữ liệu test, tiền tố [TEST-FE]); các bước sau kiểm giao diện.
// Chạy: RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e2-case.mjs [prep|ui|all]
import { open, login, go, apiGet, account, report, bodyText, sleep, PROJECT_A, clickByText } from './lib.mjs'

const STEP = process.argv[2] || 'all'
const API = process.env.RG_API || 'https://localhost:18443/api/v1'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const results = []
const check = (t, ok, d) => { results.push(ok); report(t, ok, d) }

// POST/PUT trong phiên trình duyệt (cookie + CSRF + Idempotency-Key + If-Match).
const send = (page, method, path, body, ifMatch) => page.evaluate(async (m, p, b, im) => {
  const c = await (await fetch('/api/v1/auth/web/csrf', { credentials: 'include' })).json()
  const h = { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': c.requestToken, 'Idempotency-Key': crypto.randomUUID() }
  if (im) h['If-Match'] = im
  const r = await fetch('/api/v1' + p, { method: m, credentials: 'include', headers: h, body: b === undefined ? undefined : JSON.stringify(b) })
  let data = null; try { data = await r.json() } catch { /* rỗng */ }
  return { status: r.status, data, etag: r.headers.get('etag') }
}, method, path, body, ifMatch)

const reporterFetch = async (token, method, path, body, ifMatch) => {
  const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, 'Idempotency-Key': crypto.randomUUID() }
  if (ifMatch) h['If-Match'] = ifMatch
  const r = await fetch(API + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  let data = null; try { data = await r.json() } catch { /* rỗng */ }
  return { status: r.status, data, etag: r.headers.get('etag') }
}

async function prep() {
  const rep = account('reporter-a')
  const lg = await reporterFetch('', 'POST', '/auth/android/login', { email: rep.email, password: rep.password })
  const token = lg.data?.accessToken || lg.data?.token
  if (!token) throw new Error('Reporter login lỗi: ' + lg.status + ' ' + JSON.stringify(lg.data).slice(0, 160))
  const own = await reporterFetch(token, 'GET', '/reports?limit=20')
  const reports = own.data?.items || []
  console.log('reporter reports:', reports.map((r) => r.id.slice(0, 8) + ':' + (r.caseId || '').slice(0, 8)).join(', '))
  if (!reports.length) throw new Error('Reporter-a không có report nào để dựng Case')
  console.log('own report keys:', Object.keys(reports[0]).join(','))
  const sup = await open(); await login(sup.page, 'supervisor')
  const inbox = (await apiGet(sup.page, '/cases?pageSize=100')).body?.items || []
  const inA = (await apiGet(sup.page, '/cases?projectId=' + PROJECT_A + '&pageSize=100')).body?.items || []
  const all = [...inbox, ...inA]
  console.log('cases:', all.map((x) => x.id.slice(0, 8) + ':' + x.status + ':' + (x.reportIds || []).map((r) => r.slice(0, 8)).join('|')).join(' ; '))
  const found = all.find((x) => (x.reportIds || []).some((r) => reports.some((q) => q.id === r)))
  if (!found) throw new Error('Không tìm thấy Case chứa report của reporter-a')
  const caseId = found.id
  const target = reports.find((q) => found.reportIds.includes(q.id))
  let c = (await apiGet(sup.page, `/cases/${caseId}`))
  console.log('case', caseId.slice(0, 8), c.status, c.body?.status, 'conclusion', c.body?.conclusion?.outcome)
  if (c.body?.status === 'UNASSIGNED') {
    const t = await send(sup.page, 'POST', `/cases/${caseId}/triage`, { projectId: PROJECT_A, verificationMethod: 'EXISTING_EVIDENCE', reason: '[TEST-FE] Phân loại Case thử nghiệm E2' }, `"${c.body.version.replace(/"/g, '')}"`)
    console.log('triage', t.status, t.data?.status || JSON.stringify(t.data).slice(0, 200))
    c = await apiGet(sup.page, `/cases/${caseId}`)
  }
  await sup.browser.close()
  const pm = await open(); await login(pm.page, 'pm-a')
  c = await apiGet(pm.page, `/cases/${caseId}`)
  if (c.body?.status === 'OPEN' && !c.body?.conclusion?.outcome) {
    const rp = await apiGet(pm.page, `/cases/${caseId}/reports`)
    const ev = rp.body?.items?.[0]?.originalEvidence?.[0]?.evidenceId
    console.log('evidence', ev)
    const k = await send(pm.page, 'POST', `/cases/${caseId}/conclusions`, { outcome: 'NO_DEFECT', reason: '[TEST-FE] Báo sai thử nghiệm E2', evidenceIds: [ev], defectIds: [] }, `"${c.body.version.replace(/"/g, '')}"`)
    console.log('conclusion NO_DEFECT', k.status, k.data?.status || JSON.stringify(k.data).slice(0, 200))
    c = await apiGet(pm.page, `/cases/${caseId}`)
  }
  console.log('sau kết luận:', c.body?.status, c.body?.conclusion?.outcome)
  await pm.browser.close()
  if (c.body?.status === 'CONCLUDED') {
    const rr = await reporterFetch(token, 'GET', `/reports/${target.id}`)
    const sp = await reporterFetch(token, 'POST', `/reports/${target.id}/supplements`, { description: '[TEST-FE] Bổ sung sau kết luận báo sai (E2)', evidence: (rr.data?.evidence || []).slice(0, 1).map((e) => ({ fileId: e.fileId, fileVersion: e.fileVersion, locationSource: 'UNKNOWN' })) }, rr.etag || `"${String(rr.data?.version).replace(/"/g, '')}"`)
    console.log('supplement', sp.status, JSON.stringify(sp.data).slice(0, 200))
  }
  const fin = await open(); await login(fin.page, 'pm-a')
  const f = await apiGet(fin.page, `/cases/${caseId}`)
  console.log('Case cuối:', f.body?.status, 'conclusion', f.body?.conclusion?.outcome, 'defectIds', JSON.stringify(f.body?.defectIds))
  await fin.browser.close()
  return caseId
}

async function prepL() {
  const rep = account('reporter-a')
  const lg = await reporterFetch('', 'POST', '/auth/android/login', { email: rep.email, password: rep.password })
  const token = lg.data?.accessToken || lg.data?.token
  const own = (await reporterFetch(token, 'GET', '/reports?limit=50')).data?.items || []
  // Mỗi lần chạy tạo một Report mới (nguồn sạch, chưa có quyết định); ảnh tham chiếu lại tệp đã VERIFIED của chính reporter.
  const ev = own.find((x) => x.evidence?.length)?.evidence[0]
  const nr = await reporterFetch(token, 'POST', '/reports', { description: '[TEST-FE] Báo cáo có vị trí cho kiểm thử E2-L2 ' + new Date().toISOString(), evidence: [{ fileId: ev.fileId, fileVersion: ev.fileVersion, locationSource: 'MANUAL', capturedAt: new Date().toISOString(), location: { latitude: 9.9498, longitude: 105.001, accuracyMeters: 5 } }] })
  console.log('report mới', nr.status)
  if (nr.status !== 201) throw new Error('Tạo report lỗi: ' + JSON.stringify(nr.data).slice(0, 200))
  const mine = nr.data
  const sup = await open(); await login(sup.page, 'supervisor')
  let all = []
  for (const q of ['/cases?pageSize=100', '/cases?projectId=' + PROJECT_A + '&pageSize=100']) all = all.concat((await apiGet(sup.page, q)).body?.items || [])
  const found = all.find((x) => (x.reportIds || []).includes(mine.id))
  if (!found) throw new Error('Không tìm thấy Case của report mới')
  if (found.status === 'UNASSIGNED') {
    // Phạm vi hình học do BE công bố: tuyến hiện hành + bộ phân đoạn PUBLISHED + phiên bản geometry-package (không tự bịa).
    const wp = (await apiGet(sup.page, '/projects/' + PROJECT_A + '/work-package')).body
    let pins = null
    for (const rs of wp?.roadSections || []) {
      const sets = (await apiGet(sup.page, '/projects/' + PROJECT_A + '/road-sections/' + rs.roadSectionId + '/versions/' + rs.currentVersionId + '/segment-sets')).body?.items || []
      const set = sets.find((x) => x.status === 'PUBLISHED')
      if (set) { pins = { routeVersionId: rs.currentVersionId, segmentSetId: set.id }; break }
    }
    if (!pins) throw new Error('Không có bộ phân đoạn PUBLISHED để phân loại Case có phạm vi')
    const gp = await sup.page.evaluate(async (p, q) => { const r = await fetch('/api/v1/projects/' + p + '/geometry-package?routeVersionId=' + q.routeVersionId + '&segmentSetId=' + q.segmentSetId, { credentials: 'include' }); return { status: r.status, etag: r.headers.get('etag') } }, PROJECT_A, pins)
    console.log('geometry-package', gp.status, gp.etag)
    const t = await send(sup.page, 'POST', '/cases/' + found.id + '/triage', { projectId: PROJECT_A, verificationMethod: 'EXISTING_EVIDENCE', reason: '[TEST-FE] Phân loại Case E2-L2', ...pins, geometryVersion: (gp.etag || '').replace(/"/g, '') }, '"' + found.version.replace(/"/g, '') + '"')
    console.log('triage Case E2-L2', t.status, t.status >= 400 ? JSON.stringify(t.data).slice(0, 300) : '')
  }
  await sup.browser.close()
  return '#CAS-' + found.id.slice(0, 8).toUpperCase()
}

async function ui() {
  const { browser, page, log } = await open({ height: 3000 }); await login(page, 'pm-a')
  const list = (await apiGet(page, '/cases?projectId=' + PROJECT_A + '&pageSize=100')).body?.items || []
  const reopened = list.find((c) => c.status === 'OPEN' && c.conclusion?.outcome)
  check('Dữ liệu: có Case OPEN còn kết luận cũ (mở lại do bổ sung) ở BE', !!reopened, list.map((c) => c.status + ':' + (c.conclusion?.outcome || '-')).join(', '))
  await go(page, '/pm/ai-inbox', 12000)
  const t = await bodyText(page, 'main', 6000)
  check('M: danh sách hiện "Đã mở lại do có bổ sung"', /Đã mở lại do có bổ sung/.test(t), '')
  check('M: danh sách KHÔNG hiện "Báo sai" cho Case OPEN', !/Báo sai/.test(t), '')
  check('L: danh sách KHÔNG gán "Chờ thẩm định/Chờ xác minh" cho Case OPEN', !/Chờ thẩm định|Chờ xác minh/.test(t), '')
  // Mở chi tiết Case đã mở lại
  const opened = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^\s*Thẩm định\s*$/.test(x.textContent) || /Thẩm định/.test(x.textContent)); if (!b) return 'no-btn'; b.click(); return 'clicked' })
  await sleep(6000)
  const d = await bodyText(page, 'body', 12000)
  check('M: chi tiết có banner "ĐÃ MỞ LẠI DO CÓ BỔ SUNG" (mở được bằng nút Thẩm định)', opened === 'clicked' && /ĐÃ MỞ LẠI DO CÓ BỔ SUNG/.test(d), opened)
  check('M: chi tiết KHÔNG còn banner "KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (BÁO SAI)" hiện tại', !/KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT/.test(d), '')
  check('M: kết luận cũ nằm trong "Lịch sử kết luận"', /Lịch sử kết luận/.test(d), '')
  const toastBefore = log.dialogs.length
  const form = await page.evaluate(() => /Xác nhận có khiếm khuyết|Báo sai|Kết luận|Ghi nhận khiếm khuyết|Không có khiếm khuyết/.test(document.body.innerText))
  check('M: form thẩm định cho Case OPEN hiển thị (không chỉ toast)', form, '')
  check('PM: không lỗi JS (Case mở lại)', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

// L — dùng Case OPEN chưa có kết luận của Project B (pm-b): ghi nhận KEEP_NEW qua giao diện thật,
// rồi danh sách phải hiện "Đã ghi nhận" + trạng thái Defect tách riêng (đọc lại từ BE).
const cardText = (page, code) => page.evaluate((c) => {
  const el = [...document.querySelectorAll('main *')].filter((e) => e.children.length < 4 && e.textContent.includes(c)).pop()
  let n = el
  while (n && n.parentElement && !(n.querySelectorAll('button').length && n.innerText.length > 80)) n = n.parentElement
  return (n?.innerText || '').split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean).join(' | ').slice(0, 600)
}, code)

async function uiL() {
  const code = await prepL()
  const { browser, page, log } = await open({ height: 3500 }); await login(page, 'pm-a')
  await go(page, '/pm/ai-inbox', 12000)
  const before = await bodyText(page, 'main', 6000)
  const beforeCard = await cardText(page, code)
  check('L: trước khi quyết định, thẻ Case OPEN hiện "chưa có quyết định" (không phải "Chờ thẩm định")', /chưa có quyết định/i.test(beforeCard) && !/Chờ thẩm định|Chờ xác minh/.test(beforeCard), code + ' → ' + beforeCard)
  const opened = await page.evaluate((c) => { const el = [...document.querySelectorAll('main *')].filter((e) => e.children.length < 4 && e.textContent.includes(c)).pop(); let n = el; let b = null; while (n && !b) { b = [...n.querySelectorAll('button')].find((x) => /Thẩm định|Xem chi tiết/.test(x.textContent)); n = n.parentElement } if (!b) return 'no-btn'; b.click(); return 'clicked' }, code)
  await sleep(7000)
  let decisionBody = ''
  page.on('response', async (r) => { if (r.url().includes('/candidate-decisions') && r.request().method() === 'POST') { try { decisionBody = r.status() + ' ' + (await r.text()).slice(0, 500) } catch { /* ignore */ } } })
  const setSel = (label, text) => page.evaluate((l, t) => { const el = document.querySelector('[aria-label="' + l + '"]'); if (!el) return 'no ' + l; const o = [...el.options].find((x) => x.value && (!t || t.test(x.text))); if (!o) return 'empty ' + l; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, o.value); el.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' }, label, text)
  const out = []
  out.push(await setSel('Report nguồn ghi nhận khiếm khuyết'), await setSel('Loại lỗi'), await setSel('Mức độ nghiêm trọng'))
  // Chọn tuyến đầu tiên có bộ phân đoạn đã công bố.
  const roads = await page.evaluate(() => [...(document.querySelector('[aria-label="Tuyến ghi nhận khiếm khuyết"]')?.options || [])].filter((x) => x.value).map((x) => x.value))
  let setOk = false
  for (const road of roads) {
    await page.evaluate((v) => { const el = document.querySelector('[aria-label="Tuyến ghi nhận khiếm khuyết"]'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })) }, road)
    await sleep(6000)
    if ((await setSel('Bộ phân đoạn ghi nhận khiếm khuyết')) === 'ok') { setOk = true; break }
  }
  out.push('tuyến/bộ phân đoạn ' + (setOk ? 'ok' : 'KHÔNG CÓ bộ phân đoạn'))
  await page.evaluate(() => { const t = document.querySelector('[aria-label="Lý do ghi nhận khiếm khuyết"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, '[TEST-FE] Ghi nhận khiếm khuyết thử nghiệm E2'); t.dispatchEvent(new Event('input', { bubbles: true })) })
  await sleep(1500)
  console.log('điền form KEEP_NEW:', out.join(', '))
  const w0 = log.writes.length
  const sub = await clickByText(page, /Xác nhận ghi nhận khiếm khuyết/)
  await sleep(9000)
  const posts = log.writes.slice(w0).join('; ')
  check('L: POST candidate-decisions 201 (KEEP_NEW qua giao diện)', opened === 'clicked' && sub === 'clicked' && posts.includes('POST /projects/{id}/candidate-decisions 201'), [opened, sub, posts, decisionBody].join(' | '))
  await go(page, '/pm/dashboard', 4000)
  await go(page, '/pm/ai-inbox', 12000)
  const after = await cardText(page, code)
  console.log('Thẻ sau quyết định:', after)
  check('L: danh sách hiện nhãn "Đã ghi nhận" cho hồ sơ đã có quyết định', /Đã ghi nhận/.test(after), '')
  check('L: trạng thái Defect hiển thị riêng ("Defect: …")', /Defect: [A-Za-z]+/.test(after), '')
  check('L: sau quyết định không còn "Chưa có quyết định" cho hồ sơ đó', !/chưa có quyết định/i.test(after), '')
  check('PM-B: không lỗi JS', log.pageErrors.length === 0, log.pageErrors.join('; '))
  await browser.close()
}

if (STEP === 'prep' || STEP === 'all') await prep()
if (STEP === 'ui' || STEP === 'all') await ui()
if (STEP === 'l' || STEP === 'all') await uiL()
const failed = results.filter((x) => !x).length
if (results.length) console.log(failed ? `\n${failed}/${results.length} kiểm tra lỗi` : `\nĐạt ${results.length}/${results.length}`)
process.exit(failed ? 1 : 0)
